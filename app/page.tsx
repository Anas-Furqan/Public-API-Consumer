"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import SearchBar from "@/components/ui/SearchBar";
import Badge from "@/components/ui/Badge";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { trendingCities } from "@/lib/constants";
import { slugifyCity } from "@/lib/utils";
import type { WeatherSnapshot } from "@/types";

type PreviewState = {
  weather: WeatherSnapshot | null;
  warnings: string[];
};

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const run = async () => {
      if (debounced.length === 0) {
        setError(null);
        setPreview(null);
        return;
      }
      if (debounced.length < 2) {
        setError("Please enter a valid city name");
        setPreview(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/weather?city=${debounced}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data?.message ?? "City not found.");
          setPreview(null);
          return;
        }

        setPreview({
          weather: data.data?.weather ?? null,
          warnings: data.warnings ?? [],
        });
      } catch (err) {
        setError("Weather service is taking too long.");
        setPreview(null);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [debounced]);

  const canNavigate = useMemo(
    () => query.trim().length >= 2 && !error,
    [query, error]
  );

  const handleSubmit = () => {
    if (!canNavigate) {
      setError("Please enter a valid city name");
      return;
    }
    router.push(`/city/${slugifyCity(query)}`);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Navbar />

      <motion.div
        className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[140px]"
        animate={{ x: [0, 80, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-[160px]"
        animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 pb-20 pt-10">
        <div className="flex w-full flex-col items-center gap-6 text-center">
          <Badge tone="default">Live data · Premium analytics</Badge>
          <h1 className="text-display max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Find Your Perfect City
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Compare livability scores across any city in the world — powered by
            real-time data.
          </p>
        </div>

        <div className="mt-10 w-full max-w-2xl">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {trendingCities.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setQuery(city);
                  router.push(`/city/${slugifyCity(city)}`);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid w-full gap-6 md:grid-cols-3">
          <AnimatePresence>
            {loading && !preview ? (
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))
            ) : preview?.weather ? (
              [
                {
                  title: "Current Weather",
                  value: `${Math.round(preview.weather.temperature)}°C`,
                  subtitle: preview.weather.condition,
                },
                {
                  title: "Feels Like",
                  value: `${Math.round(preview.weather.feelsLike)}°C`,
                  subtitle: `Humidity ${preview.weather.humidity}%`,
                },
                {
                  title: "Ready to Score",
                  value: "Open Dashboard",
                  subtitle: "Compare livability instantly",
                },
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10"
                >
                  <p className="text-sm text-slate-400">{card.title}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-semibold text-white">
                        {card.value}
                      </p>
                      <p className="text-sm text-slate-400">{card.subtitle}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-violet-300 transition group-hover:bg-violet-600 group-hover:text-white">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                  {preview.warnings.length > 0 ? (
                    <p className="mt-4 text-xs text-amber-300">
                      Some preview data is delayed.
                    </p>
                  ) : null}
                </motion.div>
              ))
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Premium Insights
                </p>
                <p className="mt-3 text-lg text-slate-300">
                  Search any city to unlock the full dashboard.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
