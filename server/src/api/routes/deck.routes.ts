import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../../db/database';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// GET /api/decks/cards/all — todas as cartas disponíveis (coleção)
// DEVE ficar ANTES de /:id para não ser capturada pela rota paramétrica
// ---------------------------------------------------------------------------
router.get('/cards/all', (req, res) => {
  const db = getDb();

  const { archetype, type, search } = req.query as Record<string, string>;

  let query = `
    SELECT c.id, c.name, c.archetype_id, c.card_type, c.ether_cost,
           c.damage, c.health, c.description, c.keywords, c.rarity,
           c.is_extra_deck, c.creator_seal
    FROM cards c
    WHERE 1=1
  `;
  const params: string[] = [];

  if (archetype) { query += ' AND c.archetype_id = ?'; params.push(archetype); }
  if (type) { query += ' AND c.card_type = ?'; params.push(type); }
  if (search) { query += ' AND c.name LIKE ?'; params.push(`%${search}%`); }

  query += ' ORDER BY c.card_type, c.ether_cost, c.name';

  const cards = db.prepare(query).all(...params);

  res.json({ cards });
});

// ---------------------------------------------------------------------------
// GET /api/decks — listar decks do usuário
// ---------------------------------------------------------------------------
router.get('/', (req, res) => {
  const db = getDb();
  const userId = req.user!.sub;

  const decks = db.prepare(`
    SELECT d.id, d.name, d.description, d.archetype_id, d.is_valid, d.is_public,
           d.created_at, d.updated_at,
           (SELECT COUNT(*) FROM deck_cards dc WHERE dc.deck_id = d.id AND dc.is_extra_deck = 0) as main_count,
           (SELECT COUNT(*) FROM deck_cards dc WHERE dc.deck_id = d.id AND dc.is_extra_deck = 1) as extra_count
    FROM decks d
    WHERE d.user_id = ?
    ORDER BY d.updated_at DESC
  `).all(userId);

  res.json({ decks });
});

// ---------------------------------------------------------------------------
// GET /api/decks/:id — detalhes do deck com cartas
// ---------------------------------------------------------------------------
router.get('/:id', (req, res) => {
  const db = getDb();
  const userId = req.user!.sub;

  const deck = db.prepare(
    'SELECT * FROM decks WHERE id = ? AND user_id = ?'
  ).get(req.params.id, userId) as Record<string, unknown> | undefined;

  if (!deck) {
    return res.status(404).json({ error: 'Deck não encontrado' });
  }

  const cards = db.prepare(`
    SELECT dc.card_id, dc.quantity, dc.is_extra_deck,
           c.name, c.archetype_id, c.card_type, c.ether_cost, c.damage, c.health,
           c.description, c.keywords, c.rarity, c.creator_seal
    FROM deck_cards dc
    JOIN cards c ON c.id = dc.card_id
    WHERE dc.deck_id = ?
    ORDER BY c.card_type, c.ether_cost, c.name
  `).all(req.params.id);

  res.json({ deck, cards });
});

// ---------------------------------------------------------------------------
// POST /api/decks — criar deck
// ---------------------------------------------------------------------------
const createDeckSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(300).optional(),
  archetypeId: z.string().nullable().optional(),
});

router.post('/', validate(createDeckSchema), (req, res) => {
  const db = getDb();
  const userId = req.user!.sub;
  const { name, description, archetypeId } = req.body as z.infer<typeof createDeckSchema>;

  const id = db.prepare(`
    INSERT INTO decks (user_id, name, description, archetype_id)
    VALUES (?, ?, ?, ?)
    RETURNING id
  `).get(userId, name, description ?? null, archetypeId ?? null) as { id: string };

  res.status(201).json({ deckId: id.id });
});

// ---------------------------------------------------------------------------
// PUT /api/decks/:id — atualizar nome/descrição
// ---------------------------------------------------------------------------
const updateDeckSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  description: z.string().max(300).optional(),
});

router.put('/:id', validate(updateDeckSchema), (req, res) => {
  const db = getDb();
  const userId = req.user!.sub;
  const { name, description } = req.body as z.infer<typeof updateDeckSchema>;

  const deck = db.prepare(
    'SELECT id FROM decks WHERE id = ? AND user_id = ?'
  ).get(req.params.id, userId);

  if (!deck) return res.status(404).json({ error: 'Deck não encontrado' });

  db.transaction(() => {
    if (name) db.prepare("UPDATE decks SET name = ?, updated_at = datetime('now') WHERE id = ?").run(name, req.params.id);
    if (description !== undefined) db.prepare("UPDATE decks SET description = ?, updated_at = datetime('now') WHERE id = ?").run(description, req.params.id);
  })();

  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// DELETE /api/decks/:id — excluir deck
// ---------------------------------------------------------------------------
router.delete('/:id', (req, res) => {
  const db = getDb();
  const userId = req.user!.sub;

  const result = db.prepare(
    'DELETE FROM decks WHERE id = ? AND user_id = ?'
  ).run(req.params.id, userId);

  if (result.changes === 0) return res.status(404).json({ error: 'Deck não encontrado' });

  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// PUT /api/decks/:id/cards — sincronizar lista de cartas
// ---------------------------------------------------------------------------
const syncCardsSchema = z.object({
  cards: z.array(z.object({
    cardId: z.string(),
    quantity: z.number().int().min(1).max(3),
    isExtraDeck: z.boolean().default(false),
  })),
});

router.put('/:id/cards', validate(syncCardsSchema), (req, res) => {
  const db = getDb();
  const userId = req.user!.sub;
  const { cards } = req.body as z.infer<typeof syncCardsSchema>;

  const deck = db.prepare(
    'SELECT id FROM decks WHERE id = ? AND user_id = ?'
  ).get(req.params.id, userId);

  if (!deck) return res.status(404).json({ error: 'Deck não encontrado' });

  // Validações básicas
  const mainCards = cards.filter(c => !c.isExtraDeck);
  const extraCards = cards.filter(c => c.isExtraDeck);

  const mainTotal = mainCards.reduce((sum, c) => sum + c.quantity, 0);
  const extraTotal = extraCards.length;

  if (mainTotal > 100) return res.status(400).json({ error: 'Deck principal pode ter no máximo 100 cartas' });
  if (extraTotal > 5) return res.status(400).json({ error: 'Extra deck pode ter no máximo 5 cartas' });

  const isValid = mainTotal === 100 && extraTotal === 5;

  const syncTx = db.transaction(() => {
    db.prepare('DELETE FROM deck_cards WHERE deck_id = ?').run(req.params.id);

    const insert = db.prepare(
      'INSERT INTO deck_cards (deck_id, card_id, quantity, is_extra_deck) VALUES (?, ?, ?, ?)'
    );

    for (const c of cards) {
      insert.run(req.params.id, c.cardId, c.quantity, c.isExtraDeck ? 1 : 0);
    }

    db.prepare(
      "UPDATE decks SET is_valid = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(isValid ? 1 : 0, req.params.id);
  });

  syncTx();

  res.json({ ok: true, isValid, mainTotal, extraTotal });
});

// ---------------------------------------------------------------------------
// POST /api/decks/starter — criar deck inicial com cartas básicas
// ---------------------------------------------------------------------------
router.post('/starter', (req, res) => {
  const db = getDb();
  const userId = req.user!.sub;

  // Verificar se já tem algum deck
  const existing = db.prepare('SELECT id FROM decks WHERE user_id = ? LIMIT 1').get(userId);
  if (existing) {
    return res.status(400).json({ error: 'Você já possui um deck. Use a página de decks para gerenciá-lo.' });
  }

  const deckId = (db.prepare(`
    INSERT INTO decks (user_id, name, description, is_valid)
    VALUES (?, 'Deck Inicial', 'Deck básico para começar a jogar.', 1)
    RETURNING id
  `).get(userId) as { id: string }).id;

  // Montar deck de 100 cartas com as cartas seed
  // Principais (100): mistura de monstros comuns + terrenos + magias
  const starterMain: Array<[string, number]> = [
    // Monstros genéricos (21 cartas)
    ['gen_001', 3], ['gen_002', 3], ['gen_003', 3], ['gen_004', 2],
    ['gen_005', 3], ['gen_006', 3], ['gen_007', 2], ['gen_008', 2],
    // Anjos (10 cartas — ang_003 é Comandante do Extra Deck)
    ['ang_001', 3], ['ang_002', 2], ['ang_004', 2], ['ang_005', 3],
    // Dragões (10 cartas — drg_003 é Comandante do Extra Deck)
    ['drg_001', 3], ['drg_002', 2], ['drg_004', 3], ['drg_005', 2],
    // Demônios (7 cartas — dem_003 e dem_005 são Comandantes do Extra Deck)
    ['dem_001', 2], ['dem_002', 2], ['dem_004', 3],
    // Goblins (11 cartas)
    ['gob_001', 3], ['gob_002', 3], ['gob_003', 2], ['gob_004', 3],
    // Mecânicos (8 cartas — mec_003 é Comandante do Extra Deck)
    ['mec_001', 3], ['mec_002', 3], ['mec_004', 2],
    // Magias (13 cartas)
    ['mag_001', 3], ['mag_002', 3], ['mag_003', 2], ['mag_004', 2], ['mag_006', 2], ['mag_005', 1],
    // Reações (5 cartas)
    ['rea_001', 3], ['rea_002', 2],
    // Terrenos (15 cartas)
    ['ter_001', 3], ['ter_002', 3], ['ter_003', 3], ['ter_004', 3], ['ter_005', 3],
  ];
  // Total: 21+10+10+7+11+8+13+5+15 = 100

  const mainTotal = starterMain.reduce((s, [, q]) => s + q, 0);

  const starterExtra: string[] = [
    'ang_003', 'drg_003', 'dem_003', 'dem_005', 'mec_003',
  ];

  const insertTx = db.transaction(() => {
    const insertCard = db.prepare(
      'INSERT OR IGNORE INTO deck_cards (deck_id, card_id, quantity, is_extra_deck) VALUES (?, ?, ?, ?)'
    );
    for (const [cardId, qty] of starterMain) {
      insertCard.run(deckId, cardId, qty, 0);
    }
    for (const cardId of starterExtra) {
      insertCard.run(deckId, cardId, 1, 1);
    }
  });

  insertTx();

  // Verificar total real
  const realTotal = (db.prepare(
    'SELECT SUM(quantity) as total FROM deck_cards WHERE deck_id = ? AND is_extra_deck = 0'
  ).get(deckId) as { total: number }).total;

  // Atualizar is_valid
  const isValid = realTotal === 100 && starterExtra.length === 5;
  db.prepare('UPDATE decks SET is_valid = ? WHERE id = ?').run(isValid ? 1 : 0, deckId);

  res.status(201).json({ deckId, isValid, mainTotal: realTotal, extraTotal: starterExtra.length });
});

// ---------------------------------------------------------------------------
// POST /api/decks/test-deck — criar deck de teste com cartas em branco
// Pode ser criado mesmo que o usuário já tenha outros decks.
// ---------------------------------------------------------------------------
router.post('/test-deck', (req, res) => {
  const db = getDb();
  const userId = req.user!.sub;

  const deckId = (db.prepare(`
    INSERT INTO decks (user_id, name, description, is_valid)
    VALUES (?, '[TESTE] Deck Tabuleiro', 'Deck com cartas em branco para testar o tabuleiro.', 1)
    RETURNING id
  `).get(userId) as { id: string }).id;

  // Deck principal (100 cartas):
  //   20 monstros × 3 = 60  (tst_m01..tst_m20)
  //    5 magias    × 3 = 15  (tst_sp01..tst_sp05)
  //    3 reações   × 3 =  9  (tst_rx01..tst_rx03)
  //    5 terrenos  × 3 = 15  (tst_tr01..tst_tr05)
  //    1 terreno   × 1 =  1  (tst_tr06)
  //                       = 100
  const testMain: Array<[string, number]> = [
    ['tst_m01', 3], ['tst_m02', 3], ['tst_m03', 3], ['tst_m04', 3], ['tst_m05', 3],
    ['tst_m06', 3], ['tst_m07', 3], ['tst_m08', 3], ['tst_m09', 3], ['tst_m10', 3],
    ['tst_m11', 3], ['tst_m12', 3], ['tst_m13', 3], ['tst_m14', 3], ['tst_m15', 3],
    ['tst_m16', 3], ['tst_m17', 3], ['tst_m18', 3], ['tst_m19', 3], ['tst_m20', 3],
    ['tst_sp01', 3], ['tst_sp02', 3], ['tst_sp03', 3], ['tst_sp04', 3], ['tst_sp05', 3],
    ['tst_rx01', 3], ['tst_rx02', 3], ['tst_rx03', 3],
    ['tst_tr01', 3], ['tst_tr02', 3], ['tst_tr03', 3], ['tst_tr04', 3], ['tst_tr05', 3],
    ['tst_tr06', 1],
  ];

  const testExtra: string[] = [
    'tst_cmd01', 'tst_cmd02', 'tst_cmd03', 'tst_cmd04', 'tst_cmd05',
  ];

  const insertTx = db.transaction(() => {
    const insertCard = db.prepare(
      'INSERT OR IGNORE INTO deck_cards (deck_id, card_id, quantity, is_extra_deck) VALUES (?, ?, ?, ?)'
    );
    for (const [cardId, qty] of testMain) {
      insertCard.run(deckId, cardId, qty, 0);
    }
    for (const cardId of testExtra) {
      insertCard.run(deckId, cardId, 1, 1);
    }
  });

  insertTx();

  const realTotal = (db.prepare(
    'SELECT SUM(quantity) as total FROM deck_cards WHERE deck_id = ? AND is_extra_deck = 0'
  ).get(deckId) as { total: number }).total;

  const isValid = realTotal === 100 && testExtra.length === 5;
  db.prepare('UPDATE decks SET is_valid = ? WHERE id = ?').run(isValid ? 1 : 0, deckId);

  res.status(201).json({ deckId, isValid, mainTotal: realTotal, extraTotal: testExtra.length });
});

export default router;
