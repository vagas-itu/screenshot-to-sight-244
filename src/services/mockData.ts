import type { PersonaId, PersonaInfo, PersonaState, Transaction } from "@/types";

export const PERSONAS: Record<PersonaId, PersonaInfo> = {
  janaina: {
    id: "janaina",
    name: "Janaína Brito",
    firstName: "Janaína",
    email: "janaina.brito@demo.tokeni.app",
    occupation: "Dona de casa · mãe de 2",
    bio: "Cuida da casa e dos filhos com uma renda apertada e quer sair das dívidas.",
    accounts: ["Conta principal", "Carteira", "Poupança"],
    dreamHint: "Quitar dívidas e montar uma reserva",
  },
  jose: {
    id: "jose",
    name: "José Fá",
    firstName: "José",
    email: "jose.fa@demo.tokeni.app",
    occupation: "Assistente administrativo · 1º emprego",
    bio: "Recebeu o primeiro salário e quer aprender a planejar sem deixar de curtir.",
    accounts: ["Conta digital", "Carteira"],
    dreamHint: "Comprar minha primeira moto",
  },
};

function at(daysAgo: number, hour: number, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

let seq = 0;
const tx = (t: Omit<Transaction, "id">): Transaction => ({ ...t, id: `TK-${(++seq).toString().padStart(5, "0")}` });

function janaina(): PersonaState {
  const a = "Conta principal";
  return {
    transactions: [
      tx({ type: "expense", description: "Mercado Bom Preço", category: "Alimentação", date: at(0, 10, 12), amount: 186.4, account: a }),
      tx({ type: "expense", description: "Farmácia São João", category: "Saúde", date: at(1, 17, 40), amount: 42.9, account: "Carteira" }),
      tx({ type: "expense", description: "Parcela cartão loja", category: "Dívidas", date: at(2, 9, 5), amount: 210, account: a }),
      tx({ type: "income", description: "Bolo por encomenda", category: "Renda extra", date: at(3, 15, 0), amount: 180, account: "Carteira" }),
      tx({ type: "expense", description: "Conta de luz", category: "Contas", date: at(4, 8, 30), amount: 148.7, account: a }),
      tx({ type: "expense", description: "Material escolar", category: "Filhos", date: at(5, 14, 20), amount: 96.5, account: a }),
      tx({ type: "expense", description: "Feira do bairro", category: "Alimentação", date: at(6, 7, 45), amount: 74.3, account: "Carteira" }),
      tx({ type: "expense", description: "Passagens de ônibus", category: "Transporte", date: at(7, 6, 50), amount: 55, account: a }),
      tx({ type: "income", description: "Pensão dos filhos", category: "Salário", date: at(8, 9, 0), amount: 1200, account: a }),
      tx({ type: "income", description: "Auxílio família", category: "Renda extra", date: at(9, 10, 0), amount: 600, account: a }),
      tx({ type: "expense", description: "Aluguel", category: "Moradia", date: at(10, 9, 0), amount: 650, account: a }),
      tx({ type: "expense", description: "Pizza com as crianças", category: "Lazer", date: at(11, 20, 15), amount: 68, account: a }),
      tx({ type: "expense", description: "Açougue", category: "Alimentação", date: at(12, 11, 0), amount: 112.8, account: a }),
      tx({ type: "expense", description: "Internet", category: "Contas", date: at(13, 8, 0), amount: 99.9, account: a }),
    ],
    budgets: [
      { category: "Alimentação", limit: 500 },
      { category: "Contas", limit: 280 },
      { category: "Filhos", limit: 150 },
      { category: "Lazer", limit: 80 },
      { category: "Transporte", limit: 90 },
    ],
    journey: null,
    completedMissions: [],
    unlockedAchievements: ["first-login"],
    conversations: [],
    financial: { monthlyIncome: 1980, fixedExpenses: 1250, debts: 2400, emergencyFund: 0, priorities: "Pagar as dívidas e garantir o básico das crianças" },
    notifications: true,
    hideValues: false,
  };
}

function jose(): PersonaState {
  const a = "Conta digital";
  return {
    transactions: [
      tx({ type: "expense", description: "iFood — hambúrguer", category: "Alimentação", date: at(0, 21, 10), amount: 48.9, account: a }),
      tx({ type: "expense", description: "Ingresso show", category: "Lazer", date: at(1, 19, 0), amount: 120, account: a }),
      tx({ type: "expense", description: "Uber", category: "Transporte", date: at(1, 23, 40), amount: 32.5, account: a }),
      tx({ type: "expense", description: "Tênis novo", category: "Compras", date: at(3, 16, 30), amount: 289.9, account: a }),
      tx({ type: "expense", description: "Assinatura streaming", category: "Lazer", date: at(4, 8, 0), amount: 39.9, account: a }),
      tx({ type: "expense", description: "Restaurante com amigos", category: "Alimentação", date: at(5, 20, 30), amount: 96, account: a }),
      tx({ type: "expense", description: "Curso online de Excel", category: "Educação", date: at(6, 12, 0), amount: 59.9, account: a }),
      tx({ type: "income", description: "Primeiro salário", category: "Salário", date: at(7, 9, 0), amount: 2100, account: a }),
      tx({ type: "expense", description: "Ajuda em casa", category: "Moradia", date: at(7, 18, 0), amount: 400, account: a }),
      tx({ type: "expense", description: "Recarga celular", category: "Contas", date: at(8, 10, 0), amount: 45, account: "Carteira" }),
      tx({ type: "expense", description: "Lanche faculdade", category: "Alimentação", date: at(9, 15, 0), amount: 22, account: "Carteira" }),
      tx({ type: "expense", description: "Bilhete único", category: "Transporte", date: at(10, 7, 0), amount: 88, account: a }),
    ],
    budgets: [
      { category: "Alimentação", limit: 350 },
      { category: "Lazer", limit: 200 },
      { category: "Transporte", limit: 200 },
      { category: "Compras", limit: 250 },
    ],
    journey: null,
    completedMissions: [],
    unlockedAchievements: ["first-login"],
    conversations: [],
    financial: { monthlyIncome: 2100, fixedExpenses: 545, debts: 0, emergencyFund: 150, priorities: "Comprar uma moto e aprender a investir" },
    notifications: true,
    hideValues: false,
  };
}

export const seedState = (id: PersonaId): PersonaState => (id === "janaina" ? janaina() : jose());
