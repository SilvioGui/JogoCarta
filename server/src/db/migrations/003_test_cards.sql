-- Migração 003: Cartas em branco para teste do tabuleiro
-- Todas as cartas têm prefixo "tst_" e creator_seal = 0

-- =====================================================================
-- MONSTROS DE TESTE (tst_m01..tst_m20) — vários custos e keywords
-- =====================================================================
INSERT OR IGNORE INTO cards (id, name, archetype_id, card_type, ether_cost, damage, health, description, keywords, rarity, creator_seal) VALUES
('tst_m01',  '[Teste] Monstro 1/2 Custo 1',  NULL, 'monster', 1, 1, 2, 'Carta de teste.', '[]', 'common', 0),
('tst_m02',  '[Teste] Monstro 2/1 Ímpeto',   NULL, 'monster', 1, 2, 1, 'Carta de teste.', '["impeto"]', 'common', 0),
('tst_m03',  '[Teste] Monstro 2/2 Custo 2',  NULL, 'monster', 2, 2, 2, 'Carta de teste.', '[]', 'common', 0),
('tst_m04',  '[Teste] Monstro 3/2 Custo 2',  NULL, 'monster', 2, 3, 2, 'Carta de teste.', '[]', 'common', 0),
('tst_m05',  '[Teste] Monstro 2/3 Custo 2',  NULL, 'monster', 2, 2, 3, 'Carta de teste.', '[]', 'common', 0),
('tst_m06',  '[Teste] Monstro 3/3 Custo 3',  NULL, 'monster', 3, 3, 3, 'Carta de teste.', '[]', 'common', 0),
('tst_m07',  '[Teste] Monstro 4/2 Custo 3',  NULL, 'monster', 3, 4, 2, 'Carta de teste.', '[]', 'uncommon', 0),
('tst_m08',  '[Teste] Monstro 2/4 Custo 3',  NULL, 'monster', 3, 2, 4, 'Carta de teste.', '[]', 'uncommon', 0),
('tst_m09',  '[Teste] Monstro 3/3 Provocar', NULL, 'monster', 3, 3, 3, 'Carta de teste.', '["provocar"]', 'uncommon', 0),
('tst_m10',  '[Teste] Monstro 4/3 Custo 4',  NULL, 'monster', 4, 4, 3, 'Carta de teste.', '[]', 'uncommon', 0),
('tst_m11',  '[Teste] Monstro 3/4 Custo 4',  NULL, 'monster', 4, 3, 4, 'Carta de teste.', '[]', 'uncommon', 0),
('tst_m12',  '[Teste] Monstro 5/3 Atropelar',NULL, 'monster', 4, 5, 3, 'Carta de teste.', '["atropelar"]', 'uncommon', 0),
('tst_m13',  '[Teste] Monstro 3/5 Blindado', NULL, 'monster', 4, 3, 5, 'Carta de teste.', '["blindado"]', 'uncommon', 0),
('tst_m14',  '[Teste] Monstro 4/4 Custo 5',  NULL, 'monster', 5, 4, 4, 'Carta de teste.', '[]', 'rare', 0),
('tst_m15',  '[Teste] Monstro 5/4 Perfurar',  NULL, 'monster', 5, 5, 4, 'Carta de teste.', '["perfurar"]', 'rare', 0),
('tst_m16',  '[Teste] Monstro 4/5 Custo 5',  NULL, 'monster', 5, 4, 5, 'Carta de teste.', '[]', 'rare', 0),
('tst_m17',  '[Teste] Monstro 6/4 Custo 6',  NULL, 'monster', 6, 6, 4, 'Carta de teste.', '[]', 'rare', 0),
('tst_m18',  '[Teste] Monstro 4/6 Custo 6',  NULL, 'monster', 6, 4, 6, 'Carta de teste.', '[]', 'rare', 0),
('tst_m19',  '[Teste] Monstro 5/5 Custo 6',  NULL, 'monster', 6, 5, 5, 'Carta de teste.', '[]', 'rare', 0),
('tst_m20',  '[Teste] Monstro 1/1 Vigilância', NULL,'monster', 1, 1, 1, 'Carta de teste.', '["vigilancia"]', 'common', 0),

-- =====================================================================
-- MAGIAS DE TESTE (tst_sp01..tst_sp05)
-- =====================================================================
('tst_sp01', '[Teste] Magia Dano 3',    NULL, 'magic', 2, 0, 0, 'Causa 3 de dano a um alvo. [TESTE]', '[]', 'common', 0),
('tst_sp02', '[Teste] Magia Dano 5',    NULL, 'magic', 3, 0, 0, 'Causa 5 de dano a um alvo. [TESTE]', '[]', 'uncommon', 0),
('tst_sp03', '[Teste] Magia Cura 3',    NULL, 'magic', 2, 0, 0, 'Restaura 3 HP. [TESTE]', '[]', 'common', 0),
('tst_sp04', '[Teste] Magia Comprar 2', NULL, 'magic', 2, 0, 0, 'Compra 2 cartas. [TESTE]', '[]', 'uncommon', 0),
('tst_sp05', '[Teste] Magia Token',     NULL, 'magic', 3, 0, 0, 'Cria um token 2/2. [TESTE]', '[]', 'uncommon', 0),

-- =====================================================================
-- REAÇÕES DE TESTE (tst_rx01..tst_rx03)
-- =====================================================================
('tst_rx01', '[Teste] Reação Dano 2',   NULL, 'reaction', 1, 0, 0, 'Causa 2 de dano ao atacante. [TESTE]', '[]', 'common', 0),
('tst_rx02', '[Teste] Reação Desvio',   NULL, 'reaction', 2, 0, 0, 'Cancela um ataque. [TESTE]', '[]', 'uncommon', 0),
('tst_rx03', '[Teste] Reação Escudo',   NULL, 'reaction', 1, 0, 0, 'Concede Escudo Divino. [TESTE]', '[]', 'common', 0),

-- =====================================================================
-- TERRENOS DE TESTE (tst_tr01..tst_tr06)
-- =====================================================================
('tst_tr01', '[Teste] Terreno A',       NULL, 'terrain', 0, 0, 0, 'Terreno de teste. Gera Éter em Modo Recurso.', '[]', 'common', 0),
('tst_tr02', '[Teste] Terreno B',       NULL, 'terrain', 0, 0, 0, 'Terreno de teste. Gera Éter em Modo Recurso.', '[]', 'common', 0),
('tst_tr03', '[Teste] Terreno C',       NULL, 'terrain', 0, 0, 0, 'Terreno de teste. Gera Éter em Modo Recurso.', '[]', 'common', 0),
('tst_tr04', '[Teste] Terreno D',       NULL, 'terrain', 0, 0, 0, 'Terreno de teste. Gera Éter em Modo Recurso.', '[]', 'common', 0),
('tst_tr05', '[Teste] Terreno E',       NULL, 'terrain', 0, 0, 0, 'Terreno de teste. Gera Éter em Modo Recurso.', '[]', 'common', 0),
('tst_tr06', '[Teste] Terreno F',       NULL, 'terrain', 0, 0, 0, 'Terreno de teste. Gera Éter em Modo Recurso.', '[]', 'common', 0),

-- =====================================================================
-- COMANDANTES DE TESTE (tst_cmd01..tst_cmd05) — Extra Deck
-- =====================================================================
('tst_cmd01','[Teste] Comandante Alfa',  NULL, 'commander', 5, 5, 5, 'Comandante de teste. [EXTRA DECK]', '["provocar"]', 'rare', 0),
('tst_cmd02','[Teste] Comandante Beta',  NULL, 'commander', 6, 6, 4, 'Comandante de teste. [EXTRA DECK]', '["atropelar"]', 'rare', 0),
('tst_cmd03','[Teste] Comandante Gama',  NULL, 'commander', 6, 4, 6, 'Comandante de teste. [EXTRA DECK]', '["blindado"]', 'rare', 0),
('tst_cmd04','[Teste] Comandante Delta', NULL, 'commander', 7, 7, 5, 'Comandante de teste. [EXTRA DECK]', '["perfurar"]', 'legendary', 0),
('tst_cmd05','[Teste] Comandante Épsilon',NULL,'commander', 7, 5, 7, 'Comandante de teste. [EXTRA DECK]', '["escudo_divino","provocar"]', 'legendary', 0);
