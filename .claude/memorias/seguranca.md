---
name: Regras de Segurança do JogoCarta
description: Padrões e regras de segurança obrigatórios para toda implementação do projeto
type: project
---

# Segurança — JogoCarta

## Autenticação
- bcrypt com rounds=12 (nunca menos)
- JWT: access token 15min (em memória no cliente), refresh token 7 dias (cookie httpOnly)
- Refresh token rotacionado a cada uso
- Nunca revelar se email/username existe nas mensagens de erro

## Proteção contra Cheating
- Servidor é a ÚNICA fonte de verdade do estado do jogo
- Toda ação do cliente é validada no servidor antes de aceita
- Rate limit: 60 ações/minuto por WebSocket
- WebSocket autenticado com JWT no handshake

## SQL
- SEMPRE usar prepared statements (better-sqlite3 faz isso por padrão)
- NUNCA interpolar strings em queries SQL
- Cartas com creator_seal=1: NUNCA fazer UPDATE sem permissão do Bruno

## HTTP
- Helmet.js ativo com CSP configurado
- CORS: apenas a origem do frontend (nunca '*')
- Rate limiting: login 5x/15min, API geral 100x/min
- Headers: X-Frame-Options DENY, X-Content-Type-Options nosniff

## Dados Sensíveis
- password_hash nunca retorna ao cliente
- refresh_token nunca retorna ao cliente (apenas em cookie httpOnly)
- .env nunca commitado (sempre .env.example como template)

## Anti-Cheat do Jogo
- Validar antes de aceitar: turno do jogador, cartas na mão, Éter suficiente, fase correta
- Ações impossíveis são rejeitadas E logadas
- Banir após 10 ações impossíveis consecutivas

**Why:** Jogo online com dinheiro (potencial) — segurança é crítica para integridade das partidas e dos dados.
**How to apply:** Antes de implementar qualquer feature, revisar contra este documento.
