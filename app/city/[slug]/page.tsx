"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import SkeletonCard from "@/components/ui/SkeletonCard";
import CityHeroCard from "@/components/dashboard/CityHeroCard";
import WeatherCard from "@/components/dashboard/WeatherCard";
import CountryStatsCard from "@/components/dashboard/CountryStatsCard";
import DevMarketCard from "@/components/dashboard/DevMarketCard";
import LiveScorePanel from "@/components/dashboard/LiveScorePanel";
import CompareSidebar from "@/components/dashboard/CompareSidebar";
import WeeklyForecastBarChart from "@/components/charts/WeeklyForecastBarChart";
import TemperatureLineChart from "@/components/charts/TemperatureLineChart";
import AirQualityRadarChart from "@/components/charts/AirQualityRadarChart";
import { aqiColors, aqiLabels } from "@/lib/constants";
import { slugifyCity } from "@/lib/utils";
import type {
  AirQualitySnapshot,
  CountrySnapshot,
  DevMarketSnapshot,
  ForecastSummary,
  WeatherSnapshot,
} from "@/types";

const emptyData = {
  weather: null as WeatherSnapshot | null,
  forecast: null as ForecastSummary | null,
  airQuality: null as AirQualitySnapshot | null,
  country: null as CountrySnapshot | null,
  devMarket: null as DevMarketSnapshot | null,
};

export default function CityDashboardPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const cityName = useMemo(
    () => decodeURIComponent(slug).replace(/-/g, " "),
    [slug]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(emptyData);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!cityName) return;
      setLoading(true);
      setError(null);

      try {
        const weatherResponse = await fetch(`/api/weather?city=${cityName}`);
        const weatherPayload = await weatherResponse.json();

        if (!weatherResponse.ok) {
          setError(weatherPayload?.message ?? "City not found.");
          setData(emptyData);
          return;
        }

        const weather = weatherPayload.data?.weather ?? null;
        const forecast = weatherPayload.data?.forecast ?? null;
        const weatherWarnings = weatherPayload.warnings ?? [];

        if (!weather) {
          setError("Weather data unavailable.");
          setData(emptyData);
          return;
        }

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

        const nextWarnings = [...weatherWarnings];

        if (countryResponse.status === "rejected" || !countryPayload?.data) {
          nextWarnings.push("country_unavailable");
        }
        if (devResponse.status === "rejected" || !devPayload?.data) {
          nextWarnings.push("devmarket_unavailable");
        }
        if (airResponse.status === "rejected" || !airPayload?.data) {
          nextWarnings.push("airquality_unavailable");
        }

        setWarnings(nextWarnings);
        setData({
          weather,
          forecast,
          country: countryPayload?.data ?? null,
          devMarket: devPayload?.data ?? null,
          airQuality: airPayload?.data ?? null,
        });
      } catch (err) {
        setError("The API is taking too long. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [cityName]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </main>
      </div>
    );
  }

  if (error || !data.weather) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-20 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Dashboard unavailable
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            {error ?? "City data could not be loaded."}
          </h1>
          <p className="mt-3 text-slate-400">
            Try searching again from the landing page.
          </p>
        </main>
      </div>
    );
  }

  const aqi = data.airQuality?.aqi ?? 1;
  const aqiBadge = aqiColors[aqi] ?? aqiColors[1];
  const aqiLabel = aqiLabels[aqi] ?? "Good";

  const chartData = data.forecast?.hourly.map((entry) => ({
    time: entry.time.split(" ")[1]?.slice(0, 5) ?? "",
    temp: entry.temp,
  }));

  const airQualityData = data.airQuality
    ? [
        { metric: "PM2.5", value: data.airQuality.components.pm2_5 },
        { metric: "PM10", value: data.airQuality.components.pm10 },
        { metric: "NO2", value: data.airQuality.components.no2 },
        { metric: "O3", value: data.airQuality.components.o3 },
        { metric: "CO", value: data.airQuality.components.co },
      ]
    : [];

  const scoreData = {
    tempC: data.weather.temperature,
    aqi,
    githubScore: data.devMarket?.score ?? 0,
    languageScore: data.country?.languageScore ?? 0,
  };

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
        {data.country ? (
          <CityHeroCard
            weather={data.weather}
            countryName={data.country.name}
            region={data.country.region}
            flag={data.country.flag}
          />
        ) : (
          <CityHeroCard
            weather={data.weather}
            countryName={data.weather.country}
            region=""
            flag=""
          />
        )}

        <LiveScorePanel data={scoreData} />

        <section className="grid gap-6 lg:grid-cols-3">
          <WeatherCard
            title="Weekly Forecast"
            subtitle="Next 5 days"
            warning={warnings.includes("forecast_unavailable") ? "Partial" : null}
          >
            {data.forecast ? (
              <WeeklyForecastBarChart data={data.forecast.daily} />
            ) : (
              <p className="text-sm text-slate-400">No forecast available.</p>
            )}
          </WeatherCard>

          <WeatherCard
            title="24h Temperature"
            subtitle="3 hour intervals"
            warning={warnings.includes("forecast_unavailable") ? "Partial" : null}
          >
            {chartData && chartData.length > 0 ? (
              <TemperatureLineChart data={chartData} />
            ) : (
              <p className="text-sm text-slate-400">No temperature data.</p>
            )}
          </WeatherCard>

          <WeatherCard
            title="Air Quality"
            subtitle="Live pollutant levels"
            warning={warnings.includes("airquality_unavailable") ? "Partial" : null}
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-xs ${aqiBadge} ${
                  aqi === 5 ? "animate-pulse" : ""
                }`}
              >
                AQI {aqi} · {aqiLabel}
              </span>
            </div>
            {airQualityData.length > 0 ? (
              <AirQualityRadarChart data={airQualityData} />
            ) : (
              <p className="text-sm text-slate-400">No air quality data.</p>
            )}
          </WeatherCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {data.country ? (
            <CountryStatsCard country={data.country} />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-400">
              Country stats unavailable.
            </div>
          )}
          {data.devMarket ? (
            <DevMarketCard devMarket={data.devMarket} />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-400">
              Developer market data unavailable.
            </div>
          )}
        </section>
      </main>

      <CompareSidebar cityName={cityName} />
    </div>
  );
}
