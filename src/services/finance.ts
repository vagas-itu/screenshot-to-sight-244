import type { Achievement, Journey, Mission, PersonaState, Transaction } from "@/types";

export const isThisMonth = (iso: string, ref = new Date()) => {
  const d = new Date(iso);
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
};

/** Last 30 days window used for the "month" summaries so demo data always shows up. */
export const inWindow = (iso: string, days = 30) =>
  Date.now() - new Date(iso).getTime() <= days * 86400000;

export function summary(txs: Transaction[]) {
  const recent = txs.filter((t) => inWindow(t.date));
  const income = recent.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = recent.filter((t) => t.type !== "income").reduce((s, t) => s + t.amount, 0);
  const allIn = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const allOut = txs.filter((t) => t.type !== "income").reduce((s, t) => s + t.amount, 0);
  return { income, expenses, net: income - expenses, balance: allIn - allOut };
}

export function spentBy(txs: Transaction[], category: string) {
  return txs
    .filter((t) => t.type === "expense" && t.category === category && inWindow(t.date))
    .reduce((s, t) => s + t.amount, 0);
}

export type BudgetStatus = "ok" | "attention" | "over";
export const budgetStatus = (spent: number, limit: number): BudgetStatus =>
  spent > limit ? "over" : spent / limit >= 0.8 ? "attention" : "ok";

export function budgetRows(state: PersonaState) {
  return state.budgets.map((b) => {
    const spent = spentBy(state.transactions, b.category);
    const pct = b.limit > 0 ? spent / b.limit : 0;
    return { ...b, spent, pct, status: budgetStatus(spent, b.limit) };
  });
}

export function spendingByCategory(txs: Transaction[]) {
  const map = new Map<string, number>();
  txs.filter((t) => t.type === "expense" && inWindow(t.date)).forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
  return [...map.entries()].map(([category, value]) => ({ category, value })).sort((a, b) => b.value - a.value);
}

const LEVEL_NAMES = ["Sonhador", "Explorador", "Construtor", "Conquistador", "Realizador"];

export function buildJourney(dream: string, target: number, months: number, hasDebts: boolean): Journey {
  const monthly = Math.ceil(target / Math.max(months, 1));
  const main: Omit<Mission, "id" | "levelIndex" | "main">[] = [
    { title: "Mapeie suas despesas", description: "Descubra quanto da sua renda está comprometida para organizar seu planejamento.", xp: 100 },
    hasDebts
      ? { title: "Organize suas dívidas", description: "Liste cada dívida com valor e juros e escolha qual quitar primeiro.", xp: 150 }
      : { title: "Defina seus limites", description: "Ajuste os limites de orçamento das categorias em que mais gasta.", xp: 150 },
    { title: `Guarde ${monthly.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} este mês`, description: `Faça sua primeira contribuição para "${dream}" registrando uma movimentação do tipo Sonho.`, xp: 200 },
    { title: "Compare as opções", description: "Pesquise pelo menos três opções e anote preço, condições e custos extras.", xp: 200 },
    { title: "Planeje o depois", description: "Calcule os custos mensais que o sonho vai trazer e reserve espaço no orçamento.", xp: 250 },
  ];
  const descriptions = [
    "Conhecer sua situação financeira atual.",
    hasDebts ? "Organizar e quitar dívidas." : "Organizar o orçamento do mês.",
    "Juntar o dinheiro com constância.",
    "Avaliar as melhores opções.",
    `Conquistar: ${dream}.`,
  ];
  const missions: Mission[] = main.map((m, i) => ({ ...m, id: `m${i + 1}`, levelIndex: i, main: true }));
  missions.push(
    { id: "s1", title: "Converse com o Tokeni", description: "Pergunte ao assistente onde você mais gasta.", xp: 40, levelIndex: 0, main: false },
    { id: "s2", title: "Uma semana sem delivery", description: "Cozinhe em casa por 7 dias e registre a economia.", xp: 60, levelIndex: 1, main: false },
    { id: "s3", title: "Revise suas assinaturas", description: "Cancele um serviço que você quase não usa.", xp: 50, levelIndex: 1, main: false },
  );
  return {
    dream,
    target,
    saved: 0,
    months,
    createdAt: new Date().toISOString(),
    levels: LEVEL_NAMES.map((name, i) => ({ name, description: descriptions[i] ?? "", missionId: `m${i + 1}` })),
    missions,
  };
}

export function xpOf(state: PersonaState) {
  const missionXp = (state.journey?.missions ?? []).filter((m) => state.completedMissions.includes(m.id)).reduce((s, m) => s + m.xp, 0);
  const achXp = ACHIEVEMENTS.filter((a) => state.unlockedAchievements.includes(a.id)).reduce((s, a) => s + a.xp, 0);
  return missionXp + achXp;
}

export type LevelState = "done" | "current" | "locked";
export function levelStates(j: Journey, completed: string[]): LevelState[] {
  let currentFound = false;
  return j.levels.map((l) => {
    if (completed.includes(l.missionId)) return "done";
    if (!currentFound) { currentFound = true; return "current"; }
    return "locked";
  });
}

export const journeyProgress = (j: Journey, completed: string[]) =>
  j.levels.filter((l) => completed.includes(l.missionId)).length / j.levels.length;

export const financialProgress = (j: Journey) => Math.min(1, j.saved / j.target);

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-login", title: "Primeiro passo", description: "Entrou no Tokeni pela primeira vez.", xp: 20 },
  { id: "dream-created", title: "Sonho declarado", description: "Aprovou sua primeira jornada.", xp: 50 },
  { id: "first-mission", title: "Em movimento", description: "Concluiu a primeira missão.", xp: 50 },
  { id: "first-saving", title: "Cofrinho ativo", description: "Fez a primeira contribuição para um sonho.", xp: 80 },
  { id: "level-3", title: "Construtor", description: "Chegou ao nível 3 da jornada.", xp: 120 },
  { id: "halfway", title: "Meio caminho", description: "Juntou 50% do valor do sonho.", xp: 200 },
];

/** Pure reducer helpers so rules stay out of components. */
export function applyCompleteMission(state: PersonaState, missionId: string): PersonaState {
  if (state.completedMissions.includes(missionId)) return state;
  const completedMissions = [...state.completedMissions, missionId];
  const unlocked = new Set(state.unlockedAchievements);
  unlocked.add("first-mission");
  if (state.journey) {
    const doneLevels = state.journey.levels.filter((l) => completedMissions.includes(l.missionId)).length;
    if (doneLevels >= 2) unlocked.add("level-3");
  }
  return { ...state, completedMissions, unlockedAchievements: [...unlocked] };
}

export function applyAddTransaction(state: PersonaState, t: Transaction): PersonaState {
  let next: PersonaState = { ...state, transactions: [t, ...state.transactions] };
  if (t.type === "dream" && state.journey) {
    const journey = { ...state.journey, saved: state.journey.saved + t.amount };
    const unlocked = new Set(state.unlockedAchievements);
    unlocked.add("first-saving");
    if (journey.saved / journey.target >= 0.5) unlocked.add("halfway");
    next = { ...next, journey, unlockedAchievements: [...unlocked] };
    if (!next.completedMissions.includes("m3") && next.completedMissions.includes("m2")) next = applyCompleteMission(next, "m3");
  }
  return next;
}

export function applyApproveJourney(state: PersonaState, j: Journey): PersonaState {
  const unlocked = new Set(state.unlockedAchievements);
  unlocked.add("dream-created");
  return { ...state, journey: j, completedMissions: [], unlockedAchievements: [...unlocked] };
}
