"use client";

import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import type { DevMarketSnapshot } from "@/types";

const scoreData = (score: number) => [
  { name: "Score", value: score, fill: "#8b5cf6" },
];

type DevMarketCardProps = {
  devMarket: DevMarketSnapshot;
};

export default function DevMarketCard({ devMarket }: DevMarketCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-slate-400">Developer market</p>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-3xl font-semibold text-white">
            {devMarket.totalCount.toLocaleString("en-US")}
          </p>
          <p className="text-xs text-slate-400">Active GitHub Repositories</p>
          <p className="mt-2 text-sm text-violet-200">
            Developer Activity Score: {devMarket.score}/100
          </p>
        </div>
        <div className="h-32 w-32">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={scoreData(devMarket.score)}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">Based on open source activity</p>
    </div>
  );
}
