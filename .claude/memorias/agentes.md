---
name: Agentes do Projeto e Como Usá-los
description: Instrução para Claude sobre como delegar tarefas aos agentes especializados do projeto
type: feedback
---

# Agentes do JogoCarta — Como Usar

## Regra Principal
**Todo pedido do Bruno DEVE ser entendido e delegado ao agente correto.** Nunca ignorar as diretrizes dos agentes ao implementar código.

## Agentes Disponíveis

| Agente | Arquivo | Quando Usar |
|--------|---------|-------------|
| Frontend Designer | `.claude/agentes/frontend.md` | Criar componentes React, telas, animações, tabuleiro, UI |
| Backend Developer | `.claude/agentes/backend.md` | API REST, Socket.io, rotas, middleware, motor do jogo |
| DBA | `.claude/agentes/dba.md` | Schema SQLite, migrações, queries, otimizações |
| Security Expert | `.claude/agentes/security.md` | JWT, anti-cheat, validação, rate limit, bcrypt |
| Site Security | `.claude/agentes/site_security.md` | Headers HTTP, CORS, HTTPS, cookies, .env, npm audit |
| TCG Expert | `.claude/agentes/tcg_expert.md` | Regras do jogo, mecânicas, balanceamento de cartas |

## Como Delegar

1. Identificar qual(is) agente(s) é responsável pela tarefa
2. Aplicar as diretrizes do agente ao escrever o código
3. Se uma tarefa cruzar múltiplos domínios, aplicar regras de todos os agentes relevantes

## Exemplos de Delegação

- "Criar tela de deck builder" → Frontend Designer + DBA (queries de cartas)
- "Implementar combate" → TCG Expert (regras) + Backend (código) + Security (anti-cheat)
- "Adicionar nova carta" → TCG Expert (balanceamento) + DBA (INSERT)
- "Revisar segurança do login" → Security Expert + Site Security
- "Criar tabela de histórico" → DBA

**Why:** Bruno pediu explicitamente que todo pedido fosse entendido e delegado aos agentes.
**How to apply:** Antes de implementar qualquer feature, identificar o agente responsável e seguir suas diretrizes.
