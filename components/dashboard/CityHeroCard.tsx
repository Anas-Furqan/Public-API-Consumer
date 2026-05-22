import Image from "next/image";
import { weatherGradients, defaultGradient } from "@/lib/constants";
import type { WeatherSnapshot } from "@/types";

type CityHeroCardProps = {
  weather: WeatherSnapshot;
  countryName: string;
  region: string;
  flag: string;
};

export default function CityHeroCard({
  weather,
  countryName,
  region,
  flag,
}: CityHeroCardProps) {
  const gradient = weatherGradients[weather.condition] ?? defaultGradient;

  return (
    <section
      className={`flex flex-col gap-8 rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-8 lg:flex-row lg:items-center lg:justify-between`}
    >
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          City overview
        </p>
        <h1 className="text-display mt-2 text-4xl font-semibold text-white sm:text-6xl">
          {weather.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-slate-300">
          <span className="text-lg">{countryName}</span>
          <span className="text-2xl">{flag}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
            {region}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 lg:items-end">
        <div className="flex items-center gap-4">
          <Image
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.condition}
            width={64}
            height={64}
          />
          <div>
            <p className="text-5xl font-semibold text-white">
              {Math.round(weather.temperature)}°C
            </p>
            <p className="text-sm text-slate-300">{weather.condition}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-200">
          <span className="rounded-full bg-white/10 px-3 py-1">
            Feels like {Math.round(weather.feelsLike)}°C
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            Humidity {weather.humidity}%
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            Wind {Math.round(weather.windSpeed)} m/s
          </span>
        </div>
      </div>
    </section>
  );
}
