/**
 * Tokeni Idle Game — Carro dream configuration.
 * All data is static; the engine consumes it with live financial state.
 */

import type { DreamConfig } from "../types";

export const CAR_DREAM: DreamConfig = {
  kind: "car",
  label: "Meu primeiro carro",
  mockTarget: 80_000,
  mockSaved: 32_000,
  stages: [
    {
      index: 0,
      minPct: 0,
      label: "Carro abandonado",
      sceneDesc: "Carro antigo, enferrujado e com aparência de abandono.",
      insight: "Todo grande carro começa como um projeto. Você já iniciou a jornada!",
    },
    {
      index: 1,
      minPct: 0.1,
      label: "Limpeza inicial",
      sceneDesc: "Carro limpo, ferrugem removida, pronto para restauração.",
      insight: "A limpeza inicial está feita! Cada detalhe conta nessa restauração.",
    },
    {
      index: 2,
      minPct: 0.2,
      label: "Rodas novas",
      sceneDesc: "Rodas e pneus novos instalados.",
      insight: "Você já conseguiu recuperar as rodas do seu futuro carro!",
    },
    {
      index: 3,
      minPct: 0.3,
      label: "Mecânica revisada",
      sceneDesc: "Motor, suspensão e freios revisados.",
      insight: "A parte mecânica está em ordem! Seu carro já está pronto para rodar.",
    },
    {
      index: 4,
      minPct: 0.4,
      label: "Lataria recuperada",
      sceneDesc: "Lataria alinhada e pequenos danos reparados.",
      insight: "A lataria já está praticamente recuperada! Seu carro está ganhando nova vida.",
    },
    {
      index: 5,
      minPct: 0.5,
      label: "Pintura nova",
      sceneDesc: "Pintura renovada na cor escolhida.",
      insight: "Que transformação! A pintura nova deixou seu carro irreconhecível.",
    },
    {
      index: 6,
      minPct: 0.6,
      label: "Faróis e vidros",
      sceneDesc: "Faróis modernos, vidros e retrovisores novos.",
      insight: "Seu carro está começando a parecer de showroom. Falta pouco!",
    },
    {
      index: 7,
      minPct: 0.7,
      label: "Interior restaurado",
      sceneDesc: "Bancos, painel e revestimento interno novos.",
      insight: "Interior completamente renovado! Entra e parece outro carro.",
    },
    {
      index: 8,
      minPct: 0.8,
      label: "Acessórios e acabamentos",
      sceneDesc: "Som novo, rodas personalizadas e acabamentos premium.",
      insight: "Falta pouco para dar a primeira volta no seu carro novo!",
    },
    {
      index: 9,
      minPct: 0.9,
      label: "Carro quase pronto",
      sceneDesc: "Ajustes finais, detalhes e personalização concluídos.",
      insight: "Você está a um passo do seu carro dos sonhos. Continue!",
    },
    {
      index: 10,
      minPct: 1.0,
      label: "Carro conquistado!",
      sceneDesc: "Carro completamente restaurado, brilhando como novo!",
      insight: "PARABÉNS! Seu carro está pronto e você mereceu cada quilômetro!",
    },
  ],
  missions: [
    {
      id: "car-login",
      title: "Abra a garagem",
      description: "Acesse o Tokeni e visite a aba Sonhos.",
      category: "daily",
      reward: { id: "car-tools", slot: "tools", label: "Caixa de ferramentas", description: "Uma caixa de ferramentas aparece na garagem." },
    },
    {
      id: "car-progress",
      title: "Inspecione o progresso",
      description: "Consulte o progresso financeiro do seu sonho.",
      category: "daily",
      reward: { id: "car-mechanic", slot: "mechanic", label: "Mecânico trabalhando", description: "Um mecânico aparece vistoriando o carro." },
    },
    {
      id: "car-profile",
      title: "Personalize seu perfil",
      description: "Atualize suas informações no Perfil.",
      category: "interaction",
      reward: { id: "car-sticker", slot: "sticker", label: "Adesivo no carro", description: "Um adesivo especial decora o capô." },
    },
    {
      id: "car-transaction",
      title: "Contribua para o carro",
      description: "Registre uma contribuição para seu sonho.",
      category: "interaction",
      reward: { id: "car-trophy", slot: "trophy", label: "Troféu na prateleira", description: "Um troféu aparece na prateleira da garagem." },
    },
    {
      id: "car-streak",
      title: "Rotina de manutenção",
      description: "Acesse o Tokeni por 3 dias seguidos.",
      category: "daily",
      reward: { id: "car-equipment", slot: "equipment", label: "Equipamentos novos", description: "Equipamentos novos chegam para a garagem." },
    },
    {
      id: "car-report",
      title: "Revise o orçamento",
      description: "Visualize a seção de orçamento no Dashboard.",
      category: "interaction",
      reward: { id: "car-flag", slot: "flag", label: "Bandeira de chegada", description: "Uma bandeira xadrez decora a parede da garagem." },
    },
    {
      id: "car-celebrate",
      title: "Comemore o progresso",
      description: "Converse com o Tokeni IA sobre seu sonho.",
      category: "interaction",
      reward: { id: "car-character", slot: "character", label: "Personagem comemorando", description: "Um personagem animado comemora ao lado do carro." },
    },
  ],
};
