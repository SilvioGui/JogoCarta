-- Migração 004: Usuário bot para o tutorial
-- O bot nunca faz login — password_hash é um sentinel que nunca autentica.

INSERT OR IGNORE INTO users (id, username, email, password_hash, is_active, is_banned)
VALUES ('__bot__', 'Tutor', 'bot@jogocarta.system', '$SYSTEM_NO_AUTH$', 1, 0);

INSERT OR IGNORE INTO user_stats (user_id) VALUES ('__bot__');

-- Deck do bot (mesmo esquema dos decks de teste)
INSERT OR IGNORE INTO decks (id, user_id, name, description, is_valid)
VALUES ('__bot_deck__', '__bot__', 'Deck do Tutor', 'Deck interno do bot de tutorial.', 1);

-- Deck principal (100 cartas): 20 monstros ×3 + 5 magias ×3 + 3 reações ×3 + 5 terrenos ×3 + 1 terreno ×1
INSERT OR IGNORE INTO deck_cards (deck_id, card_id, quantity, is_extra_deck) VALUES
('__bot_deck__', 'tst_m01', 3, 0),
('__bot_deck__', 'tst_m02', 3, 0),
('__bot_deck__', 'tst_m03', 3, 0),
('__bot_deck__', 'tst_m04', 3, 0),
('__bot_deck__', 'tst_m05', 3, 0),
('__bot_deck__', 'tst_m06', 3, 0),
('__bot_deck__', 'tst_m07', 3, 0),
('__bot_deck__', 'tst_m08', 3, 0),
('__bot_deck__', 'tst_m09', 3, 0),
('__bot_deck__', 'tst_m10', 3, 0),
('__bot_deck__', 'tst_m11', 3, 0),
('__bot_deck__', 'tst_m12', 3, 0),
('__bot_deck__', 'tst_m13', 3, 0),
('__bot_deck__', 'tst_m14', 3, 0),
('__bot_deck__', 'tst_m15', 3, 0),
('__bot_deck__', 'tst_m16', 3, 0),
('__bot_deck__', 'tst_m17', 3, 0),
('__bot_deck__', 'tst_m18', 3, 0),
('__bot_deck__', 'tst_m19', 3, 0),
('__bot_deck__', 'tst_m20', 3, 0),
('__bot_deck__', 'tst_sp01', 3, 0),
('__bot_deck__', 'tst_sp02', 3, 0),
('__bot_deck__', 'tst_sp03', 3, 0),
('__bot_deck__', 'tst_sp04', 3, 0),
('__bot_deck__', 'tst_sp05', 3, 0),
('__bot_deck__', 'tst_rx01', 3, 0),
('__bot_deck__', 'tst_rx02', 3, 0),
('__bot_deck__', 'tst_rx03', 3, 0),
('__bot_deck__', 'tst_tr01', 3, 0),
('__bot_deck__', 'tst_tr02', 3, 0),
('__bot_deck__', 'tst_tr03', 3, 0),
('__bot_deck__', 'tst_tr04', 3, 0),
('__bot_deck__', 'tst_tr05', 3, 0),
('__bot_deck__', 'tst_tr06', 1, 0),
-- Extra deck (5 Comandantes)
('__bot_deck__', 'tst_cmd01', 1, 1),
('__bot_deck__', 'tst_cmd02', 1, 1),
('__bot_deck__', 'tst_cmd03', 1, 1),
('__bot_deck__', 'tst_cmd04', 1, 1),
('__bot_deck__', 'tst_cmd05', 1, 1);
