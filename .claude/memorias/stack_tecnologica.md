---
name: Stack Tecnológica do JogoCarta
description: Todas as tecnologias escolhidas para frontend, backend e banco de dados
type: project
---

# Stack Tecnológica — JogoCarta

## Frontend (`client/`)
- React 18 + TypeScript + Vite
- Tailwind CSS (via @tailwindcss/vite)
- Framer Motion (animações de cartas)
- socket.io-client (WebSocket)
- Zustand (estado global — store de auth, game state)
- React Router v6 (roteamento)
- React Hook Form + Zod (formulários e validação)

## Backend (`server/`)
- Node.js 20+ + TypeScript
- Express 5 (HTTP API)
- Socket.io 4 (WebSocket / partidas em tempo real)
- better-sqlite3 (banco de dados)
- bcryptjs (hash de senhas, rounds=12)
- jsonwebtoken (JWT — access 15min, refresh 7 dias)
- zod (validação de todos os inputs)
- uuid (geração de IDs)
- cookie-parser (cookies httpOnly para refresh token)
- helmet + cors + express-rate-limit (segurança)
- dotenv (variáveis de ambiente)

## Banco de Dados
- SQLite (better-sqlite3)
- WAL mode, foreign_keys ON
- Sistema de migrações em `server/src/db/migrations/`
- Estado do jogo em tempo real: em MEMÓRIA (não persistido durante partida)
- Apenas resultado final persistido no SQLite

## Comunicação
- REST API: autenticação, decks, catálogo de cartas
- WebSocket (Socket.io): partidas em tempo real, lobby, matchmaking

**Why:** Decisões tomadas para simplicidade (SQLite) e performance em tempo real (Socket.io).
**How to apply:** Não sugerir trocar SQLite por outro banco. Não sugerir Redux (usar Zustand). Seguir estas escolhas.
