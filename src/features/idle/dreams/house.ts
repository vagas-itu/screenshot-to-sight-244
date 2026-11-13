/**
 * Tokeni Idle Game — Casa dream configuration.
 * All data is static; the engine consumes it with live financial state.
 */

import type { DreamConfig } from "../types";

export const HOUSE_DREAM: DreamConfig = {
  kind: "house",
  label: "Minha primeira casa",
  mockTarget: 200_000,
  mockSaved: 70_000,
  stages: [
    {
      index: 0,
      minPct: 0,
      label: "Terreno vazio",
      sceneDesc: "Terreno limpo, grama e uma placa com o projeto.",
      insight: "Seu sonho começa com um passo. Cada real guardado planta uma semente.",
    },
    {
      index: 1,
      minPct: 0.1,
      label: "Preparação do solo",
      sceneDesc: "Marcações no chão, limpeza e preparação do terreno.",
      insight: "O terreno está sendo preparado! Você já saiu do zero.",
    },
    {
      index: 2,
      minPct: 0.2,
      label: "Fundação",
      sceneDesc: "Alicerces e fundação da casa construídos.",
      insight: "A fundação da sua casa está pronta! Com essa base, tudo o mais pode ser construído.",
    },
    {
      index: 3,
      minPct: 0.3,
      label: "Paredes em construção",
      sceneDesc: "Paredes parcialmente levantadas.",
      insight: "Com o valor que você já juntou, sua casa já teria uma fundação pronta e as paredes começando!",
    },
    {
      index: 4,
      minPct: 0.4,
      label: "Paredes completas",
      sceneDesc: "Paredes e divisão interna dos cômodos finalizadas.",
      insight: "Você já tem dinheiro suficiente para levantar todas as paredes da sua casa!",
    },
    {
      index: 5,
      minPct: 0.5,
      label: "Telhado em andamento",
      sceneDesc: "Estrutura do telhado sendo instalada.",
      insight: "Sua casa está ganhando forma. Falta pouco para o telhado ficar pronto!",
    },
    {
      index: 6,
      minPct: 0.6,
      label: "Telhado e aberturas",
      sceneDesc: "Telhado completo, portas e janelas instaladas.",
      insight: "Telhado completo! Sua casa já está protegida das chuvas.",
    },
    {
      index: 7,
      minPct: 0.7,
      label: "Pintura e acabamento",
      sceneDesc: "Pintura externa e acabamentos aplicados.",
      insight: "A casa ganhou cor! Você está na reta final dos acabamentos.",
    },
    {
      index: 8,
      minPct: 0.8,
      label: "Jardim e calçada",
      sceneDesc: "Jardim, calçada e iluminação externa instalados.",
      insight: "Agora só faltam os detalhes finais para sua casa ficar perfeita!",
    },
    {
      index: 9,
      minPct: 0.9,
      label: "Casa quase pronta",
      sceneDesc: "Detalhes decorativos e retoques finais.",
      insight: "Você está quase lá! Sua casa está praticamente pronta para receber você.",
    },
    {
      index: 10,
      minPct: 1.0,
      label: "Casa conquistada!",
      sceneDesc: "Casa completa, linda e pronta para morar!",
      insight: "PARABÉNS! Você realizou seu sonho da casa própria!",
    },
  ],
  missions: [
    {
      id: "house-login",
      title: "Bem-vindo ao seu canteiro",
      description: "Acesse o Tokeni e visite a aba Sonhos.",
      category: "daily",
      reward: { id: "house-bicicleta", slot: "bicicleta", label: "Bicicleta na entrada", description: "Uma bicicleta aparece na entrada do jardim." },
    },
    {
      id: "house-progress",
      title: "Acompanhe sua obra",
      description: "Consulte o progresso financeiro do seu sonho.",
      category: "daily",
      reward: { id: "house-arvore", slot: "arvore", label: "Árvore com balanço", description: "Uma árvore com balanço enfeita o quintal." },
    },
    {
      id: "house-profile",
      title: "Personalize seu perfil",
      description: "Atualize suas informações no Perfil.",
      category: "interaction",
      reward: { id: "house-canteiro", slot: "canteiro", label: "Canteiro de flores", description: "Flores coloridas decoram a entrada." },
    },
    {
      id: "house-transaction",
      title: "Registre uma economia",
      description: "Registre uma contribuição para seu sonho.",
      category: "interaction",
      reward: { id: "house-poste", slot: "poste", label: "Poste de luz", description: "Um poste ilumina a entrada da casa." },
    },
    {
      id: "house-streak",
      title: "Sequência de 3 dias",
      description: "Acesse o Tokeni por 3 dias seguidos.",
      category: "daily",
      reward: { id: "house-cachorro", slot: "cachorro", label: "Cachorro no quintal", description: "Um cãozinho feliz com sua casinha aparecem no jardim." },
    },
    {
      id: "house-report",
      title: "Consulte seu orçamento",
      description: "Visualize a seção de orçamento no Dashboard.",
      category: "interaction",
      reward: { id: "house-gato", slot: "gato", label: "Gato e casinha", description: "Um gatinho laranja e sua casinha aparecem no quintal." },
    },
    {
      id: "house-tree2",
      title: "Segundo canteiro",
      description: "Converse com o Tokeni IA sobre seu sonho.",
      category: "interaction",
      reward: { id: "house-canteiro2", slot: "canteiro2", label: "Segundo canteiro", description: "Mais flores embelezam o jardim." },
    },
  ],
};
