import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-10 w-10", className)} aria-hidden>
      <defs>
        <linearGradient id="tk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--brand)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#tk-g)" />
      <path d="M14 16h20M24 16v18" stroke="var(--primary-foreground)" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="34" cy="32" r="3.2" fill="var(--reward)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9" />
      <span className="font-display text-xl font-bold tracking-tight">tokeni</span>
    </div>
  );
}
