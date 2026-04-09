-- Migração 002: Cartas base para teste e jogo inicial

-- =====================================================================
-- MONSTROS — Anjos
-- =====================================================================
INSERT OR IGNORE INTO cards (id, name, archetype_id, card_type, ether_cost, damage, health, description, keywords, rarity) VALUES
('ang_001', 'Guerreiro Celestial',  'angels', 'monster', 2, 2, 3, 'Um anjo guardião que protege os aliados.', '["Escudo Divino"]', 'common'),
('ang_002', 'Arauto da Luz',        'angels', 'monster', 3, 3, 3, 'Anuncia a chegada de reforços divinos.', '["Ímpeto"]', 'uncommon'),
('ang_003', 'Serafim Protetor',     'angels', 'monster', 5, 4, 6, 'Concede Escudo Divino a um aliado ao entrar em campo.', '["Escudo Divino","Provocar"]', 'rare'),
('ang_004', 'Querubim Vingador',    'angels', 'monster', 4, 5, 4, 'Representa a ira divina sobre os ímpios.', '[]', 'uncommon'),
('ang_005', 'Anjo da Guarda',       'angels', 'monster', 1, 1, 2, 'Pequeno protetor que absorve o primeiro golpe.', '["Escudo Divino"]', 'common'),

-- =====================================================================
-- MONSTROS — Dragões
-- =====================================================================
('drg_001', 'Dragão Cinzeiro',      'dragons', 'monster', 3, 4, 2, 'Fogo e destruição em forma pura.', '[]', 'common'),
('drg_002', 'Wyvern de Batalha',    'dragons', 'monster', 4, 5, 3, 'Voa pelo campo atacando com ferocidade.', '["Ímpeto"]', 'uncommon'),
('drg_003', 'Dragão do Abismo',     'dragons', 'monster', 6, 7, 5, 'Seu rugido estremece o campo inimigo.', '["Atropelar"]', 'rare'),
('drg_004', 'Filhote Dracônico',    'dragons', 'monster', 1, 1, 1, 'Pequeno mas feroz; crescerá para ser temido.', '[]', 'common'),
('drg_005', 'Drake de Gelo',        'dragons', 'monster', 4, 3, 4, 'Congela os inimigos com seu bafo gelado.', '["Perfurar"]', 'uncommon'),

-- =====================================================================
-- MONSTROS — Demônios
-- =====================================================================
('dem_001', 'Impo Infernal',        'demons', 'monster', 1, 2, 1, 'Pequeno servo do caos.', '[]', 'common'),
('dem_002', 'Succubus da Sombra',   'demons', 'monster', 3, 3, 3, 'Drena a força vital dos inimigos.', '["Elo Vital"]', 'uncommon'),
('dem_003', 'Lorde do Caos',        'demons', 'monster', 7, 8, 6, 'Semeia destruição em todo o campo.', '["Atropelar","Perfurar"]', 'legendary'),
('dem_004', 'Cultista Corrompido',  'demons', 'monster', 2, 2, 2, 'Serve ao senhor das trevas sem questionar.', '[]', 'common'),
('dem_005', 'Succubus Ardente',     'demons', 'monster', 4, 5, 3, 'Toca mortalmente aqueles que atingir.', '["Toque Mortal"]', 'rare'),

-- =====================================================================
-- MONSTROS — Goblins
-- =====================================================================
('gob_001', 'Goblin Batedeiro',     'goblins', 'monster', 1, 1, 1, 'Rápido e imprevisível.', '["Ímpeto"]', 'common'),
('gob_002', 'Goblin Bombista',      'goblins', 'monster', 2, 3, 1, 'Explode ao ser destruído, causando dano.', '["Último Suspiro"]', 'common'),
('gob_003', 'Xamã Goblin',          'goblins', 'monster', 3, 2, 2, 'Convoca pequenos servos do caos.', '[]', 'uncommon'),
('gob_004', 'Goblin Guerreiro',     'goblins', 'monster', 2, 2, 2, 'Treinado para o combate em grupo.', '[]', 'common'),
('gob_005', 'General Goblin',       'goblins', 'monster', 5, 4, 4, 'Lidera o enxame com punho de ferro.', '["Provocar"]', 'rare'),

-- =====================================================================
-- MONSTROS — Mecânicos
-- =====================================================================
('mec_001', 'Autômato Básico',      'mechanics', 'monster', 2, 2, 3, 'Construto simples de combate.', '["Blindado"]', 'common'),
('mec_002', 'Drone de Vigilância',  'mechanics', 'monster', 1, 1, 2, 'Observa e reporta movimentos inimigos.', '[]', 'common'),
('mec_003', 'Golem de Aço',         'mechanics', 'monster', 5, 4, 7, 'Pesado e quase indestrutível.', '["Blindado","Provocar"]', 'rare'),
('mec_004', 'Meca-Arauto',          'mechanics', 'monster', 3, 3, 3, 'Unidade de suporte equipada com canhão.', '["Perfurar"]', 'uncommon'),
('mec_005', 'Núcleo de Combate',    'mechanics', 'monster', 4, 4, 4, 'Unidade central de uma frota mecânica.', '[]', 'uncommon'),

-- =====================================================================
-- MONSTROS — Genéricos (sem arquétipo)
-- =====================================================================
('gen_001', 'Soldado Humano',       NULL, 'monster', 1, 1, 2, 'Um guerreiro treinado das forças comuns.', '[]', 'common'),
('gen_002', 'Cavaleiro de Ferro',   NULL, 'monster', 3, 3, 4, 'Guerreiro veterano com armadura pesada.', '["Blindado"]', 'common'),
('gen_003', 'Arqueiro Élfico',      NULL, 'monster', 2, 3, 1, 'Atira flechas que atravessam as defesas.', '["Perfurar"]', 'common'),
('gen_004', 'Mago Arcano',          NULL, 'monster', 4, 4, 2, 'Lança magias que ignoram armaduras.', '["Perfurar"]', 'uncommon'),
('gen_005', 'Ogro da Montanha',     NULL, 'monster', 4, 5, 3, 'Força bruta sem igual.', '["Atropelar"]', 'common'),
('gen_006', 'Lobo da Floresta',     NULL, 'monster', 2, 2, 2, 'Ágil predador das sombras.', '["Ímpeto"]', 'common'),
('gen_007', 'Troll Regenerador',    NULL, 'monster', 5, 4, 5, 'Recupera vitalidade com cada ataque.', '["Elo Vital"]', 'uncommon'),
('gen_008', 'Assassino Sombrio',    NULL, 'monster', 3, 4, 2, 'Mata silenciosamente e sem deixar rastros.', '["Toque Mortal"]', 'rare'),

-- =====================================================================
-- MAGIAS
-- =====================================================================
('mag_001', 'Bola de Fogo',         NULL, 'magic', 2, 0, 0, 'Causa 3 de dano a um alvo.', '[]', 'common'),
('mag_002', 'Cura Divina',          'angels', 'magic', 2, 0, 0, 'Restaura 3 HP do jogador.', '[]', 'common'),
('mag_003', 'Raio Arcano',          NULL, 'magic', 3, 0, 0, 'Causa 5 de dano a um alvo.', '[]', 'uncommon'),
('mag_004', 'Invocar Reforço',      NULL, 'magic', 4, 0, 0, 'Cria um token Soldado (1/2) em campo.', '[]', 'uncommon'),
('mag_005', 'Explosão Caótica',     'demons', 'magic', 5, 0, 0, 'Causa 4 de dano a todos os inimigos em campo.', '[]', 'rare'),
('mag_006', 'Escudo Arcano',        NULL, 'magic', 2, 0, 0, 'Concede Escudo Divino a uma criatura aliada.', '[]', 'uncommon'),

-- =====================================================================
-- REAÇÕES
-- =====================================================================
('rea_001', 'Contra-Ataque',        NULL, 'reaction', 1, 0, 0, 'Pode ser jogada quando um aliado é atacado. Causa 2 de dano ao atacante.', '[]', 'common'),
('rea_002', 'Desviar',              NULL, 'reaction', 2, 0, 0, 'Cancela um ataque direcionado a um aliado.', '[]', 'uncommon'),
('rea_003', 'Bênção Divina',        'angels', 'reaction', 1, 0, 0, 'Cura 2 HP de uma criatura aliada que está sendo atacada.', '[]', 'common'),

-- =====================================================================
-- TERRENOS / RELÍQUIAS
-- =====================================================================
('ter_001', 'Floresta Antiga',      NULL, 'terrain', 0, 0, 0, 'Terreno básico. Gera Éter quando em Modo Recurso.', '[]', 'common'),
('ter_002', 'Montanha Vulcânica',   NULL, 'terrain', 0, 0, 0, 'Terreno básico. Gera Éter quando em Modo Recurso.', '[]', 'common'),
('ter_003', 'Lago Cristalino',      NULL, 'terrain', 0, 0, 0, 'Terreno básico. Gera Éter quando em Modo Recurso.', '[]', 'common'),
('ter_004', 'Planície Sagrada',     'angels', 'terrain', 0, 0, 0, 'Terreno sagrado. Gera Éter e aumenta a Fé dos Anjos.', '[]', 'common'),
('ter_005', 'Caverna Sombria',      'demons', 'terrain', 0, 0, 0, 'Terreno das trevas. Gera Éter e potencializa Demônios.', '[]', 'common');

-- Marcar terrenos como isTerrain no contexto correto (cardType já é 'terrain')
-- (o campo isTerrain é derivado de cardType no engine)
