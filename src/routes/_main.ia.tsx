import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ChevronDown, Plus, ClipboardList, Check } from "lucide-react";
import { Button, SimulationBadge, btn } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";
import { sendMessage, SUGGESTIONS } from "@/services/assistantService";
import { pageHead } from "@/lib/seo";
import type { ChatMessage, DreamFlow } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_main/ia")({
  head: pageHead("Tokeni IA", "Converse com seu assistente financeiro e crie jornadas para seus sonhos."),
  component: Assistant,
});

function fmtNow() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface ChatMsg extends ChatMessage { time: string; }

function Assistant() {
  const { state, persona, approveJourney } = useSession();
  const [msgs, setMsgs] = useState<ChatMsg[]>([{
    id: "w", role: "assistant",
    text: `Olá, ${persona.firstName}!\n\nSou o Tokeni, seu assistente financeiro inteligente.\n\nPosso te ajudar a entender seus gastos, organizar o orçamento, avaliar uma compra ou criar uma jornada para realizar um sonho. O que você gostaria de explorar hoje?`,
    time: fmtNow(),
  }]);
  const [flow, setFlow] = useState<DreamFlow | undefined>();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy, atBottom]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  const send = async (t: string) => {
    if (!t.trim() || busy) return;
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "user", text: t, time: fmtNow() }]);
    setText(""); setBusy(true); setAtBottom(true);
    const r = await sendMessage(t, state, persona, flow);
    setFlow(r.flow);
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text: r.text, proposal: r.proposal, simulated: true, time: fmtNow() }]);
    setBusy(false);
  };

  const approveAndProceed = (proposal: ChatMsg["proposal"]) => {
    if (!proposal) return;
    approveJourney(proposal);
    setFlow({ step: "done" });
    toast.success("Jornada ativada! Veja em Sonhos.");
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text: `Jornada ativada com sucesso! Sua jornada para "${proposal.dream}" começa agora. Acesse a aba Sonhos para ver os níveis e missões.`, time: fmtNow() }]);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-3xl flex-col gap-0 lg:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3 rounded-3xl border border-ai/20 bg-card/80 p-3 backdrop-blur-sm">
        <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ai-gradient text-ai shadow-ai">
          <Sparkles className="h-5 w-5" />
          <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-positive" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold">Tokeni IA</h1>
            <SimulationBadge />
          </div>
          <p className="text-xs text-muted-foreground">Modo demonstração · respostas simuladas com seus dados reais</p>
        </div>
        {state.journey ? (
          <Link to="/sonhos" className={cn(btn({ variant: "secondary", size: "sm" }), "hidden sm:inline-flex")}>Ver jornada</Link>
        ) : (
          <button onClick={() => send("Quero realizar um sonho. Por onde começo?")} className={cn(btn({ variant: "ai", size: "sm" }), "hidden sm:inline-flex")}>
            <Plus className="h-3.5 w-3.5" />Criar sonho
          </button>
        )}
      </div>

      {/* Messages scroll area */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth pb-2">
        {msgs.map((m) => (
          <div key={m.id} className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
            {m.role === "assistant" && (
              <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-ai-gradient text-ai">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            )}
            <div className={cn("flex max-w-[85%] flex-col", m.role === "user" ? "items-end" : "items-start")}>
              <div className={cn(
                "rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line",
                m.role === "user"
                  ? "rounded-tr-md bg-primary text-primary-foreground"
                  : "rounded-tl-md border border-ai/15 bg-card"
              )}>
                {m.text}
                {m.proposal && !state.journey && (
                  <div className="mt-4 rounded-2xl border border-ai/30 bg-background/40 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ai flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" />Proposta de jornada</p>
                    <p className="mb-3 text-sm font-bold">{m.proposal.dream}</p>
                    <div className="space-y-1.5 mb-4">
                      {m.proposal.levels.map((l, i) => (
                        <div key={l.name} className="flex items-center gap-2 text-xs">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ai/20 text-ai font-bold">{i + 1}</span>
                          <span className="font-semibold text-foreground">{l.name}</span>
                          <span className="text-muted-foreground">— {l.description}</span>
                        </div>
                      ))}
                    </div>
                    <button className={cn(btn({ variant: "ai", size: "sm" }), "w-full")} onClick={() => approveAndProceed(m.proposal)}>
                      <Check className="h-3.5 w-3.5" />Aprovar e ativar jornada
                    </button>
                  </div>
                )}
                {m.proposal && state.journey && (
                  <div className="mt-3 rounded-xl border border-positive/30 bg-positive/10 p-2.5 text-xs text-positive flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 shrink-0" />Jornada já ativa — veja em Sonhos
                  </div>
                )}
              </div>
              <span className="mt-1 px-1 text-[10px] text-muted-foreground">{m.time}</span>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-2xl bg-ai-gradient text-ai"><Sparkles className="h-3.5 w-3.5" /></div>
            <div className="flex items-center gap-1.5 rounded-3xl rounded-tl-md border border-ai/15 bg-card px-4 py-3">
              {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-dot rounded-full bg-ai" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom button */}
      {!atBottom && (
        <button onClick={() => { setAtBottom(true); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }}
          className="absolute bottom-28 right-6 z-20 grid h-9 w-9 place-items-center rounded-full border border-border bg-card shadow-glow">
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      {/* Suggestions */}
      <div className="flex gap-2 overflow-x-auto py-2 pb-1 scrollbar-none">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)}
            className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium transition hover:border-ai hover:text-ai">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); send(text); }}
        className="flex items-end gap-2 rounded-3xl border border-input bg-card p-2 focus-within:border-ai transition-colors">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
          placeholder="Pergunte ao Tokeni…"
          rows={1}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground max-h-32"
          style={{ lineHeight: "1.5" }}
          aria-label="Mensagem"
        />
        <Button type="submit" variant="ai" size="icon" className="h-10 w-10 shrink-0 rounded-2xl" aria-label="Enviar" disabled={!text.trim() || busy}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
