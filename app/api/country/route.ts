import { NextRequest } from "next/server";
import {
  fetchJsonWithTimeout,
  toApiError,
  validateTextInput,
} from "@/lib/apiHelpers";
import type { CountrySnapshot } from "@/types";

const COUNTRIES_BASE = "https://restcountries.com/v3.1/name";

function buildLanguageScore(languages: string[]) {
  if (languages.some((lang) => /english/i.test(lang))) return 100;
  if (languages.some((lang) => /spanish|french|portuguese/i.test(lang))) return 70;
  return 30;
}

function buildCountrySnapshot(entry: any): CountrySnapshot {
  const languages = entry.languages ? Object.values(entry.languages) : [];
  const currencies = entry.currencies ? Object.values(entry.currencies) : [];
  const currency = currencies[0] as { name?: string; symbol?: string } | undefined;

  return {
    name: entry.name?.common ?? "",
    flag: entry.flag ?? "",
    population: entry.population ?? 0,
    region: entry.region ?? "",
    subregion: entry.subregion ?? "",
    languages: languages as string[],
    currency: currency?.name ?? "",
    currencySymbol: currency?.symbol ?? "",
    languageScore: buildLanguageScore(languages as string[]),
  };
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

  const url = `${COUNTRIES_BASE}/${encodeURIComponent(
    validation.value
  )}?fields=name,flag,population,region,subregion,languages,currencies`;

  try {
    const { response, data } = await fetchJsonWithTimeout(url);
    if (!response.ok) {
      return Response.json(
        toApiError("CITY_NOT_FOUND", "Country not found."),
        { status: 404 }
      );
    }

    const entry = Array.isArray(data) ? data[0] : null;
    if (!entry) {
      return Response.json(
        toApiError("CITY_NOT_FOUND", "Country not found."),
        { status: 404 }
      );
    }

    return Response.json(
      {
        data: buildCountrySnapshot(entry),
        warnings: [],
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      toApiError("API_TIMEOUT", "Country data request timed out."),
      { status: 504 }
    );
  }
}
