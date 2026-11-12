import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button, Avatar } from "@/components/cards/kit";
import { Logo } from "@/components/brand/Logo";
import { useApp } from "@/contexts/AppContext";
import { PERSONAS } from "@/services/mockData";
import type { PersonaId } from "@/types";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Tokeni" },
      { name: "description", content: "Acesse o Tokeni ou entre com uma persona de demonstração." },
      { property: "og:title", content: "Entrar — Tokeni" },
      { property: "og:description", content: "Acesse o Tokeni ou entre com uma persona de demonstração." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

const field = "h-12 w-full rounded-2xl border border-input bg-surface pl-11 pr-11 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

function Login() {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");

  const enter = (id: PersonaId) => {
    signIn(id);
    toast.success(`Bem-vindo(a), ${PERSONAS[id].firstName}!`);
    navigate({ to: "/inicio" });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = (Object.keys(PERSONAS) as PersonaId[]).find((k) => PERSONAS[k].email === email.trim().toLowerCase());
    if (match) return enter(match);
    toast.info("Esta é uma demonstração acadêmica", { description: "Contas reais não estão disponíveis. Entre com Janaína ou José abaixo." });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-gradient p-12 lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div>
          <h2 className="max-w-md text-5xl font-bold leading-tight">Seu dinheiro tem um propósito.</h2>
          <p className="mt-4 max-w-sm text-muted-foreground">Um assistente financeiro inteligente que transforma seus sonhos em uma jornada possível.</p>
        </div>
        <p className="text-xs text-muted-foreground">Projeto acadêmico · dados fictícios</p>
      </div>

      <div className="flex items-center justify-center bg-hero px-6 py-10 lg:bg-none">
        <div className="w-full max-w-sm animate-rise">
          <div className="lg:hidden"><Logo /></div>
          <h1 className="mt-8 text-3xl font-bold">{mode === "login" ? "Que bom te ver!" : "Crie sua conta"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{mode === "login" ? "Entre para continuar sua jornada." : "Comece a organizar seu dinheiro hoje."}</p>

          <form onSubmit={submit} className="mt-8 space-y-3">
            {mode === "signup" && (
              <label className="relative block">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input required placeholder="Nome completo" className={field} />
              </label>
            )}
            <label className="relative block">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className={field} />
            </label>
            <label className="relative block">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type={show ? "text" : "password"} required placeholder="Senha" className={field} />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ocultar senha" : "Mostrar senha"} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </label>
            {mode === "login" && (
              <div className="text-right">
                <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => toast.info("Recuperação de senha", { description: "Na versão final enviaremos um link para seu e-mail. Nesta demo, use as personas." })}>
                  Esqueci minha senha
                </button>
              </div>
            )}
            <Button type="submit" size="lg" className="w-full">{mode === "login" ? "Entrar" : "Criar conta"}</Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? "Ainda não tem conta? " : "Já tem conta? "}
            <button className="font-semibold text-primary hover:underline" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Cadastre-se" : "Entrar"}
            </button>
          </p>

          <div className="my-7 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />Acesso rápido · demonstração<span className="h-px flex-1 bg-border" /></div>
          <div className="space-y-2.5">
            {(Object.keys(PERSONAS) as PersonaId[]).map((id) => (
              <button key={id} onClick={() => enter(id)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-primary/50 hover:bg-surface">
                <Avatar name={PERSONAS[id].name} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Entrar como {PERSONAS[id].firstName}</p>
                  <p className="truncate text-xs text-muted-foreground">{PERSONAS[id].occupation}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
