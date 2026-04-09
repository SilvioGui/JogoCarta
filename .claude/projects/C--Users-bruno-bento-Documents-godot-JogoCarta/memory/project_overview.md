---
name: Visão Geral do Projeto JogoCarta
description: TCG online em tempo real com React, Node.js, Socket.io e SQLite. 10 arquétipos, 100+ palavras-chave, sistema de pilha LIFO, campo de duas linhas.
type: project
---

# JogoCarta — Visão Geral

**Stack:** React 18 + TypeScript | Node.js + Express + Socket.io | SQLite (better-sqlite3)

**Why:** Jogo de cartas estratégico inspirado em MTG Commander e Yu-Gi-Oh!, criado do zero pelo Bruno Bento.

**How to apply:** Sempre consultar `Jogo carta/` para regras e `CLAUDE.md` para decisões de arquitetura. Agentes em `.claude/agentes/`.

## Regras Chave
- Deck: 100 cartas + 5 Extra Deck + 12 Relíquias (6 modelos x 2)
- HP: 100 por jogador
- Campo: 2 linhas (Front=Combate, Back=Recursos)
- Éter: reseta no fim do turno (exceto Tesouro/Dragões)
- Corrente: LIFO (sistema de pilha como Magic)
- 10 arquétipos com Regra 3+2 (3 mecânicas principais + 2 secundárias)
- 61 palavras-chave aprovadas

## Arquétipos
Anjos, Demônios, Dragões, Abissais, Mecânicos, Pútridos, Goblins, Espectros, Aranhas, Sombrios

## Status (2026-04-09)
- Regras: completas (documentadas em `Jogo carta/`)
- Agentes Claude: criados
- Frontend: em andamento

## Frontend implementado
- **`client/src/locales/pt-BR.ts`** — arquivo central de textos (TODOS os textos da UI aqui)
- **`client/src/store/theme.store.ts`** — tema claro/escuro persistido em localStorage
- **`client/src/index.css`** — CSS variables: dark (preto+dourado) e light (cinza+azul escuro)
- **`client/src/components/ui/ThemeToggle.tsx`** — botão de troca de tema
- **`client/src/pages/LoginPage.tsx`** — login com tema e tradução
- **`client/src/pages/RegisterPage.tsx`** — registro com tema e tradução
- **`client/src/pages/LobbyPage.tsx`** — seleção de modo de jogo (só Modo Normal visível)
- **`client/src/pages/MainMenuPage.tsx`** — hub do usuário com 8 seções + tutorial modal

## Fluxo de navegação
`/login` → `/lobby` (seleção de modo) → `/menu` (hub principal) → sub-páginas futuras
