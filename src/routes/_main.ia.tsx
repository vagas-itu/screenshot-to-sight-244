import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button, SimulationBadge } from "@/components/cards/kit";
import { useSession } from "@/contexts/AppContext";
import { sendMessage, SUGGESTIONS } from "@/services/assistantService";
import { pageHead } from "@/lib/seo";
import type { ChatMessage, DreamFlow } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/ia")({
  head: pageHead("Tokeni IA", "Converse com seu assistente financeiro e crie jornadas para seus sonhos."),
  component: Assistant,
});

function Assistant() {
  const { state, persona, approveJourney } = useSession();
  const [msgs, setMsgs] = useState<ChatMessage[]>([{ id: "w", role: "assistant", text: `Olá, ${persona.firstName}! Sou o Tokeni. Como posso ajudar com seu dinheiro hoje?` }]);
  const [flow, setFlow] = useState<DreamFlow | undefined>();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (t: string) => {
    if (!t.trim() || busy) return;
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "user", text: t }]);
    setText(""); setBusy(true);
    const r = await sendMessage(t, state, persona, flow);
    setFlow(r.flow);
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text: r.text, proposal: r.proposal, simulated: true }]);
    setBusy(false);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ai-gradient text-ai"><Sparkles className="h-5 w-5" /></div>
        <div className="flex-1"><h1 className="text-xl font-bold">Tokeni IA</h1><p className="text-xs text-muted-foreground">Modo demonstração — respostas simuladas com seus dados</p></div>
        <SimulationBadge />
      </div>
      <div className="space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={m.role === "user" ? "ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground" : "max-w-[85%] whitespace-pre-line rounded-2xl border border-ai/20 bg-card px-4 py-3 text-sm"}>
            {m.text}
            {m.proposal && !state.journey && (
              <div className="mt-3 rounded-xl bg-ai-gradient p-3">
                {m.proposal.levels.map((l, i) => <p key={l.name} className="text-xs">Nível {i + 1} — {l.name}: {l.description}</p>)}
                <Button variant="ai" size="sm" className="mt-3" onClick={() => { approveJourney(m.proposal!); setFlow({ step: "done" }); toast.success("Jornada ativada! Veja em Sonhos."); }}>Aprovar jornada</Button>
              </div>
            )}
          </div>
        ))}
        {busy && <p className="text-xs text-ai">Tokeni está pensando…</p>}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:border-ai">{s}</button>)}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Pergunte ao Tokeni…" className="h-12 flex-1 rounded-full border border-input bg-card px-5 text-sm outline-none focus:border-ai" />
        <Button type="submit" variant="ai" size="icon" className="h-12 w-12" aria-label="Enviar"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
