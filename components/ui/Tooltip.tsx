type TooltipProps = {
  label: string;
};

export default function Tooltip({ label }: TooltipProps) {
  return (
    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
      {label}
    </span>
  );
}
