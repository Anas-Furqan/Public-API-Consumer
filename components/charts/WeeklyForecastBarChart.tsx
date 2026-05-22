"use client";

import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeeklyForecastBarChartProps = {
  data: Array<{ day: string; min: number; max: number; date: string }>;
};

export default function WeeklyForecastBarChart({ data }: WeeklyForecastBarChartProps) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20 }}>
          <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "#1f2937",
              border: "1px solid #334155",
              color: "#fff",
            }}
            formatter={(value: number) => `${Math.round(value)}°C`}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Bar dataKey="min" fill="#60a5fa" radius={[6, 6, 0, 0]} />
          <Bar dataKey="max" fill="#f97316" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
