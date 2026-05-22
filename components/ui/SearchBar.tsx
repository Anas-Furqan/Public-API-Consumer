"use client";

import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  error?: string | null;
};

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  loading,
  error,
}: SearchBarProps) {
  return (
    <div className="w-full">
      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-4 shadow-lg shadow-black/20 transition",
          "focus-within:border-violet-500/70 focus-within:ring-2 focus-within:ring-violet-500/40"
        )}
      >
        <Search className="h-5 w-5 text-slate-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSubmit();
          }}
          placeholder="Search for a city"
          className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
        />
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-violet-300" />
        ) : null}
        <button
          onClick={onSubmit}
          className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          Explore
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-amber-300">{error}</p>
      ) : null}
    </div>
  );
}
