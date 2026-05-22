import { NextRequest } from "next/server";
import {
  fetchJsonWithTimeout,
  toApiError,
  validateTextInput,
} from "@/lib/apiHelpers";
import type { ForecastSummary } from "@/types";

const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5";

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
  const url = `${OPENWEATHER_BASE}/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const { response, data } = await fetchJsonWithTimeout(url);
    if (!response.ok) {
      if (response.status === 404) {
        return Response.json(
          toApiError("CITY_NOT_FOUND", "City not found."),
          { status: 404 }
        );
      }
      return Response.json(
        toApiError("API_TIMEOUT", "Forecast data unavailable."),
        { status: 502 }
      );
    }

    return Response.json(
      {
        data: buildForecastSummary(data),
        warnings: [],
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      toApiError("API_TIMEOUT", "Forecast request timed out."),
      { status: 504 }
    );
  }
}
