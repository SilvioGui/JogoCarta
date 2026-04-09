---
name: Regras de Implementação do Jogo
description: Regras técnicas fundamentais do JogoCarta para guiar a implementação do motor de jogo
type: project
---

# Regras Técnicas do Motor de Jogo

**Why:** Garantir que a implementação reflita exatamente o design do Bruno.
**How to apply:** Consultar sempre ao implementar lógica de combate, recursos e fases.

## Campo
- Dois jogadores, cada um com: Linha Superior (Front/combate) + Linha Inferior (Back/recursos)
- Back→Front (Avanço): custa 2 Éter. Front→Back (Retirada): carta não pode ter atacado/defendido no turno.
- Zonas por linha: INFINITAS.

## Éter
- Começa em 0 por turno. Gerado apenas por cartas em Modo Recurso ou Estruturas.
- 1 carta com selo /Terreno pode ser jogada GRÁTIS por turno na Retaguarda (Modo Recurso).
- Modo Recurso: carta silenciada (sem nome/stats/efeitos), gera +1 Éter/turno.
- Deve ficar em Modo Recurso pelo menos 1 round completo antes de poder Reverter.
- Éter RESETA para 0 no fim do turno. Exceção: Tesouro dos Dragões (preserva entre turnos, só para cartas Dragão).
- Reversão: gratuita, carta "acorda" e recupera stats. Mágicas Híbridas revertidas entram na Corrente imediatamente e vão ao Cemitério.

## Fases
START → DRAW → MAIN1 → COMBAT → MAIN2 → END
- DRAW: Primeiro turno do jogo (quem começa) PULA o saque.
- END: Descartar até limite de 9 cartas na mão.
- Início de turno: desvirar todas as cartas do jogador ativo.

## Combate (5 passos)
1. Declarar atacante (apenas Linha Superior, não pode estar virado, não atacou este turno)
2. Alvo: criatura na Linha Superior inimiga. Se vazia, dano vai direto nos 100 HP.
3. Interceptação: Provocar e Intervenção podem redirecionar.
4. Janela de Reação: Reações entram na Corrente (LIFO).
5. Troca de dano SIMULTÂNEA. Dano excedente NÃO vaza sem Atropelar/Perfurar.
6. Resolução de mortes → Cemitério. Último Suspiro entra na Corrente AQUI.

## Tokens
- Criados por efeitos. Custo 0. Ao morrer: Cemitério momentaneamente (ativa Último Suspiro), depois BANIDOS.
- Não podem ser Exumados.

## Condições de Vitória
- HP <= 0: derrota
- Deck Out: precisar sacar sem cartas = derrota
- Empate: ambos chegam a 0 HP simultaneamente OU ambos sofrem Deck Out no mesmo momento

## Corrente (Pilha LIFO)
- Last In, First Out. Igual à Stack do Magic.
- Reações podem entrar a qualquer momento de prioridade.

## Visibilidade
- Deck: PRIVADO. Mão: PRIVADA (oponente só vê quantidade). Extra Deck: PÚBLICO. Cemitério: PÚBLICO. Campo: PÚBLICO.

## Regras de Deck
- Main Deck: 100 cartas, máximo 3 cópias por carta.
- Extra Deck: 5 Comandantes (sempre visível).
- Relíquias: obrigatório 6 modelos x 2 cópias = 12 cartas no Main.
- Mão inicial: 7 cartas. Mulligan: 1x (devolve 7, saca 7 novas). Limite de mão: 9.

## Virar (Tap/Exaustão)
- Carta deve ser VIRADA ao declarar ataque ou por custo de habilidade.
- Desvirada no início do turno do dono.
- Carta virada: não pode atacar nem usar habilidades de virar.
