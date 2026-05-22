"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { radarColors } from "@/lib/constants";

type TemperatureLineChartProps = {
  data: Array<{ time: string; temp: number }>;
};

export default function TemperatureLineChart({ data }: TemperatureLineChartProps) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20 }}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={radarColors.primary} stopOpacity={0.7} />
              <stop offset="95%" stopColor={radarColors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "#1f2937",
              border: "1px solid #334155",
              color: "#fff",
            }}
            formatter={(value: number) => `${Math.round(value)}°C`}
          />
          <Area
            type="monotone"
            dataKey="temp"
            stroke={radarColors.primary}
            fill="url(#tempGradient)"
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
