export type PersonaId = "janaina" | "jose";
export type TxType = "income" | "expense" | "dream";

export interface Transaction {
  id: string;
  type: TxType;
  description: string;
  category: string;
  date: string; // ISO
  amount: number; // always positive
  account: string;
  note?: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  levelIndex: number;
  main: boolean;
}

export interface Level {
  name: string;
  description: string;
  missionId: string;
}

export interface Journey {
  dream: string;
  target: number;
  saved: number;
  months: number;
  createdAt: string;
  levels: Level[];
  missions: Mission[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  proposal?: Journey;
  simulated?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export interface FinancialProfile {
  monthlyIncome: number;
  fixedExpenses: number;
  debts: number;
  emergencyFund: number;
  priorities: string;
}

export interface PersonaState {
  transactions: Transaction[];
  budgets: Budget[];
  journey: Journey | null;
  completedMissions: string[];
  unlockedAchievements: string[];
  conversations: Conversation[];
  financial: FinancialProfile;
  notifications: boolean;
  hideValues: boolean;
}

export interface PersonaInfo {
  id: PersonaId;
  name: string;
  firstName: string;
  email: string;
  occupation: string;
  bio: string;
  accounts: string[];
  dreamHint: string;
}
