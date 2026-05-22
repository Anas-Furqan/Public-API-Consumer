import Link from "next/link";
import { Compass } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
          <Compass className="h-5 w-5 text-violet-300" />
        </span>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            City Life
          </p>
          <p className="text-lg font-semibold text-white">Score Dashboard</p>
        </div>
      </Link>
      <Link
        href="/compare"
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
      >
        Compare Cities
      </Link>
    </nav>
  );
}
