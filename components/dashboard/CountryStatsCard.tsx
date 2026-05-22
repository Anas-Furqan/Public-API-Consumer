import { formatCompactNumber } from "@/lib/utils";
import type { CountrySnapshot } from "@/types";

type CountryStatsCardProps = {
  country: CountrySnapshot;
};

export default function CountryStatsCard({ country }: CountryStatsCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Country stats</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            {country.name}
          </h3>
        </div>
        <span className="text-4xl">{country.flag}</span>
      </div>

      <div className="mt-6 grid gap-4 text-sm text-slate-300">
        <div className="flex items-center justify-between">
          <span>Population</span>
          <span className="text-white">
            {formatCompactNumber(country.population)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Region</span>
          <span className="text-white">
            {country.region} · {country.subregion}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {country.languages.map((language) => (
            <span
              key={language}
              className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200"
            >
              {language}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span>Currency</span>
          <span className="text-white">
            {country.currency} {country.currencySymbol}
          </span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Language accessibility
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-violet-500"
              style={{ width: `${country.languageScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
