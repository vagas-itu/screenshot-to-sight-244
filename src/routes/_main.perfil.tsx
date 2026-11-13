import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  User, Shield, Bell, SlidersHorizontal, Moon, HelpCircle, Info,
  ChevronRight, LogOut, RotateCcw, Check, Eye, EyeOff, Camera,
  DollarSign, Target, CreditCard,
} from "lucide-react";
import { Avatar, Button } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";
import { pageHead } from "@/lib/seo";
import type { FinancialProfile } from "@/types";
import { cn } from "@/lib/utils";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_main/perfil")({
  head: pageHead("Perfil", "Seus dados, preferências e informações financeiras usadas pelo Tokeni."),
  component: Profile,
});

const input = "h-11 w-full rounded-xl border border-input bg-surface px-3 text-sm outline-none focus:border-primary";

type Section = "main" | "financial" | "budget" | "security" | "about";

function SettingsRow({
  icon: Icon,
  label,
  description,
  action,
  onClick,
  className,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 border-t border-border px-5 py-4 text-left first:border-0 transition-colors",
        onClick && "hover:bg-surface/60 active:bg-surface",
        className,
      )}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-surface text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {action ?? (onClick && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />)}
    </Tag>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-surface-2",
      )}
    >
      <span className={cn("absolute h-4 w-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

function Profile() {
  const { persona, state, update, signOut, resetPersona } = useSession();
  const [section, setSection] = useState<Section>("main");
  const [hideValues, setHideValues] = useState(state.hideValues);

  const setFin = (k: keyof FinancialProfile, v: string) =>
    update((s) => ({ ...s, financial: { ...s.financial, [k]: k === "priorities" ? v : Number(v) || 0 } }));

  const toggleNotifications = () => update((s) => ({ ...s, notifications: !s.notifications }));
  const toggleHide = (v: boolean) => { setHideValues(v); update((s) => ({ ...s, hideValues: v })); };

  // Quick overview tabs for mobile
  const navTabs: { k: Section; label: string; icon: React.ElementType }[] = [
    { k: "main", label: "Perfil", icon: User },
    { k: "financial", label: "Finanças", icon: DollarSign },
    { k: "budget", label: "Limites", icon: Target },
    { k: "security", label: "Segurança", icon: Shield },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <Avatar name={persona.name} className="h-16 w-16 text-base" />
            <button
              onClick={() => toast.info("Foto de perfil", { description: "Funcionalidade disponível na versão final." })}
              className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-background bg-surface text-muted-foreground hover:text-foreground"
              aria-label="Alterar foto"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{persona.name}</h1>
            <p className="text-sm text-muted-foreground">{persona.email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{persona.occupation}</p>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-positive/30 bg-positive/10 px-3 py-1 text-xs font-semibold text-positive sm:flex">
            <Check className="h-3 w-3" /> Demo
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground border-t border-border pt-4">{persona.bio}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Renda mensal", value: brl(state.financial.monthlyIncome) },
          { label: "Dívidas", value: brl(state.financial.debts) },
          { label: "Reserva", value: brl(state.financial.emergencyFund) },
        ].map((s) => (
          <div key={s.label} className="card-surface p-3 text-center">
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="tabular mt-1 text-sm font-bold">{hideValues ? "R$ ••••" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Section Nav — mobile style tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {navTabs.map((t) => (
          <button key={t.k} onClick={() => setSection(section === t.k ? "main" : t.k)}
            className={cn(
              "shrink-0 flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition",
              section === t.k
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Preferences */}
      <div className="card-surface overflow-hidden p-0">
        <p className="px-5 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preferências</p>
        <SettingsRow
          icon={Bell}
          label="Notificações"
          description="Alertas de gastos e lembretes"
          action={<Toggle checked={state.notifications} onChange={toggleNotifications} />}
        />
        <SettingsRow
          icon={state.hideValues ? EyeOff : Eye}
          label="Ocultar valores"
          description="Esconder saldos e transações"
          action={<Toggle checked={hideValues} onChange={toggleHide} />}
        />
        <SettingsRow
          icon={Moon}
          label="Tema"
          description="Escuro (padrão)"
          action={<span className="rounded-full border border-border bg-surface px-3 py-1 text-xs">Escuro</span>}
        />
      </div>

      {/* Financial Info — expandable */}
      {(section === "financial" || section === "main") && (
        <div className="card-surface overflow-hidden p-0">
          <p className="px-5 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Informações financeiras</p>
          <div className="px-5 pb-4 space-y-3">
            <p className="text-xs text-muted-foreground">Usadas pelo Tokeni IA para personalizar suas recomendações.</p>
            {([["monthlyIncome", "Renda mensal (R$)"], ["fixedExpenses", "Despesas fixas (R$)"], ["debts", "Dívidas (R$)"], ["emergencyFund", "Reserva de emergência (R$)"]] as const).map(([k, l]) => (
              <label key={k} className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">{l}</span>
                <input type="number" className={input} value={state.financial[k]} onChange={(e) => setFin(k, e.target.value)} />
              </label>
            ))}
            <label className="block">
              <span className="mb-1.5 block text-xs text-muted-foreground">Prioridades financeiras</span>
              <input className={input} value={state.financial.priorities} onChange={(e) => setFin("priorities", e.target.value)} />
            </label>
          </div>
        </div>
      )}

      {/* Budget Limits */}
      {(section === "budget" || section === "main") && (
        <div className="card-surface overflow-hidden p-0">
          <p className="px-5 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Limites de orçamento mensal</p>
          <div className="px-5 pb-4 space-y-3">
            {state.budgets.map((b, i) => (
              <div key={b.category} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-surface text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium">{b.category}</span>
                </div>
                <input
                  type="number"
                  className="h-9 w-28 rounded-xl border border-input bg-surface px-3 text-sm outline-none focus:border-primary text-right tabular"
                  value={b.limit}
                  onChange={(e) => update((s) => ({ ...s, budgets: s.budgets.map((x, j) => (j === i ? { ...x, limit: Number(e.target.value) || 0 } : x)) }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security */}
      {(section === "security" || section === "main") && (
        <div className="card-surface overflow-hidden p-0">
          <p className="px-5 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Segurança</p>
          <SettingsRow
            icon={Shield}
            label="Alterar senha"
            description="Última alteração: nunca"
            onClick={() => toast.info("Em breve", { description: "Funcionalidade disponível na versão final." })}
          />
          <SettingsRow
            icon={SlidersHorizontal}
            label="Controles da conta"
            description="Permissões e acessos"
            onClick={() => toast.info("Em breve", { description: "Funcionalidade disponível na versão final." })}
          />
        </div>
      )}

      {/* App info */}
      <div className="card-surface overflow-hidden p-0">
        <p className="px-5 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Aplicativo</p>
        <SettingsRow
          icon={HelpCircle}
          label="Ajuda e suporte"
          description="Dúvidas frequentes e contato"
          onClick={() => toast.info("Suporte", { description: "Este é um projeto acadêmico com dados fictícios." })}
        />
        <SettingsRow
          icon={Info}
          label="Sobre o Tokeni"
          description="Versão 1.0.0 · Projeto acadêmico"
          onClick={() => toast.info("Sobre o Tokeni", { description: "Plataforma de finanças pessoais com IA e gamificação. Dados fictícios para demonstração." })}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pb-4">
        <Button
          variant="secondary"
          onClick={() => { resetPersona(); toast.success("Dados da demo restaurados"); }}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />Restaurar demo
        </Button>
        <Button
          variant="ghost"
          onClick={signOut}
          className="flex items-center gap-2 text-negative hover:text-negative"
        >
          <LogOut className="h-4 w-4" />Sair
        </Button>
      </div>
    </div>
  );
}
