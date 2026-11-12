import {
  Utensils, Bus, Home, Zap, Gamepad2, HeartPulse, GraduationCap, Briefcase,
  Target, ShoppingBag, Baby, CreditCard, Wallet, type LucideIcon,
} from "lucide-react";

export const CATEGORIES: Record<string, LucideIcon> = {
  Alimentação: Utensils,
  Transporte: Bus,
  Moradia: Home,
  Contas: Zap,
  Lazer: Gamepad2,
  Saúde: HeartPulse,
  Educação: GraduationCap,
  Compras: ShoppingBag,
  Filhos: Baby,
  Dívidas: CreditCard,
  Salário: Briefcase,
  "Renda extra": Wallet,
  Sonho: Target,
};
export const EXPENSE_CATEGORIES = ["Alimentação","Transporte","Moradia","Contas","Lazer","Saúde","Educação","Compras","Filhos","Dívidas"];
export const INCOME_CATEGORIES = ["Salário","Renda extra"];
export const iconFor = (c: string) => CATEGORIES[c] ?? Wallet;
