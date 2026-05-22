import { NextRequest } from "next/server";
import {
  fetchJsonWithTimeout,
  toApiError,
  validateTextInput,
} from "@/lib/apiHelpers";
import type { ForecastSummary, WeatherSnapshot } from "@/types";

const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5";

function buildWeatherSnapshot(data: any): WeatherSnapshot {
  return {
    name: data.name,
    country: data.sys?.country ?? "",
    coord: data.coord,
    temperature: data.main?.temp ?? 0,
    feelsLike: data.main?.feels_like ?? 0,
    humidity: data.main?.humidity ?? 0,
    windSpeed: data.wind?.speed ?? 0,
    condition: data.weather?.[0]?.main ?? "Clouds",
    icon: data.weather?.[0]?.icon ?? "01d",
  };
}

function buildForecastSummary(data: any): ForecastSummary {
  const list = Array.isArray(data.list) ? data.list : [];
  const dailyMap = new Map<string, { min: number; max: number; date: string }>();

  list.forEach((entry) => {
    const date = entry.dt_txt?.split(" ")[0];
    if (!date) return;
    const tempMin = entry.main?.temp_min ?? 0;
    const tempMax = entry.main?.temp_max ?? 0;
    const existing = dailyMap.get(date);
    if (!existing) {
      dailyMap.set(date, { min: tempMin, max: tempMax, date });
      return;
    }
    existing.min = Math.min(existing.min, tempMin);
    existing.max = Math.max(existing.max, tempMax);
  });

  const daily = Array.from(dailyMap.values())
    .slice(0, 5)
    .map((entry) => {
      const day = new Date(entry.date).toLocaleDateString("en-US", {
        weekday: "short",
      });
      return { day, min: entry.min, max: entry.max, date: entry.date };
    });

  const hourly = list.slice(0, 8).map((entry) => ({
    time: entry.dt_txt,
    temp: entry.main?.temp ?? 0,
    min: entry.main?.temp_min ?? 0,
    max: entry.main?.temp_max ?? 0,
  }));

  return { daily, hourly };
}

export async function GET(request: NextRequest) {
  const cityParam = request.nextUrl.searchParams.get("city");
  if (!cityParam) {
    return Response.json(toApiError("INVALID_INPUT", "City is required."), {
      status: 400,
    });
  }

  const validation = validateTextInput(cityParam);
  if (!validation.ok) {
    return Response.json(validation.error, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return Response.json(
      toApiError("API_TIMEOUT", "OpenWeather API key is not configured."),
      { status: 500 }
    );
  }

  const city = encodeURIComponent(validation.value);
  const weatherUrl = `${OPENWEATHER_BASE}/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `${OPENWEATHER_BASE}/forecast?q=${city}&appid=${apiKey}&units=metric`;

  const results = await Promise.allSettled([
    fetchJsonWithTimeout(weatherUrl),
    fetchJsonWithTimeout(forecastUrl),
  ]);

  const warnings: string[] = [];
  let weather: WeatherSnapshot | null = null;
  let forecast: ForecastSummary | null = null;

  const [weatherResult, forecastResult] = results;

  if (weatherResult.status === "fulfilled") {
    if (!weatherResult.value.response.ok) {
      if (weatherResult.value.response.status === 404) {
        return Response.json(
          toApiError("CITY_NOT_FOUND", "City not found."),
          { status: 404 }
        );
      }
      warnings.push("weather_unavailable");
    } else {
      weather = buildWeatherSnapshot(weatherResult.value.data);
    }
  } else {
    warnings.push("weather_unavailable");
  }

  if (forecastResult.status === "fulfilled") {
    if (!forecastResult.value.response.ok) {
      warnings.push("forecast_unavailable");
    } else {
      forecast = buildForecastSummary(forecastResult.value.data);
    }
  } else {
    warnings.push("forecast_unavailable");
  }

  if (!weather && !forecast) {
    return Response.json(
      toApiError("API_TIMEOUT", "Weather data is temporarily unavailable."),
      { status: 502 }
    );
  }

  return Response.json(
    {
      data: { weather, forecast },
      warnings,
    },
    { status: 200 }
  );
}
