/**
 * Tokeni IA service layer.
 * No AI model is connected yet: `sendMessage` runs a clearly labelled local simulation
 * built from the persona's real demo data. Swap `simulate` for a call to the Node/Express
 * API (e.g. POST /api/assistant/messages) when it becomes available.
 */
import type { DreamFlow, Journey, PersonaInfo, PersonaState } from "@/types";
import { brl } from "@/lib/format";
import { budgetRows, buildJourney, spendingByCategory, summary } from "./finance";

export const AI_CONNECTED = false;

export interface AssistantReply {
  text: string;
  flow?: DreamFlow;
  proposal?: Journey;
}

const parseMoney = (s: string) => {
  const m = s.replace(/\./g, "").replace(",", ".").match(/(\d+(?:\.\d+)?)\s*(mil|k)?/i);
  if (!m) return undefined;
  let v = parseFloat(m[1] ?? "0");
  if (m[2]) v *= 1000;
  return v;
};
const parseMonths = (s: string) => {
  const m = s.match(/(\d+)\s*(ano|anos|mes|mês|meses)?/i);
  if (!m) return undefined;
  const n = parseInt(m[1] ?? "0");
  return m[2]?.toLowerCase().startsWith("ano") ? n * 12 : n;
};

function simulate(text: string, state: PersonaState, info: PersonaInfo, flow?: DreamFlow): AssistantReply {
  const q = text.toLowerCase();

  // Dream creation flow
  if (flow && flow.step !== "done" && flow.step !== "proposed") {
    if (flow.step === "goal") {
      return { text: `Que sonho bonito: "${text}". Quanto você imagina que ele custa? Um valor aproximado já ajuda.`, flow: { step: "cost", dream: text } };
    }
    if (flow.step === "cost") {
      const cost = parseMoney(text);
      if (!cost) return { text: "Não consegui entender o valor. Pode me dizer em reais? Ex.: 8000 ou 8 mil.", flow };
      return { text: `Anotado: ${brl(cost)}. Em quanto tempo você gostaria de conquistar? (ex.: 12 meses ou 2 anos)`, flow: { ...flow, step: "deadline", cost } };
    }
    if (flow.step === "deadline") {
      const months = parseMonths(text);
      if (!months) return { text: "Me diga o prazo em meses ou anos, por favor.", flow };
      return { text: "Última pergunta: o que hoje mais atrapalha você a guardar dinheiro? Pode ser dívidas, gastos com lazer, renda variável… sem julgamentos.", flow: { ...flow, step: "obstacles", months } };
    }
    if (flow.step === "obstacles") {
      const s = summary(state.transactions);
      const monthly = (flow.cost ?? 0) / (flow.months ?? 1);
      const free = state.financial.monthlyIncome - state.financial.fixedExpenses;
      const hasDebts = state.financial.debts > 0 || /d[íi]vida/.test(q);
      const j = buildJourney(flow.dream!, flow.cost!, flow.months!, hasDebts);
      const fit = monthly <= free * 0.5
        ? `Guardar cerca de ${brl(monthly)} por mês cabe no que sobra da sua renda (${brl(free)}).`
        : `Guardar ${brl(monthly)} por mês é desafiador para sua sobra atual (${brl(free)}). A jornada começa organizando o orçamento para abrir espaço, e podemos ajustar o prazo depois.`;
      return {
        text: `Obrigado por compartilhar. Olhando seus dados: nos últimos 30 dias entraram ${brl(s.income)} e saíram ${brl(s.expenses)}. ${fit}\n\nPreparei uma jornada em 5 níveis. Ela só começa se você aprovar.`,
        flow: { ...flow, step: "proposed", obstacles: text },
        proposal: j,
      };
    }
  }

  if (/sonho|objetivo|meta|viagem|moto|comprar.*(carro|casa)|jornada|reserva/.test(q) && !/posso comprar/.test(q)) {
    if (state.journey) return { text: `Você já tem uma jornada ativa: "${state.journey.dream}". Acompanhe na aba Sonhos. Quer que eu ajude com a próxima missão?` };
    return { text: "Vamos construir isso juntos! Primeiro: qual é o sonho que você quer conquistar? Descreva com suas palavras.", flow: { step: "goal" } };
  }
  if (/onde.*gast|gastando mais|maior gasto/.test(q)) {
    const cats = spendingByCategory(state.transactions).slice(0, 3);
    return { text: `Nos últimos 30 dias, seus maiores gastos foram:\n${cats.map((c, i) => `${i + 1}. ${c.category}: ${brl(c.value)}`).join("\n")}\n\n${cats[0] ? `${cats[0].category} lidera. Pequenos ajustes ali têm o maior efeito.` : ""}` };
  }
  if (/economiz|poupar|guardar/.test(q)) {
    const rows = budgetRows(state).sort((a, b) => b.pct - a.pct);
    const top = rows[0];
    return { text: `Algumas ideias pensadas para você, ${info.firstName}:\n• ${top ? `Revise ${top.category}: você já usou ${Math.round(top.pct * 100)}% do limite.` : "Defina limites por categoria."}\n• Separe o valor do seu sonho logo que a renda entrar, antes de gastar.\n• Troque um gasto de lazer da semana por uma alternativa gratuita.\n\nCada real guardado conta.` };
  }
  if (/posso comprar|comprar algo/.test(q)) {
    const v = parseMoney(q) ?? 300;
    const s = summary(state.transactions);
    const ok = s.balance - v > state.financial.fixedExpenses * 0.3;
    return { text: ok
      ? `Seu saldo é ${brl(s.balance)}. Uma compra de ${brl(v)} cabe, mas pergunte-se: ela te aproxima do que importa? Se puder esperar 48h e ainda quiser, vá em frente.`
      : `Hoje seu saldo é ${brl(s.balance)}. Uma compra de ${brl(v)} deixaria pouco espaço para as contas fixas. Que tal planejar para o próximo mês?` };
  }
  if (/orçamento|limite|como est/.test(q)) {
    const rows = budgetRows(state);
    return { text: `Seu orçamento agora:\n${rows.map((r) => `• ${r.category}: ${brl(r.spent)} de ${brl(r.limit)} (${Math.round(r.pct * 100)}%)${r.status === "over" ? " — passou do limite" : r.status === "attention" ? " — atenção" : ""}`).join("\n")}` };
  }
  return { text: "Posso te ajudar a entender seus gastos, revisar o orçamento, avaliar uma compra ou criar uma jornada para um sonho. Experimente uma das sugestões abaixo." };
}

export async function sendMessage(text: string, state: PersonaState, info: PersonaInfo, flow?: DreamFlow): Promise<AssistantReply> {
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
  return simulate(text, state, info, flow);
}

export const SUGGESTIONS = [
  "Onde estou gastando mais dinheiro?",
  "Como posso economizar este mês?",
  "Posso comprar algo de R$ 300?",
  "Como está meu orçamento?",
  "Quero realizar um sonho. Por onde começo?",
];
