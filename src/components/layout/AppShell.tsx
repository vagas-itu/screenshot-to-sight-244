import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ArrowLeftRight, Sparkles, Target, User, Plus, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { Avatar } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";

const NAV = [
  { to: "/inicio", label: "Início", icon: Home },
  { to: "/movimentacoes", label: "Movimentações", short: "Extrato", icon: ArrowLeftRight },
  { to: "/ia", label: "Tokeni IA", icon: Sparkles, center: true },
  { to: "/sonhos", label: "Sonhos", icon: Target },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { persona, signOut } = useSession();
  const isActive = (to: string) => path === to || path.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 lg:flex">
        <Link to="/inicio"><Logo /></Link>
        <Link to="/nova" className="mt-8 flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110">
          <Plus className="h-4 w-4" /> Nova movimentação
        </Link>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(n.to) ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}>
              <n.icon className={cn("h-5 w-5", "center" in n && "text-ai")} />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-2xl bg-sidebar-accent p-3">
          <Avatar name={persona.name} className="h-9 w-9 text-xs" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{persona.name}</p>
            <p className="truncate text-xs text-muted-foreground">Persona demo</p>
          </div>
          <button onClick={signOut} aria-label="Sair" className="text-muted-foreground hover:text-foreground"><LogOut className="h-4 w-4" /></button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 pb-28 lg:pb-10">
        <div key={path} className="mx-auto w-full max-w-6xl animate-rise px-4 pt-5 sm:px-6 lg:px-10 lg:pt-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end">
          {NAV.map((n) =>
            "center" in n ? (
              <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1" aria-label={n.label}>
                <span className={cn("-mt-7 grid h-14 w-14 place-items-center rounded-full bg-ai-gradient text-ai ring-4 ring-background shadow-ai", isActive(n.to) && "animate-pulse-ring")}>
                  <n.icon className="h-6 w-6" />
                </span>
                <span className={cn("text-[11px] font-medium", isActive(n.to) ? "text-ai" : "text-muted-foreground")}>Tokeni IA</span>
              </Link>
            ) : (
              <Link key={n.to} to={n.to} className={cn("flex flex-col items-center gap-1 rounded-2xl py-1.5", isActive(n.to) ? "text-primary" : "text-muted-foreground")}>
                <n.icon className="h-5 w-5" />
                <span className="text-[11px] font-medium">{"short" in n ? n.short : n.label}</span>
              </Link>
            ),
          )}
        </div>
      </nav>
    </div>
  );
}
