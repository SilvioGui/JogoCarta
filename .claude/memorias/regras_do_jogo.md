---
name: Regras Completas do JogoCarta
description: Todas as regras fundamentais do jogo — deck, HP, campo, turnos, combate, pilha e arquétipos
type: project
---

# Regras do JogoCarta

## Estrutura de Deck
- Main Deck: 100 cartas (máx 3 cópias por carta)
- Extra Deck: 5 Comandantes (sempre público)
- Relíquias: 6 modelos x 2 cópias = 12 cartas obrigatórias dentro do Main Deck
- Mão: inicial 7 cartas | limite 9 | Mulligan 1x por partida

## Vitória
- Reduzir HP do oponente a 0 (começa com 100 HP)
- Deck Out: oponente sem cartas para comprar
- Empate: ambos chegam a 0 HP ou Deck Out simultaneamente

## Campo — Duas Linhas
- Linha Superior (Front): Combate — atacar e bloquear
- Linha Inferior (Back): Recursos — gerar Éter e suporte
- Back → Front: custa 2 Éter
- Front → Back: carta não pode ter atacado/defendido neste turno

## Éter (Recurso)
- Gerado por cartas em Modo Recurso na Linha Inferior
- 1 Terreno gratuito/turno na Linha Inferior
- Éter reseta para 0 ao final do turno
- Exceção: Dragões com Tesouro preservam Éter entre turnos

## Fases do Turno
INÍCIO → COMPRA (1 carta) → FASE PRINCIPAL 1 → COMBATE → FASE PRINCIPAL 2 → FIM
- Primeiro turno: quem começa pula a Compra
- Fim do turno: Éter reseta, mão descarta até 9 cartas

## Corrente de Habilidades (Pilha)
- LIFO: Last In, First Out
- Reações entram na pilha a qualquer momento
- Mágicas apenas na Fase Principal (exceto com Ímpeto)

## Combate (5 Passos)
1. Declaração de Ataque (atacante vira)
2. Interceptação (Provocar ou Intervenção)
3. Janela de Reações (pilha do combate)
4. Troca de Dano (simultânea — sem "quem bate primeiro")
5. Resolução de Mortes (Último Suspiro ativa aqui)

## Visibilidade de Zonas
- Deck: PRIVADO
- Mão: PRIVADA (oponente vê só quantidade)
- Extra Deck: PÚBLICO
- Cemitério: PÚBLICO
- Campo: PÚBLICO

**Why:** Documento de referência rápida para implementar mecânicas sem consultar todos os arquivos de `Jogo carta/`.
**How to apply:** Usar como checklist ao implementar qualquer feature de gameplay.
