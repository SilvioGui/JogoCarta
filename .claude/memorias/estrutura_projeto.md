---
name: Estrutura do Projeto JogoCarta
description: Mapa completo de pastas, arquivos e o que cada um faz
type: project
---

# Estrutura do Projeto — JogoCarta

```
JogoCarta/
├── .claude/
│   ├── agentes/                    ← Agentes especializados (subir no git)
│   │   ├── frontend.md             ← React, UI, animações, tabuleiro
│   │   ├── backend.md              ← Node.js, Socket.io, motor do jogo
│   │   ├── dba.md                  ← SQLite, schema, queries, migrações
│   │   ├── security.md             ← Anti-cheat, JWT, OWASP, lógica
│   │   ├── site_security.md        ← Headers, HTTPS, LGPD, infra
│   │   └── tcg_expert.md           ← Regras completas, mecânicas, balanceamento
│   └── memorias/                   ← Memórias do projeto separadas por tema
│       ├── arquetipos.md           ← 10 arquétipos com mecânicas
│       ├── regras_do_jogo.md       ← Regras completas resumidas
│       ├── seguranca.md            ← Padrões de segurança obrigatórios
│       ├── stack_tecnologica.md    ← Tecnologias escolhidas e por quê
│       └── estrutura_projeto.md    ← Este arquivo
├── Jogo carta/                     ← Documentação de design (NÃO é código)
│   ├── Arquetipos/                 ← Fichas detalhadas de cada arquétipo
│   ├── Decks/                      ← Decklists de exemplo
│   ├── Regras/                     ← Regras completas do jogo
│   └── ideias_jogo.md              ← Documento principal de ideias do Bruno
├── client/                         ← Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   └── auth/AuthGuard.tsx  ← Proteção de rotas
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx       ← Tela de login ✅
│   │   │   ├── RegisterPage.tsx    ← Tela de cadastro ✅
│   │   │   └── LobbyPage.tsx       ← Lobby (placeholder) ✅
│   │   ├── services/api.ts         ← Cliente HTTP tipado
│   │   ├── store/auth.store.ts     ← Estado global de autenticação
│   │   ├── types/auth.types.ts     ← Tipos TypeScript
│   │   ├── App.tsx                 ← Roteamento principal
│   │   └── index.css               ← Estilos globais (Tailwind)
│   └── vite.config.ts              ← Proxy para /api e WebSocket
├── server/                         ← Backend Node.js
│   ├── src/
│   │   ├── api/
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.ts      ← Verificação JWT
│   │   │   │   └── validate.middleware.ts  ← Validação Zod
│   │   │   └── routes/
│   │   │       └── auth.routes.ts          ← /api/auth/* ✅
│   │   ├── db/
│   │   │   ├── database.ts                 ← Conexão SQLite com pragmas
│   │   │   ├── migrate.ts                  ← Sistema de migrações
│   │   │   └── migrations/
│   │   │       └── 001_initial_schema.sql  ← Schema completo ✅
│   │   ├── types/auth.types.ts
│   │   └── index.ts                        ← Entry point do servidor ✅
│   ├── .env.example                        ← Template de variáveis
│   └── tsconfig.json
├── CLAUDE.md                       ← Memória persistente principal
├── .gitignore                      ← node_modules, .env, *.db excluídos
└── package.json                    ← Root package.json
```

## Status de Features

| Feature | Status |
|---------|--------|
| Agentes Claude | ✅ Criados |
| CLAUDE.md | ✅ Criado |
| Schema do banco | ✅ Criado |
| Sistema de migrações | ✅ Criado |
| API de autenticação | ✅ Criada |
| Tela de Login | ✅ Criada |
| Tela de Registro | ✅ Criada |
| AuthGuard (proteção de rotas) | ✅ Criado |
| Lobby (placeholder) | ✅ Criado |
| Construtor de Decks | ⏳ Pendente |
| Motor do Jogo (GameState) | ⏳ Pendente |
| WebSocket (partidas) | ⏳ Pendente |
| Matchmaking / Lobby real | ⏳ Pendente |
| Tabuleiro visual | ⏳ Pendente |
| Componente de Carta | ⏳ Pendente |

**Why:** Mapa do projeto para orientar implementações futuras.
**How to apply:** Sempre consultar antes de criar novos arquivos para evitar duplicação.
