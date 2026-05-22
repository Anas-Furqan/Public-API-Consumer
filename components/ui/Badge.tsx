import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "warning" | "success" | "danger";
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-white/10 text-white",
  warning: "bg-amber-400/20 text-amber-200",
  success: "bg-emerald-400/20 text-emerald-200",
  danger: "bg-red-400/20 text-red-200",
};

export default function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}
