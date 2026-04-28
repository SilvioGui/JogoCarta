import type {
  GameState, GameAction, ActionResult, GameEvent,
  GamePhase, PlayerState, GameCard,
} from '../types/game.types';
import {
  drawCards, spendEther, moveCardToZone, findCard,
  findCardInGame, untapAllCards, applyEtherGeneration,
  getOpponent, checkWinConditions, calculateEtherGeneration,
  createGameCard,
} from './state';
import { v4 as uuid } from 'uuid';

// =============================================================================
// MOTOR DO JOGO — VALIDAÇÃO E EXECUÇÃO DE AÇÕES
// Todas as ações são validadas no servidor. O cliente nunca é confiado.
// =============================================================================

const PHASE_ORDER: GamePhase[] = ['start', 'draw', 'main1', 'combat', 'main2', 'end'];

export function processAction(
  state: GameState,
  playerId: string,
  action: GameAction,
): ActionResult {
  const events: GameEvent[] = [];

  try {
    switch (action.type) {
      case 'draw_card':       return actionDrawCard(state, playerId, events);
      case 'play_card':       return actionPlayCard(state, playerId, action, events);
      case 'revert_resource': return actionRevertResource(state, playerId, action, events);
      case 'move_card':       return actionMoveCard(state, playerId, action, events);
      case 'tap_card':        return actionTapCard(state, playerId, action, events);
      case 'declare_attack':  return actionDeclareAttack(state, playerId, action, events);
      case 'declare_block':   return actionDeclareBlock(state, playerId, action, events);
      case 'pass_priority':   return actionPassPriority(state, playerId, events);
      case 'next_phase':      return actionNextPhase(state, playerId, events);
      case 'end_turn':        return actionEndTurn(state, playerId, events);
      case 'surrender':       return actionSurrender(state, playerId, events);
      default:                return err('Ação desconhecida');
    }
  } catch (e) {
    return err(`Erro interno: ${(e as Error).message}`);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ok(state: GameState, events: GameEvent[]): ActionResult {
  return { ok: true, state, events };
}

function err(message: string): ActionResult {
  return { ok: false, error: message };
}

function isActivePlayer(state: GameState, playerId: string): boolean {
  return state.activePlayerId === playerId;
}

// ---------------------------------------------------------------------------
// SACAR CARTA
// ---------------------------------------------------------------------------

function actionDrawCard(
  state: GameState,
  playerId: string,
  events: GameEvent[],
): ActionResult {
  if (!isActivePlayer(state, playerId)) return err('Não é seu turno');
  if (state.phase !== 'draw' && state.phase !== 'main1' && state.phase !== 'main2') {
    return err('Não é possível sacar carta nesta fase');
  }

  const player = state.players[playerId];

  // Deck Out
  if (player.deck.length === 0) {
    player.hp = 0;
    player.hasLost = true;
    checkWinConditions(state);
    events.push({ type: 'game_ended', winner: state.winner, isDraw: state.isDraw, reason: state.endReason });
    return ok(state, events);
  }

  const drawn = drawCards(player, 1);
  if (drawn.length > 0) {
    events.push({ type: 'card_drawn', playerId, card: drawn[0] });
  }

  return ok(state, events);
}

// ---------------------------------------------------------------------------
// JOGAR CARTA
// ---------------------------------------------------------------------------

function actionPlayCard(
  state: GameState,
  playerId: string,
  action: Extract<GameAction, { type: 'play_card' }>,
  events: GameEvent[],
): ActionResult {
  if (!isActivePlayer(state, playerId)) return err('Não é seu turno');
  if (state.phase !== 'main1' && state.phase !== 'main2') {
    return err('Só é possível jogar cartas na Fase Principal');
  }

  const player = state.players[playerId];
  const card = findCard(player, action.instanceId);
  if (!card || card.zone !== 'hand') return err('Carta não encontrada na mão');

  // Reações podem ser jogadas a qualquer momento (tratadas separadamente)
  if (card.cardType === 'reaction') {
    return err('Reações são jogadas via pass_priority na Corrente');
  }

  // --- Jogar como Modo Recurso (Terreno) ---
  if (action.asResource) {
    if (action.targetZone !== 'back') return err('Modo Recurso só pode ser na Linha Inferior');
    if (!card.isTerrain && card.cardType !== 'terrain' && card.cardType !== 'relic') {
      return err('Apenas cartas com selo /Terreno podem ser jogadas como recurso gratuitamente');
    }
    if (player.hasPlayedFreeLand) return err('Já jogou o terreno gratuito neste turno');

    player.hasPlayedFreeLand = true;
    moveCardToZone(player, card.instanceId, 'back');
    card.isResourceMode = true;
    card.resourceModeTurns = 0;
    card.enteredThisTurn = true;
    events.push({ type: 'card_played', playerId, card, zone: 'back' });
    return ok(state, events);
  }

  // --- Jogar normalmente pagando Éter ---
  const cost = card.etherCost;
  if (!spendEther(player, cost)) {
    return err(`Éter insuficiente. Necessário: ${cost}, Disponível: ${player.ether}`);
  }

  const targetZone = action.targetZone;

  // Mágicas e Reações não ficam no campo
  if (card.cardType === 'magic') {
    // Entra na Corrente e vai ao Cemitério após resolver
    state.chain.push({
      id: uuid(),
      sourceInstanceId: card.instanceId,
      sourcePlayerId: playerId,
      type: 'magic',
      description: `${card.name}`,
      data: { card },
    });
    moveCardToZone(player, card.instanceId, 'graveyard');
    events.push({ type: 'card_played', playerId, card, zone: 'graveyard' });
    events.push({ type: 'chain_added', item: state.chain[state.chain.length - 1] });
    return ok(state, events);
  }

  // Estruturas e Artefatos só vão para a Linha Inferior
  if ((card.cardType === 'structure' || card.cardType === 'artifact') && targetZone === 'front') {
    return err('Estruturas e Artefatos só podem ser jogadas na Linha Inferior');
  }

  moveCardToZone(player, card.instanceId, targetZone);
  card.enteredThisTurn = true;
  events.push({ type: 'card_played', playerId, card, zone: targetZone });

  // Efeito de Invocação (Battlecry) entra na Corrente
  if (card.keywords.includes('invocacao')) {
    state.chain.push({
      id: uuid(),
      sourceInstanceId: card.instanceId,
      sourcePlayerId: playerId,
      type: 'ability',
      description: `Invocação de ${card.name}`,
      data: { trigger: 'enter_field', card },
    });
    events.push({ type: 'chain_added', item: state.chain[state.chain.length - 1] });
  }

  return ok(state, events);
}

// ---------------------------------------------------------------------------
// REVERTER MODO RECURSO (Ligar uma carta)
// ---------------------------------------------------------------------------

function actionRevertResource(
  state: GameState,
  playerId: string,
  action: Extract<GameAction, { type: 'revert_resource' }>,
  events: GameEvent[],
): ActionResult {
  if (!isActivePlayer(state, playerId)) return err('Não é seu turno');
  if (state.phase !== 'main1' && state.phase !== 'main2') {
    return err('Só é possível reverter na Fase Principal');
  }

  const player = state.players[playerId];
  const card = findCard(player, action.instanceId);
  if (!card || card.zone !== 'back') return err('Carta não encontrada na Linha Inferior');
  if (!card.isResourceMode) return err('Carta não está em Modo Recurso');
  if (card.resourceModeTurns < 1) {
    return err('A carta precisa passar pelo menos 1 round completo em Modo Recurso antes de ser Revertida');
  }

  card.isResourceMode = false;
  card.resourceModeTurns = 0;
  events.push({ type: 'card_moved', instanceId: card.instanceId, from: 'back', to: 'back' });

  // Mágicas Híbridas revertidas entram na Corrente imediatamente e vão ao Cemitério
  if (card.cardType === 'magic') {
    state.chain.push({
      id: uuid(),
      sourceInstanceId: card.instanceId,
      sourcePlayerId: playerId,
      type: 'magic',
      description: `${card.name} (Reversão)`,
      data: { card, trigger: 'revert' },
    });
    moveCardToZone(player, card.instanceId, 'graveyard');
    events.push({ type: 'chain_added', item: state.chain[state.chain.length - 1] });
    events.push({ type: 'card_to_graveyard', card });
  }

  return ok(state, events);
}

// ---------------------------------------------------------------------------
// MOVER CARTA ENTRE LINHAS
// ---------------------------------------------------------------------------

function actionMoveCard(
  state: GameState,
  playerId: string,
  action: Extract<GameAction, { type: 'move_card' }>,
  events: GameEvent[],
): ActionResult {
  if (!isActivePlayer(state, playerId)) return err('Não é seu turno');
  if (state.phase !== 'main1' && state.phase !== 'main2') {
    return err('Movimentação só é permitida na Fase Principal');
  }

  const player = state.players[playerId];
  const card = findCard(player, action.instanceId);
  if (!card) return err('Carta não encontrada');

  if (action.direction === 'advance') {
    // Back → Front: custa 2 Éter
    if (card.zone !== 'back') return err('Carta não está na Linha Inferior');
    if (card.isResourceMode) return err('Não é possível avançar uma carta em Modo Recurso');
    if (!spendEther(player, 2)) return err('Éter insuficiente para Avançar (custo: 2)');

    moveCardToZone(player, card.instanceId, 'front');
    card.enteredThisTurn = true;
    events.push({ type: 'card_moved', instanceId: card.instanceId, from: 'back', to: 'front' });

    // Habilidade de Avanço entra na Corrente
    if (card.keywords.includes('avanco')) {
      state.chain.push({
        id: uuid(),
        sourceInstanceId: card.instanceId,
        sourcePlayerId: playerId,
        type: 'ability',
        description: `Avanço de ${card.name}`,
        data: { trigger: 'advance', card },
      });
      events.push({ type: 'chain_added', item: state.chain[state.chain.length - 1] });
    }

  } else {
    // Front → Back: não pode ter atacado ou bloqueado neste turno
    if (card.zone !== 'front') return err('Carta não está na Linha Superior');
    if (card.attackedThisTurn) return err('Carta já atacou neste turno — não pode recuar');
    if (card.blockedThisTurn) return err('Carta já bloqueou neste turno — não pode recuar');

    moveCardToZone(player, card.instanceId, 'back');
    events.push({ type: 'card_moved', instanceId: card.instanceId, from: 'front', to: 'back' });

    // Habilidade de Retirada entra na Corrente
    if (card.keywords.includes('retirada')) {
      state.chain.push({
        id: uuid(),
        sourceInstanceId: card.instanceId,
        sourcePlayerId: playerId,
        type: 'ability',
        description: `Retirada de ${card.name}`,
        data: { trigger: 'retreat', card },
      });
      events.push({ type: 'chain_added', item: state.chain[state.chain.length - 1] });
    }
  }

  return ok(state, events);
}

// ---------------------------------------------------------------------------
// VIRAR CARTA (tap manual por custo de habilidade)
// ---------------------------------------------------------------------------

function actionTapCard(
  state: GameState,
  playerId: string,
  action: Extract<GameAction, { type: 'tap_card' }>,
  events: GameEvent[],
): ActionResult {
  if (!isActivePlayer(state, playerId)) return err('Não é seu turno');

  const player = state.players[playerId];
  const card = findCard(player, action.instanceId);
  if (!card) return err('Carta não encontrada');
  if (card.zone !== 'front' && card.zone !== 'back') return err('Carta não está no campo');
  if (card.isTapped) return err('Carta já está virada');

  card.isTapped = true;
  events.push({ type: 'card_tapped', instanceId: card.instanceId });

  return ok(state, events);
}

// ---------------------------------------------------------------------------
// DECLARAR ATAQUE
// ---------------------------------------------------------------------------

function actionDeclareAttack(
  state: GameState,
  playerId: string,
  action: Extract<GameAction, { type: 'declare_attack' }>,
  events: GameEvent[],
): ActionResult {
  if (!isActivePlayer(state, playerId)) return err('Não é seu turno');
  if (state.phase !== 'combat') return err('Só é possível atacar na Fase de Combate');
  if (state.combat !== null) return err('Já há um combate em andamento');

  const player = state.players[playerId];
  const attacker = findCard(player, action.attackerInstanceId);

  if (!attacker) return err('Atacante não encontrado');
  if (attacker.zone !== 'front') return err('Apenas cartas na Linha Superior podem atacar');
  if (attacker.isTapped) return err('Carta está virada e não pode atacar');
  if (attacker.attackedThisTurn) return err('Esta carta já atacou neste turno');
  if (attacker.enteredThisTurn && !attacker.keywords.includes('impeto')) {
    return err('Carta entrou em campo neste turno e não possui Ímpeto');
  }
  if (attacker.isResourceMode) return err('Carta em Modo Recurso não pode atacar');
  if (attacker.cardType !== 'monster') return err('Apenas Monstros podem atacar');

  const opponent = getOpponent(state, playerId);

  // Validar alvo
  if (action.defenderInstanceId !== null) {
    // Ataque a uma criatura
    const defender = findCard(opponent, action.defenderInstanceId);
    if (!defender) return err('Defensor não encontrado');
    if (defender.zone !== 'front') {
      // Pode atacar Linha Inferior apenas com Alcance
      if (defender.zone === 'back' && !attacker.keywords.includes('alcance')) {
        return err('Não é possível atacar a Linha Inferior sem Alcance');
      }
    }
    // Verificar Provocar — se existir algum com Provocar no Front do oponente, deve ser atacado primeiro
    const hasTaunt = opponent.field.front.some(c => c.keywords.includes('provocar') && !c.isResourceMode);
    if (hasTaunt && !defender.keywords.includes('provocar')) {
      return err('Existe uma unidade com Provocar no campo inimigo — deve ser atacada primeiro');
    }
  } else {
    // Ataque direto ao jogador — só se a Linha Superior inimiga estiver vazia
    const frontNotEmpty = opponent.field.front.some(c => !c.isResourceMode);
    if (frontNotEmpty) return err('Não é possível atacar diretamente com unidades na Linha Superior inimiga');
  }

  // Virar o atacante (Vigilância: ataca sem virar)
  if (!attacker.keywords.includes('vigilancia')) {
    attacker.isTapped = true;
  }
  attacker.attackedThisTurn = true;

  state.combat = {
    step: 'declare_attack',
    attackerInstanceId: action.attackerInstanceId,
    attackerPlayerId: playerId,
    defenderInstanceId: action.defenderInstanceId,
    defenderPlayerId: opponent.userId,
    isDirect: action.defenderInstanceId === null,
  };

  events.push({ type: 'card_tapped', instanceId: attacker.instanceId });
  events.push({ type: 'combat_started', combat: state.combat });

  // Avançar para a janela de bloqueio
  state.combat.step = 'declare_block';

  return ok(state, events);
}

// ---------------------------------------------------------------------------
// DECLARAR BLOQUEIO
// ---------------------------------------------------------------------------

function actionDeclareBlock(
  state: GameState,
  playerId: string,
  action: Extract<GameAction, { type: 'declare_block' }>,
  events: GameEvent[],
): ActionResult {
  if (!state.combat) return err('Não há combate em andamento');
  if (state.combat.step !== 'declare_block') return err('Não é o momento de bloquear');
  if (playerId !== state.combat.defenderPlayerId) return err('Não é você o defensor neste combate');

  const player = state.players[playerId];
  const blocker = findCard(player, action.blockerInstanceId);

  if (!blocker) return err('Bloqueador não encontrado');
  if (blocker.zone !== 'front' && !blocker.keywords.includes('guardiao')) {
    return err('Apenas cartas na Linha Superior (ou com Guardião) podem bloquear');
  }
  if (blocker.isTapped) return err('Carta virada não pode bloquear');
  if (blocker.isResourceMode) return err('Carta em Modo Recurso não pode bloquear');

  // Verificar Sombra no atacante
  const attackerResult = findCardInGame(state, state.combat.attackerInstanceId);
  if (attackerResult) {
    const { card: attacker } = attackerResult;
    if (attacker.keywords.includes('sombra')) {
      const hasRadar = blocker.keywords.includes('radar') ||
        player.field.back.some(c => c.keywords.includes('radar'));
      if (!hasRadar) return err('Atacante possui Sombra — não pode ser bloqueado sem Radar');
    }
    // Amedrontar: unidades com Poder inferior não podem bloquear
    if (attacker.keywords.includes('amedrontar') && blocker.damage < attacker.damage) {
      return err('Amedrontar: seu Poder é insuficiente para bloquear este atacante');
    }
  }

  // Trocar o defensor pelo bloqueador
  state.combat.defenderInstanceId = action.blockerInstanceId;
  state.combat.isDirect = false;
  blocker.blockedThisTurn = true;

  // Avançar para Janela de Reação
  state.combat.step = 'reaction_window';

  return ok(state, events);
}

// ---------------------------------------------------------------------------
// PASSAR PRIORIDADE (resolve a Corrente ou avança combate)
// ---------------------------------------------------------------------------

function actionPassPriority(
  state: GameState,
  playerId: string,
  events: GameEvent[],
): ActionResult {
  if (state.combat) {
    // Defensor passa sem bloquear — avança para janela de reação
    if (state.combat.step === 'declare_block' && playerId === state.combat.defenderPlayerId) {
      state.combat.step = 'reaction_window';
      return ok(state, events);
    }
    // Janela de reação — qualquer jogador pode passar para resolver o dano
    if (state.combat.step === 'reaction_window') {
      return resolveCombatDamage(state, events);
    }
  }

  // Resolver o topo da Corrente
  if (state.chain.length > 0) {
    const item = state.chain.pop()!;
    events.push({ type: 'chain_resolved', item });
  }

  return ok(state, events);
}

// ---------------------------------------------------------------------------
// RESOLVER DANO DE COMBATE
// ---------------------------------------------------------------------------

function resolveCombatDamage(state: GameState, events: GameEvent[]): ActionResult {
  if (!state.combat) return err('Sem combate ativo');

  state.combat.step = 'damage';

  const attackerResult = findCardInGame(state, state.combat.attackerInstanceId);
  if (!attackerResult) return err('Atacante não encontrado');

  const { card: attacker, player: attackerPlayer } = attackerResult;
  const defenderPlayer = state.players[state.combat.defenderPlayerId];

  if (state.combat.isDirect || state.combat.defenderInstanceId === null) {
    // --- ATAQUE DIRETO AO JOGADOR ---
    const dmg = attacker.damage;
    defenderPlayer.hp -= dmg;
    events.push({ type: 'player_damage', targetPlayerId: defenderPlayer.userId, amount: dmg });

    // Elo Vital: dano causado recupera vida
    if (attacker.keywords.includes('elo_vital')) {
      attackerPlayer.hp += dmg;
    }

  } else {
    // --- COMBATE ENTRE CRIATURAS ---
    const defenderResult = findCardInGame(state, state.combat.defenderInstanceId!);
    if (!defenderResult) return err('Defensor não encontrado');
    const { card: defender } = defenderResult;

    let atkDmg = attacker.damage;
    let defDmg = defender.damage;

    // Toque Mortal: qualquer dano destrói instantaneamente
    const atkHasTouchDeath = attacker.keywords.includes('toque_mortal');
    const defHasTouchDeath = defender.keywords.includes('toque_mortal');

    // Blindado: reduz dano recebido (formato: "blindado:N")
    const atkBlinded = attacker.keywords.filter(k => k.startsWith('blindado')).length > 0
      ? (parseInt(attacker.keywords.find(k => k.startsWith('blindado'))?.split(':')[1] ?? '') || 0) : 0;
    const defBlinded = defender.keywords.filter(k => k.startsWith('blindado')).length > 0
      ? (parseInt(defender.keywords.find(k => k.startsWith('blindado'))?.split(':')[1] ?? '') || 0) : 0;

    // Escudo Divino: ignora o primeiro dano RECEBIDO pela criatura
    if (defender.keywords.includes('escudo_divino')) {
      const idx = defender.keywords.indexOf('escudo_divino');
      defender.keywords.splice(idx, 1); // quebra o escudo
      atkDmg = 0; // defensor não recebe dano do atacante
    }
    if (attacker.keywords.includes('escudo_divino') && defDmg > 0) {
      const idx = attacker.keywords.indexOf('escudo_divino');
      attacker.keywords.splice(idx, 1);
      defDmg = 0; // atacante não recebe dano do defensor
    }

    // Aplicar Blindado
    const realDmgToDefender = Math.max(0, atkDmg - defBlinded);
    const realDmgToAttacker = Math.max(0, defDmg - atkBlinded);

    // Aplicar dano
    if (atkHasTouchDeath || realDmgToDefender > 0) {
      const finalDmg = atkHasTouchDeath ? defender.currentHealth : realDmgToDefender;
      defender.currentHealth -= finalDmg;
      events.push({ type: 'damage_dealt', targetInstanceId: defender.instanceId, amount: finalDmg, source: attacker.instanceId });
    }
    if (defHasTouchDeath || realDmgToAttacker > 0) {
      const finalDmg = defHasTouchDeath ? attacker.currentHealth : realDmgToAttacker;
      attacker.currentHealth -= finalDmg;
      events.push({ type: 'damage_dealt', targetInstanceId: attacker.instanceId, amount: finalDmg, source: defender.instanceId });
    }

    // Atropelar / Perfurar: dano excedente ao jogador
    // currentHealth já foi reduzido, então valores negativos = dano excedente
    const excess = -defender.currentHealth;
    if (excess > 0 && defender.currentHealth <= 0) {
      if (attacker.keywords.includes('atropelar') || attacker.keywords.includes('perfurar')) {
        defenderPlayer.hp -= excess;
        events.push({ type: 'player_damage', targetPlayerId: defenderPlayer.userId, amount: excess });
      }
    }

    // Elo Vital do atacante
    if (attacker.keywords.includes('elo_vital') && realDmgToDefender > 0) {
      attackerPlayer.hp += realDmgToDefender;
    }

    // Retaliação do defensor
    const retaliationMatch = defender.keywords.find(k => k.startsWith('retaliacao'));
    if (retaliationMatch && realDmgToDefender > 0) {
      const retDmg = parseInt(retaliationMatch.split(':')[1] ?? '1');
      attacker.currentHealth -= retDmg;
      events.push({ type: 'damage_dealt', targetInstanceId: attacker.instanceId, amount: retDmg, source: defender.instanceId });
    }
  }

  // Avançar para resolução de mortes
  state.combat.step = 'resolve_deaths';
  return resolveDeaths(state, events);
}

// ---------------------------------------------------------------------------
// RESOLVER MORTES
// ---------------------------------------------------------------------------

function resolveDeaths(state: GameState, events: GameEvent[]): ActionResult {
  let deathsOccurred = true;

  while (deathsOccurred) {
    deathsOccurred = false;

    for (const player of Object.values(state.players)) {
      const frontDying = player.field.front.filter(c => c.currentHealth <= 0);
      const backDying = player.field.back.filter(c => c.currentHealth <= 0);

      for (const dying of [...frontDying, ...backDying]) {
        deathsOccurred = true;
        events.push({ type: 'card_destroyed', instanceId: dying.instanceId });

        // Último Suspiro entra na Corrente
        if (dying.keywords.includes('ultimo_suspiro')) {
          state.chain.push({
            id: uuid(),
            sourceInstanceId: dying.instanceId,
            sourcePlayerId: dying.ownerId,
            type: 'lastBreath',
            description: `Último Suspiro de ${dying.name}`,
            data: { card: dying },
          });
          events.push({ type: 'chain_added', item: state.chain[state.chain.length - 1] });
        }

        // Tokens: Cemitério temporário → Banir
        if (dying.isToken) {
          moveCardToZone(player, dying.instanceId, 'exile');
          events.push({ type: 'card_exiled', instanceId: dying.instanceId });
        } else {
          moveCardToZone(player, dying.instanceId, 'graveyard');
          events.push({ type: 'card_to_graveyard', card: dying });
        }
      }
    }
  }

  // Limpar estado de combate
  state.combat = null;

  // Verificar vitória
  if (checkWinConditions(state)) {
    events.push({ type: 'game_ended', winner: state.winner, isDraw: state.isDraw, reason: state.endReason });
  }

  return ok(state, events);
}

// ---------------------------------------------------------------------------
// AVANÇAR FASE
// ---------------------------------------------------------------------------

function actionNextPhase(
  state: GameState,
  playerId: string,
  events: GameEvent[],
): ActionResult {
  if (!isActivePlayer(state, playerId)) return err('Não é seu turno');

  const currentIndex = PHASE_ORDER.indexOf(state.phase);
  if (currentIndex === -1) return err('Fase inválida');

  const nextIndex = currentIndex + 1;
  if (nextIndex >= PHASE_ORDER.length) {
    // Fim do turno
    return actionEndTurn(state, playerId, events);
  }

  const nextPhase = PHASE_ORDER[nextIndex];
  state.phase = nextPhase;
  events.push({ type: 'phase_changed', phase: nextPhase });

  return ok(state, events);
}

// ---------------------------------------------------------------------------
// FIM DE TURNO
// ---------------------------------------------------------------------------

function actionEndTurn(
  state: GameState,
  playerId: string,
  events: GameEvent[],
): ActionResult {
  if (!isActivePlayer(state, playerId)) return err('Não é seu turno');

  const player = state.players[playerId];

  // Descartar até 9 cartas na mão (se precisar, o cliente selecionará — por ora, descarte automático do excedente)
  const HAND_LIMIT = 9;
  while (player.hand.length > HAND_LIMIT) {
    const discarded = player.hand.pop()!;
    moveCardToZone(player, discarded.instanceId, 'graveyard');
    events.push({ type: 'card_to_graveyard', card: discarded });
  }

  // Éter reseta para 0
  player.ether = 0;
  player.hasPlayedFreeLand = false;

  // Avançar para o próximo jogador
  const opponentId = state.playerOrder.find(id => id !== playerId)!;
  state.activePlayerId = opponentId;
  state.turn += 1;
  state.combat = null;

  // Início do turno do próximo jogador
  const nextPlayer = state.players[opponentId];
  untapAllCards(nextPlayer);
  applyEtherGeneration(nextPlayer);

  // Sacar carta automático no início do turno (Deck Out check)
  if (nextPlayer.deck.length === 0) {
    nextPlayer.hp = 0;
    nextPlayer.hasLost = true;
    checkWinConditions(state);
    events.push({ type: 'game_ended', winner: state.winner, isDraw: state.isDraw, reason: state.endReason });
    return ok(state, events);
  }
  const autoDrawn = drawCards(nextPlayer, 1);
  if (autoDrawn.length > 0) {
    events.push({ type: 'card_drawn', playerId: opponentId, card: autoDrawn[0] });
  }

  // Começar direto na Fase Principal 1 (draw já foi feito acima)
  state.phase = 'main1';
  events.push({ type: 'phase_changed', phase: 'main1' });

  return ok(state, events);
}

// ---------------------------------------------------------------------------
// RENDIÇÃO
// ---------------------------------------------------------------------------

function actionSurrender(
  state: GameState,
  playerId: string,
  events: GameEvent[],
): ActionResult {
  const opponent = getOpponent(state, playerId);
  state.winner = opponent.userId;
  state.status = 'ended';
  state.endReason = 'surrender';
  state.endedAt = new Date();
  events.push({ type: 'game_ended', winner: state.winner, isDraw: false, reason: 'surrender' });
  return ok(state, events);
}

// ---------------------------------------------------------------------------
// Criar token em campo
// ---------------------------------------------------------------------------

export function spawnToken(
  state: GameState,
  ownerId: string,
  tokenDef: { name: string; damage: number; health: number; keywords: string[] },
  zone: 'front' | 'back',
): GameCard {
  const player = state.players[ownerId];
  const token: GameCard = {
    instanceId: uuid(),
    id: `token_${uuid()}`,
    name: tokenDef.name,
    archetypeId: null,
    cardType: 'token',
    etherCost: 0,
    damage: tokenDef.damage,
    health: tokenDef.health,
    currentHealth: tokenDef.health,
    description: '',
    keywords: [...tokenDef.keywords],
    isExtraDeck: false,
    creatorSeal: false,
    rarity: 'common',
    isTerrain: false,
    ownerId,
    isTapped: false,
    isResourceMode: false,
    resourceModeTurns: 0,
    attackedThisTurn: false,
    blockedThisTurn: false,
    enteredThisTurn: true,
    zone,
    counters: {},
    attachments: [],
    isToken: true,
  };

  if (zone === 'front') player.field.front.push(token);
  else player.field.back.push(token);

  return token;
}
