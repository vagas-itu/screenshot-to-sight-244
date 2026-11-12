import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Target } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { iconFor } from "@/services/categories";
import type { Transaction } from "@/types";
import { fmtDate, fmtTime, masked } from "@/lib/format";

export const btn = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:brightness-110 shadow-glow",
        secondary: "bg-surface-2 text-foreground hover:bg-accent border border-border",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-surface",
        ai: "bg-ai text-ai-foreground hover:brightness-110 shadow-ai",
        reward: "bg-reward-gradient text-reward-foreground hover:brightness-105",
        link: "text-primary hover:underline px-0 h-auto",
      },
      size: { sm: "h-9 px-4 text-sm", md: "h-11 px-5 text-sm", lg: "h-13 px-6 text-base py-3.5", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({ className, variant, size, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof btn>) {
  return <button className={cn(btn({ variant, size }), className)} {...p} />;
}

export function Progress({ value, tone = "brand", className }: { value: number; tone?: "brand" | "ai" | "reward" | "warning" | "negative"; className?: string }) {
  const tones = { brand: "bg-progress", ai: "bg-ai", reward: "bg-reward-gradient", warning: "bg-warning", negative: "bg-negative" };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div className={cn("h-full rounded-full animate-grow", tones[tone])} style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("card-surface p-5", className)}>{children}</div>;
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold">{title}</h2>
      {action}
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-gradient font-display text-sm font-bold text-primary ring-2 ring-primary/30", className)}>
      {initials}
    </div>
  );
}

export function CategoryIcon({ category, type }: { category: string; type: Transaction["type"] }) {
  const Icon = type === "dream" ? Target : iconFor(category);
  const tone = type === "income" ? "bg-positive/15 text-positive" : type === "dream" ? "bg-reward/15 text-reward" : "bg-surface-2 text-foreground";
  return (
    <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", tone)}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

export function TxRow({ t, hide }: { t: Transaction; hide: boolean }) {
  const positive = t.type === "income";
  return (
    <Link
      to="/movimentacoes/$id"
      params={{ id: t.id }}
      className="group flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-surface"
    >
      <CategoryIcon category={t.category} type={t.type} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{t.description}</p>
        <p className="truncate text-xs text-muted-foreground">
          {t.type === "dream" ? "Sonho" : t.category} · {fmtDate(t.date)}, {fmtTime(t.date)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className={cn("tabular text-sm font-semibold", positive ? "text-positive" : t.type === "dream" ? "text-reward" : "text-foreground")}>
          {positive ? "+" : "−"}{masked(t.amount, hide).replace("R$", "R$ ").replace("  ", " ")}
        </span>
        {positive ? <ArrowDownLeft className="h-3.5 w-3.5 text-positive" /> : <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />}
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
      </div>
    </Link>
  );
}

export function SimulationBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-ai/30 bg-ai/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ai">
      Simulação
    </span>
  );
}
