type WeatherCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  warning?: string | null;
};

export default function WeatherCard({
  title,
  subtitle,
  children,
  warning,
}: WeatherCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          {subtitle ? (
            <p className="text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {warning ? (
          <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs text-amber-200">
            {warning}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
