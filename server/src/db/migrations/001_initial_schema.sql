-- Migração 001: Schema inicial do JogoCarta
-- Data: 2026-04-09

CREATE TABLE IF NOT EXISTS migrations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    applied_at  DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username      TEXT NOT NULL UNIQUE,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url    TEXT,
    created_at    DATETIME DEFAULT (datetime('now')),
    updated_at    DATETIME DEFAULT (datetime('now')),
    last_login    DATETIME,
    is_active     INTEGER NOT NULL DEFAULT 1,
    is_banned     INTEGER NOT NULL DEFAULT 0,
    ban_reason    TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS user_stats (
    user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    wins        INTEGER NOT NULL DEFAULT 0,
    losses      INTEGER NOT NULL DEFAULT 0,
    draws       INTEGER NOT NULL DEFAULT 0,
    total_games INTEGER NOT NULL DEFAULT 0,
    win_streak  INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    elo_rating  INTEGER NOT NULL DEFAULT 1000,
    updated_at  DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL UNIQUE,
    expires_at    DATETIME NOT NULL,
    created_at    DATETIME DEFAULT (datetime('now')),
    ip_address    TEXT,
    user_agent    TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);

CREATE TABLE IF NOT EXISTS archetypes (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    description      TEXT,
    color_hex        TEXT,
    special_resource TEXT
);

CREATE TABLE IF NOT EXISTS cards (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name          TEXT NOT NULL UNIQUE,
    archetype_id  TEXT REFERENCES archetypes(id),
    card_type     TEXT NOT NULL CHECK(card_type IN (
                      'monster','magic','reaction','structure',
                      'artifact','terrain','relic','commander','token'
                  )),
    ether_cost    INTEGER NOT NULL DEFAULT 0,
    damage        INTEGER,
    health        INTEGER,
    description   TEXT NOT NULL DEFAULT '',
    keywords      TEXT DEFAULT '[]',
    is_extra_deck INTEGER NOT NULL DEFAULT 0,
    image_url     TEXT,
    creator_seal  INTEGER NOT NULL DEFAULT 0,
    rarity        TEXT CHECK(rarity IN ('common','uncommon','rare','legendary')),
    created_at    DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cards_archetype ON cards(archetype_id);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(card_type);

CREATE TABLE IF NOT EXISTS decks (
    id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    description  TEXT,
    archetype_id TEXT REFERENCES archetypes(id),
    is_valid     INTEGER NOT NULL DEFAULT 0,
    is_public    INTEGER NOT NULL DEFAULT 0,
    created_at   DATETIME DEFAULT (datetime('now')),
    updated_at   DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_decks_user ON decks(user_id);

CREATE TABLE IF NOT EXISTS deck_cards (
    deck_id      TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    card_id      TEXT NOT NULL REFERENCES cards(id),
    quantity     INTEGER NOT NULL DEFAULT 1 CHECK(quantity >= 1 AND quantity <= 3),
    is_extra_deck INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (deck_id, card_id)
);

CREATE TABLE IF NOT EXISTS matches (
    id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    player1_id       TEXT NOT NULL REFERENCES users(id),
    player2_id       TEXT NOT NULL REFERENCES users(id),
    winner_id        TEXT REFERENCES users(id),
    deck1_id         TEXT REFERENCES decks(id),
    deck2_id         TEXT REFERENCES decks(id),
    result           TEXT NOT NULL CHECK(result IN (
                         'player1_wins','player2_wins','draw','abandoned'
                     )),
    end_reason       TEXT CHECK(end_reason IN (
                         'hp_zero','deck_out','surrender','timeout','disconnection'
                     )),
    duration_seconds INTEGER,
    turns_played     INTEGER,
    started_at       DATETIME,
    ended_at         DATETIME DEFAULT (datetime('now')),
    room_code        TEXT
);

CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches(player2_id);

-- Inserir arquétipos base
INSERT OR IGNORE INTO archetypes (id, name, description, color_hex, special_resource) VALUES
    ('angels',    'Anjos',     'Ordem e Luz — Defesa e Escudo Divino',         '#F5D76E', 'faith'),
    ('demons',    'Demônios',  'Caos e Trevas — Oferenda e Exumar',            '#8E1616', NULL),
    ('dragons',   'Dragões',   'Poder Bruto — Atropelar e Sobrecarga',         '#E25822', 'treasure'),
    ('abyssals',  'Abissais',  'Horror Oceânico — Maré e Dragar/Vaticinar',    '#1B4F72', NULL),
    ('mechanics', 'Mecânicos', 'Tecnologia — Artefatos e Estruturas',          '#7F8C8D', NULL),
    ('undead',    'Pútridos',  'Mortos-Vivos — Último Suspiro e Eco',          '#27AE60', NULL),
    ('goblins',   'Goblins',   'Tribo Caótica — Tributo e Enxame',             '#F39C12', NULL),
    ('specters',  'Espectros', 'Almas e Éter — Sombra e Infundir',             '#8E44AD', NULL),
    ('spiders',   'Aranhas',   'Insetóides — Aprisionar, Infestação e Veneno', '#2C3E50', NULL),
    ('shadows',   'Sombrios',  'Furtividade — Roubo, Emboscada e Gancho',      '#566573', NULL);
