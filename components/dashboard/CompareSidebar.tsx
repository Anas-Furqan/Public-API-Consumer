"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { slugifyCity } from "@/lib/utils";

const STORAGE_KEY = "city-life-pins";

type Pin = { name: string; slug: string };

type CompareSidebarProps = {
  cityName: string;
};

export default function CompareSidebar({ cityName }: CompareSidebarProps) {
  const router = useRouter();
  const [pins, setPins] = useState<Pin[]>([]);
  const [message, setMessage] = useState<string | null>(null);

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

  const updatePins = (next: Pin[]) => {
    setPins(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handlePin = () => {
    if (pins.some((pin) => pin.name === cityName)) {
      setMessage("City already pinned.");
      return;
    }
    if (pins.length >= 2) {
      setMessage("You can only pin two cities.");
      return;
    }
    const next = [...pins, { name: cityName, slug: slugifyCity(cityName) }];
    updatePins(next);
    setMessage("City pinned.");
  };

  const handleCompare = () => {
    router.push("/compare");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-900/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row">
        <div>
          <p className="text-sm text-slate-300">Pinned cities</p>
          <p className="text-xs text-slate-500">
            {pins.length === 0
              ? "No cities pinned yet."
              : pins.map((pin) => pin.name).join(" and ")}
          </p>
          {message ? (
            <p className="mt-1 text-xs text-amber-300">{message}</p>
          ) : null}
        </div>
        {pins.length < 2 ? (
          <button
            onClick={handlePin}
            className="rounded-full border border-violet-400/60 px-5 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
          >
            Pin this city for comparison
          </button>
        ) : (
          <button
            onClick={handleCompare}
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Compare with {pins[0].name} →
          </button>
        )}
      </div>
    </div>
  );
}
