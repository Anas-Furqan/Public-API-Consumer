import { NextRequest } from "next/server";
import {
  fetchJsonWithTimeout,
  toApiError,
  validateTextInput,
} from "@/lib/apiHelpers";
import type { AirQualitySnapshot } from "@/types";

const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5";

function buildAirQualitySnapshot(data: any): AirQualitySnapshot {
  const entry = Array.isArray(data.list) ? data.list[0] : null;
  return {
    aqi: entry?.main?.aqi ?? 1,
    components: {
      pm2_5: entry?.components?.pm2_5 ?? 0,
      pm10: entry?.components?.pm10 ?? 0,
      no2: entry?.components?.no2 ?? 0,
      o3: entry?.components?.o3 ?? 0,
      co: entry?.components?.co ?? 0,
    },
  };
}

export async function GET(request: NextRequest) {
  const cityParam = request.nextUrl.searchParams.get("city");
  const latParam = request.nextUrl.searchParams.get("lat");
  const lonParam = request.nextUrl.searchParams.get("lon");

  if (!cityParam || !latParam || !lonParam) {
    return Response.json(
      toApiError("INVALID_INPUT", "City, lat, and lon are required."),
      { status: 400 }
    );
  }

  const validation = validateTextInput(cityParam);
  if (!validation.ok) {
    return Response.json(validation.error, { status: 400 });
  }

  const lat = Number(latParam);
  const lon = Number(lonParam);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return Response.json(toApiError("INVALID_INPUT", "Invalid coordinates."), {
      status: 400,
    });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return Response.json(
      toApiError("API_TIMEOUT", "OpenWeather API key is not configured."),
      { status: 500 }
    );
  }

  const url = `${OPENWEATHER_BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  try {
    const { response, data } = await fetchJsonWithTimeout(url);
    if (!response.ok) {
      return Response.json(
        toApiError("API_TIMEOUT", "Air quality data unavailable."),
        { status: 502 }
      );
    }

    return Response.json(
      {
        data: buildAirQualitySnapshot(data),
        warnings: [],
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      toApiError("API_TIMEOUT", "Air quality request timed out."),
      { status: 504 }
    );
  }
}
