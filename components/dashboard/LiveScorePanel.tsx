"use client";

import { animate, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import ScoreRadarChart from "@/components/charts/ScoreRadarChart";
import { calculateScore } from "@/lib/scoreEngine";
import type { CityData, Weights } from "@/lib/scoreEngine";

const initialWeights: Weights = {
  weather: 40,
  costOfLiving: 20,
  devMarket: 20,
  language: 20,
};

const sliderClass =
  "h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500";

type LiveScorePanelProps = {
  data: CityData;
};

function normalizeTemperature(tempC: number) {
  const ideal = 22;
  const delta = Math.abs(tempC - ideal);
  return Math.max(0, 100 - delta * 4);
}

function normalizeAqi(aqi: number) {
  const clamped = Math.min(5, Math.max(1, aqi));
  return 100 - (clamped - 1) * 20;
}

export default function LiveScorePanel({ data }: LiveScorePanelProps) {
  const [weights, setWeights] = useState(initialWeights);
  const score = calculateScore(data, weights);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.2,
      onUpdate: (value) => setDisplayScore(Math.round(value)),
    });
    return () => controls.stop();
  }, [score]);

  const scoreTone =
    score < 40 ? "text-red-400" : score < 70 ? "text-amber-300" : "text-emerald-300";

  const weatherScore =
    normalizeTemperature(data.tempC) * 0.7 + normalizeAqi(data.aqi) * 0.3;
  const costScore = 50;

  const radarData = useMemo(
    () => [
      { metric: "Weather", value: Math.round(weatherScore) },
      { metric: "Cost", value: costScore },
      { metric: "Dev", value: data.githubScore },
      { metric: "Language", value: data.languageScore },
    ],
    [costScore, data.githubScore, data.languageScore, weatherScore]
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-sm text-slate-400">Livability Score</p>
            <motion.p className={`mt-2 text-6xl font-semibold ${scoreTone}`}>
              {displayScore}
            </motion.p>
            <p className="mt-2 text-sm text-slate-400">Live weighted score</p>
          </div>
          <div className="mt-6">
            <ScoreRadarChart data={radarData} />
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          {(
            [
              { key: "weather", label: "🌤 Weather Comfort" },
              { key: "costOfLiving", label: "💰 Cost of Living" },
              { key: "devMarket", label: "👨‍💻 Developer Job Market" },
              { key: "language", label: "🗣 Language Accessibility" },
            ] as const
          ).map((item) => (
            <div key={item.key}>
              <div className="flex items-center justify-between">
                <span>{item.label}</span>
                <span>{weights[item.key]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={weights[item.key]}
                onChange={(event) =>
                  setWeights((prev) => ({
                    ...prev,
                    [item.key]: Number(event.target.value),
                  }))
                }
                className={sliderClass}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
