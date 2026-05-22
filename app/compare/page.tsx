"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "@/components/ui/Navbar";
import SkeletonCard from "@/components/ui/SkeletonCard";
import CityHeroCard from "@/components/dashboard/CityHeroCard";
import { calculateScore } from "@/lib/scoreEngine";
import { slugifyCity } from "@/lib/utils";
import type {
  AirQualitySnapshot,
  CountrySnapshot,
  DevMarketSnapshot,
  ForecastSummary,
  WeatherSnapshot,
} from "@/types";

const STORAGE_KEY = "city-life-pins";

type Pin = { name: string; slug: string };

type CityOverview = {
  weather: WeatherSnapshot | null;
  forecast: ForecastSummary | null;
  airQuality: AirQualitySnapshot | null;
  country: CountrySnapshot | null;
  devMarket: DevMarketSnapshot | null;
  overallScore: number;
};

const emptyOverview: CityOverview = {
  weather: null,
  forecast: null,
  airQuality: null,
  country: null,
  devMarket: null,
  overallScore: 0,
};

function computeOverallScore(overview: CityOverview) {
  if (!overview.weather) return 0;
  return calculateScore(
    {
      tempC: overview.weather.temperature,
      aqi: overview.airQuality?.aqi ?? 1,
      githubScore: overview.devMarket?.score ?? 0,
      languageScore: overview.country?.languageScore ?? 0,
    },
    { weather: 40, costOfLiving: 20, devMarket: 20, language: 20 }
  );
}

export default function ComparePage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [left, setLeft] = useState<CityOverview>(emptyOverview);
  const [right, setRight] = useState<CityOverview>(emptyOverview);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPins(JSON.parse(stored));
      } catch (error) {
        setPins([]);
      }
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (pins.length < 2) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const fetchCity = async (cityName: string): Promise<CityOverview> => {
        const weatherResponse = await fetch(`/api/weather?city=${cityName}`);
        const weatherPayload = await weatherResponse.json();
        const weather = weatherPayload.data?.weather ?? null;
        const forecast = weatherPayload.data?.forecast ?? null;
        if (!weather) return emptyOverview;

        const countryCode = weather.country;
        const countryName = new Intl.DisplayNames(["en"], {
          type: "region",
        }).of(countryCode);

        const [countryResponse, devResponse, airResponse] =
          await Promise.allSettled([
            fetch(`/api/country?country=${countryName ?? countryCode}`),
            fetch(`/api/devmarket?country=${countryName ?? countryCode}`),
            fetch(
              `/api/airquality?city=${slugifyCity(cityName)}&lat=${weather.coord.lat}&lon=${weather.coord.lon}`
            ),
          ]);

        const countryPayload =
          countryResponse.status === "fulfilled"
            ? await countryResponse.value.json()
            : null;
        const devPayload =
          devResponse.status === "fulfilled" ? await devResponse.value.json() : null;
        const airPayload =
          airResponse.status === "fulfilled" ? await airResponse.value.json() : null;

        const overview: CityOverview = {
          weather,
          forecast,
          country: countryPayload?.data ?? null,
          devMarket: devPayload?.data ?? null,
          airQuality: airPayload?.data ?? null,
          overallScore: 0,
        };

        overview.overallScore = computeOverallScore(overview);
        return overview;
      };

      const [leftData, rightData] = await Promise.all([
        fetchCity(pins[0].name),
        fetchCity(pins[1].name),
      ]);

      setLeft(leftData);
      setRight(rightData);
      setLoading(false);
    };

    void load();
  }, [pins]);

  const comparisonRows = useMemo(() => {
    if (!left.weather || !right.weather) return [];
    return [
      {
        metric: "Temperature",
        left: left.weather.temperature,
        right: right.weather.temperature,
        better: left.weather.temperature >= right.weather.temperature ? "left" : "right",
      },
      {
        metric: "AQI",
        left: left.airQuality?.aqi ?? 0,
        right: right.airQuality?.aqi ?? 0,
        better: (left.airQuality?.aqi ?? 6) <= (right.airQuality?.aqi ?? 6)
          ? "left"
          : "right",
      },
      {
        metric: "Population",
        left: left.country?.population ?? 0,
        right: right.country?.population ?? 0,
        better: (left.country?.population ?? 0) >= (right.country?.population ?? 0)
          ? "left"
          : "right",
      },
      {
        metric: "Dev Score",
        left: left.devMarket?.score ?? 0,
        right: right.devMarket?.score ?? 0,
        better: (left.devMarket?.score ?? 0) >= (right.devMarket?.score ?? 0)
          ? "left"
          : "right",
      },
      {
        metric: "Language Score",
        left: left.country?.languageScore ?? 0,
        right: right.country?.languageScore ?? 0,
        better: (left.country?.languageScore ?? 0) >=
          (right.country?.languageScore ?? 0)
          ? "left"
          : "right",
      },
      {
        metric: "Overall",
        left: left.overallScore,
        right: right.overallScore,
        better: left.overallScore >= right.overallScore ? "left" : "right",
      },
    ];
  }, [left, right]);

  const chartData = comparisonRows.map((row) => ({
    metric: row.metric,
    [pins[0]?.name ?? "City A"]: row.left,
    [pins[1]?.name ?? "City B"]: row.right,
  }));

  if (pins.length < 2) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-20 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Compare view
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            Pin two cities to compare
          </h1>
          <p className="mt-3 text-slate-400">
            Head back to a city dashboard and pin a second location.
          </p>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <div>
            {left.weather && left.country ? (
              <CityHeroCard
                weather={left.weather}
                countryName={left.country.name}
                region={left.country.region}
                flag={left.country.flag}
              />
            ) : null}
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-lg text-slate-300">
              VS
            </div>
          </div>
          <div>
            {right.weather && right.country ? (
              <CityHeroCard
                weather={right.weather}
                countryName={right.country.name}
                region={right.country.region}
                flag={right.country.flag}
              />
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">Metric comparison</p>
          <div className="mt-4 grid gap-4">
            {comparisonRows.map((row) => (
              <div key={row.metric} className="grid grid-cols-3 items-center">
                <div className="flex items-center gap-2 text-slate-200">
                  {row.better === "left" ? (
                    <Check className="h-4 w-4 text-emerald-300" />
                  ) : null}
                  <span>{row.left}</span>
                </div>
                <div className="text-center text-xs uppercase tracking-[0.2em] text-slate-500">
                  {row.metric}
                </div>
                <div className="flex items-center justify-end gap-2 text-slate-200">
                  <span>{row.right}</span>
                  {row.better === "right" ? (
                    <Check className="h-4 w-4 text-emerald-300" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">City metrics chart</p>
          <div className="mt-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20 }}>
                <XAxis dataKey="metric" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1f2937",
                    border: "1px solid #334155",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey={pins[0].name} fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey={pins[1].name} fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
