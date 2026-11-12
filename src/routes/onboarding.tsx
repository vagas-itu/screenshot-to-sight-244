import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PieChart, Sparkles, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/cards/kit";
import { Logo } from "@/components/brand/Logo";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Conheça o Tokeni" },
      { name: "description", content: "Entenda seu dinheiro, converse com a IA e transforme sonhos em conquistas." },
      { property: "og:title", content: "Conheça o Tokeni" },
      { property: "og:description", content: "Entenda seu dinheiro, converse com a IA e transforme sonhos em conquistas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const SLIDES = [
  { icon: PieChart, tone: "text-primary bg-primary/15", title: "Entenda seu dinheiro", text: "Organize seus gastos e descubra para onde seu dinheiro está indo." },
  { icon: Sparkles, tone: "text-ai bg-ai/15", title: "Conte com a inteligência artificial", text: "Converse com seu assistente financeiro e receba orientações personalizadas." },
  { icon: Trophy, tone: "text-reward bg-reward/15", title: "Transforme sonhos em conquistas", text: "Crie objetivos, cumpra missões e acompanhe sua evolução financeira." },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const { finishOnboarding } = useApp();
  const navigate = useNavigate();
  const done = () => { finishOnboarding(); navigate({ to: "/login" }); };
  const s = SLIDES[i]!;
  const last = i === SLIDES.length - 1;

  return (
    <div className="flex min-h-screen flex-col bg-hero px-6 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex items-center justify-between">
          <Logo />
          {!last && <Button variant="ghost" size="sm" onClick={done}>Pular</Button>}
        </div>
        <div key={i} className="flex flex-1 animate-rise flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
            <div className={cn("relative grid h-40 w-40 place-items-center rounded-[2.5rem] border border-border", s.tone)}>
              <s.icon className="h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="mt-10 text-3xl font-bold">{s.title}</h1>
          <p className="mt-3 max-w-xs text-muted-foreground">{s.text}</p>
        </div>
        <div className="flex justify-center gap-2 pb-8">
          {SLIDES.map((_, k) => (
            <button key={k} aria-label={`Etapa ${k + 1}`} onClick={() => setI(k)} className={cn("h-2 rounded-full transition-all", k === i ? "w-8 bg-primary" : "w-2 bg-surface-2")} />
          ))}
        </div>
        <Button size="lg" className="w-full" onClick={() => (last ? done() : setI(i + 1))}>
          {last ? "Começar" : "Avançar"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
