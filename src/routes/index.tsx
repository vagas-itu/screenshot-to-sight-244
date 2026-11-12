import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { useApp } from "@/contexts/AppContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tokeni — Seu dinheiro tem um propósito" },
      { name: "description", content: "Tokeni: finanças pessoais com inteligência artificial e jornadas gamificadas para realizar sonhos." },
      { property: "og:title", content: "Tokeni — Seu dinheiro tem um propósito" },
      { property: "og:description", content: "Finanças pessoais com IA e gamificação para realizar seus sonhos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const { ready, onboarded, persona } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      navigate({ to: persona ? "/inicio" : onboarded ? "/login" : "/onboarding" });
    }, 2200);
    return () => clearTimeout(t);
  }, [ready, onboarded, persona, navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-hero px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-primary/10" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full border border-primary/15" />
      <div className="animate-pop"><LogoMark className="h-24 w-24 drop-shadow-2xl" /></div>
      <h1 className="mt-6 animate-rise font-display text-5xl font-extrabold tracking-tight [animation-delay:.2s]">tokeni</h1>
      <p className="mt-3 animate-rise text-lg text-muted-foreground [animation-delay:.4s]">Seu dinheiro tem um propósito.</p>
      <div className="absolute bottom-12 flex gap-1.5">
        {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-dot rounded-full bg-primary" style={{ animationDelay: `${i * 0.2}s` }} />)}
      </div>
    </div>
  );
}
