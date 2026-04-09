# CLAUDE.md — JogoCarta: Memória Persistente do Projeto

> Este arquivo é lido automaticamente pelo Claude a cada conversa. Contém o contexto essencial do projeto, decisões tomadas e instruções para colaboração.

---

## 🎮 O Projeto

**JogoCarta** é um TCG (Trading Card Game) online em tempo real, criado por **Bruno Bento**.

- **Gênero:** Jogo de cartas estratégico inspirado em Magic: The Gathering (Commander) e Yu-Gi-Oh!
- **Stack:** React (frontend) + Node.js/Express + Socket.io (backend) + SQLite (banco de dados)
- **Comunicação:** WebSocket (Socket.io) para partidas em tempo real
- **Idioma do projeto:** Português Brasileiro (código em inglês, UI em PT-BR)

---

## 📁 Estrutura do Repositório

```
JogoCarta/
├── .claude/
│   └── agentes/           ← Definições dos agentes especializados
│       ├── frontend.md    ← React, UI/UX, animações de cartas
│       ├── backend.md     ← Node.js, Socket.io, motor do jogo
│       ├── dba.md         ← SQLite, schema, queries
│       ├── security.md    ← Anti-cheat, JWT, OWASP
│       ├── site_security.md ← Infraestrutura, headers, LGPD
│       └── tcg_expert.md  ← Regras do jogo, mecânicas, balanceamento
├── Jogo carta/            ← Documentação de design do jogo (NÃO é código)
│   ├── Arquetipos/        ← Fichas de cada arquétipo
│   ├── Decks/             ← Decklists de exemplo
│   ├── Regras/            ← Regras completas do jogo
│   └── ideias_jogo.md     ← Documento principal de ideias
├── client/                ← Frontend React (a ser criado)
├── server/                ← Backend Node.js (a ser criado)
├── CLAUDE.md              ← Este arquivo
└── memory/                ← Memórias específicas do Claude
```

---

## 🃏 Regras Fundamentais do Jogo (Resumo)

### Estrutura de Deck
- **Main Deck:** 100 cartas, máx 3 cópias por carta
- **Extra Deck:** 5 Comandantes (sempre visível para ambos)
- **Relíquias:** Exatamente 6 modelos x 2 cópias = 12 cartas obrigatórias
- **Mão inicial:** 7 cartas | Mulligan 1x | Limite mão: 9 cartas

### Vitória
- Reduzir HP do oponente a **0** (começa com **100 HP**)
- **Deck Out:** Oponente não tem cartas para comprar
- **Empate:** Ambos chegam a 0 HP ao mesmo tempo

### Campo — Duas Linhas
- **Linha Superior (Front):** Combate — atacar e bloquear
- **Linha Inferior (Back):** Recursos — gerar Éter e suporte
- **Back → Front:** Custa 2 Éter
- **Front → Back:** A carta não pode ter atacado/defendido neste turno

### Éter (Recurso)
- Gerado por cartas em **Modo Recurso** na Linha Inferior
- **1 Terreno gratuito por turno** na Linha Inferior
- Éter não gasto **reseta para 0** ao final do turno
- Exceção: Dragões com "Tesouro" preservam Éter entre turnos

### Fases do Turno
`INÍCIO → COMPRA → FASE PRINCIPAL 1 → COMBATE → FASE PRINCIPAL 2 → FIM`

### Corrente de Habilidades (Pilha)
- Sistema **LIFO** (Last In, First Out)
- Baseado na Stack do Magic: The Gathering
- Reações podem entrar na pilha a qualquer momento

---

## 🏛️ Arquétipos

| Arquétipo | Recurso Especial | Estilo |
|-----------|-----------------|--------|
| Anjos | Fé | Defesa, Escudo Divino |
| Demônios | - | Oferenda, Exumar |
| Dragões | Tesouro | Atropelar, Sobrecarga |
| Abissais | - | Fluxo da Maré, Dragar/Vaticinar |
| Mecânicos | - | Artefatos, Estruturas, Simbiose |
| Pútridos | - | Último Suspiro, Eco |
| Goblins | - | Tributo, Enxame |
| Espectros | - | Sombra, Infundir |
| Aranhas | - | Aprisionar, Infestação, Veneno |
| Sombrios | - | Roubo, Emboscada, Gancho |

**Regra 3+2:** Cada arquétipo tem **exatamente 3 mecânicas principais + 2 secundárias**.

---

## 🤖 Agentes Disponíveis

| Agente | Arquivo | Responsabilidade |
|--------|---------|-----------------|
| Frontend Designer | `.claude/agentes/frontend.md` | React, UI, animações, tabuleiro |
| Backend Developer | `.claude/agentes/backend.md` | API, WebSocket, motor de jogo |
| DBA | `.claude/agentes/dba.md` | SQLite, schema, queries |
| Security Expert | `.claude/agentes/security.md` | Anti-cheat, JWT, OWASP, lógica |
| Site Security | `.claude/agentes/site_security.md` | Headers, HTTPS, LGPD, infra |
| TCG Expert | `.claude/agentes/tcg_expert.md` | Regras, mecânicas, balanceamento |

---

## ⚠️ Regras Invioláveis (Definidas pelo Bruno)

1. **Cartas com `creator_seal = 1`:** NUNCA editar stats, efeitos ou remover sem permissão explícita do Bruno.
2. **Regras do jogo:** Nunca alterar regras fundamentais sem aprovação do criador.
3. **Éter reseta sempre** no fim do turno (exceto Tesouro dos Dragões).
4. **Dano excedente** NÃO passa para o jogador sem Atropelar ou Perfurar.
5. **Deck:** Exatamente 100 cartas no Main + 5 no Extra + 12 Relíquias.

---

## 🔐 Padrões de Segurança Obrigatórios

- **Nunca** armazenar senhas em texto plano (bcrypt, rounds >= 12)
- **Nunca** usar `*` no CORS em produção
- **Sempre** validar ações do jogo no **servidor** (cliente não é fonte de verdade)
- **JWT:** Access token 15min, Refresh token 7 dias em cookie HttpOnly
- **SQL:** Apenas prepared statements (nunca interpolação de string)
- **Inputs:** Validação com Zod em todos os endpoints e eventos WebSocket
- **Secrets:** Nunca hardcodar — sempre em `.env` (no `.gitignore`)

---

## 💻 Stack Tecnológica Definida

### Frontend (client/)
```
React 18 + TypeScript
Vite
Tailwind CSS + shadcn/ui
Framer Motion
socket.io-client
Zustand (estado global)
React Query
React Router v6
React Hook Form + Zod
```

### Backend (server/)
```
Node.js 20+ + TypeScript
Express 5
Socket.io 4
better-sqlite3
bcryptjs
jsonwebtoken
zod
uuid
dotenv
```

---

## 📋 Status do Projeto

| Fase | Status | Descrição |
|------|--------|-----------|
| Definição de Regras | ✅ Completo | Documentado em `Jogo carta/` |
| Agentes Claude | ✅ Completo | Criados em `.claude/agentes/` |
| Setup do Projeto | 🔄 Em andamento | Estrutura React + Node.js |
| Tela de Login | 🔄 Em andamento | Primeira feature a implementar |
| Sistema de Decks | ⏳ Pendente | - |
| Motor do Jogo | ⏳ Pendente | - |
| Partidas em Tempo Real | ⏳ Pendente | - |

---

## 📝 Decisões de Arquitetura

- **SQLite em vez de PostgreSQL:** Escolha deliberada para simplicidade. O estado em tempo real das partidas fica em memória no servidor; SQLite persiste apenas dados não-voláteis.
- **Socket.io em vez de WebSocket puro:** Facilita reconexão automática e salas de jogo.
- **Servidor como fonte de verdade:** O estado do jogo NUNCA é confiado ao cliente para prevenir cheating.
- **React SPA:** Desktop-first (o jogo requer uma tela grande para o tabuleiro).

---

*Última atualização: 2026-04-09 — Criação inicial dos agentes e estrutura do projeto.*
