"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { radarColors } from "@/lib/constants";

type ScoreRadarChartProps = {
  data: Array<{ metric: string; value: number }>;
};

export default function ScoreRadarChart({ data }: ScoreRadarChartProps) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <PolarGrid stroke="#ffffff10" />
          <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
          <PolarRadiusAxis stroke="#94a3b8" />
          <Radar
            dataKey="value"
            stroke={radarColors.primary}
            fill={radarColors.primary}
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
