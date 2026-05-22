import { NextRequest } from "next/server";
import {
  fetchJsonWithTimeout,
  toApiError,
  validateTextInput,
} from "@/lib/apiHelpers";
import type { DevMarketSnapshot } from "@/types";

const GITHUB_BASE = "https://api.github.com/search/repositories";
const DEV_MAX = 60000;

function buildDevMarketSnapshot(totalCount: number): DevMarketSnapshot {
  const score = Math.min(100, Math.round((totalCount / DEV_MAX) * 100));
  return { totalCount, score };
}

export async function GET(request: NextRequest) {
  const countryParam = request.nextUrl.searchParams.get("country");
  if (!countryParam) {
    return Response.json(toApiError("INVALID_INPUT", "Country is required."), {
      status: 400,
    });
  }

  const validation = validateTextInput(countryParam);
  if (!validation.ok) {
    return Response.json(validation.error, { status: 400 });
  }

  const query = encodeURIComponent(`stars:>100 location:${validation.value}`);
  const url = `${GITHUB_BASE}?q=${query}`;

  try {
    const { response, data } = await fetchJsonWithTimeout(url, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!response.ok) {
      return Response.json(
        toApiError("API_TIMEOUT", "GitHub data unavailable."),
        { status: 502 }
      );
    }

    const totalCount = Number(data.total_count ?? 0);

    return Response.json(
      {
        data: buildDevMarketSnapshot(totalCount),
        warnings: [],
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      toApiError("API_TIMEOUT", "GitHub request timed out."),
      { status: 504 }
    );
  }
}
