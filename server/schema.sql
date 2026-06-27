-- generate file sqlite with 'node init-db.js'-

-- 1. CREAZIONE DELLE TABELLE
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL,
    salt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_start_id INTEGER NOT NULL,
    station_end_id INTEGER NOT NULL,
    line_id INTEGER NOT NULL,
    FOREIGN KEY(station_start_id) REFERENCES stations(id),
    FOREIGN KEY(station_end_id) REFERENCES stations(id),
    FOREIGN KEY(line_id) REFERENCES lines(id)
);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    effect_value INTEGER NOT NULL CHECK (effect_value BETWEEN -4 AND 4)
);

CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 2. POPOLAMENTO DELLE TABELLE

-- Inserimento Linee (Vaporetti)
INSERT INTO lines (id, name, color) VALUES 
(1, 'Centro Storico e Isole', 'Zalo'),
(2, 'Giro del Doge', ' Maron'),
(3, 'Giro in gondola', 'Blu'),
(4, 'Bacaro Tour', 'Verde');

-- Inserimento Stazioni (12 luoghi tra Iconici e Nascosti)
INSERT INTO stations (id, name) VALUES 
(1, 'Piazzale Roma'),
(2, 'Rialto'),
(3, 'Gelateria da Nico'),
(4, 'Campo Santa Marghe'),
(5, 'Giardini'),
(6, 'Murano'),
(7, 'Burano'),
(8, 'San Giorgio'),
(9, 'Squero'),
(10, 'Piazza San Marco'),
(11, 'Da Lele'),
(12, 'Stazione Santa Lucia'),
(13, 'Ghetto'),
(14, 'Mercato del Pesce'),
(15, 'Fondaco dei Tedeschi'),
(16, 'Teatro La Fenice'),
(17, 'Ponte dei Sospiri'),
(18, 'Arsenale'),
(19, 'Lido di Venezia'),
(20, 'San Pantalon'),
(21, 'Palazzo Ducale');

-- Inserimento Collegamenti 
-- Interscambi principali: Piazzale Roma (Linee 1, 2, 4),  Rialto (Linee 2, 3, 4), Piazza San Marco (Linee 1, 2, 3)
-- Interscambi secondari: Campo Santa Marghe (Linee 1, 2, 4), Ghetto (Linee 1, 3), Fondaco dei Tedeschi (Linee 2, 3), Squero (Linee 3, 4)
INSERT INTO connections (station_start_id, station_end_id, line_id) VALUES 
-- Linea 1 - Centro Storico e Isole
(1, 4, 1), -- Piazzale Roma <-> Campo Santa Marghe
(4, 20, 1), -- Campo Santa Marghe <-> San Pantalon
(20, 13, 1), -- San Pantalon <-> Ghetto
(13, 10, 1), -- Ghetto <-> Piazza San Marco
(10, 8, 1), -- Piazza San Marco <-> San Giorgio
(8, 6, 1), -- San Giorgio <-> Murano
(6, 7, 1), -- Murano <-> Burano
(7, 19, 1), -- Burano <-> Lido di Venezia

-- Linea 2 - Giro del Doge
(1, 4, 2), -- Piazzale Roma <-> Campo Santa Marghe
(4, 2, 2), -- Campo Santa Marghe <-> Rialto
(2, 15, 2), -- Rialto <-> Fondaco dei Tedeschi
(15, 16, 2), -- Fondaco dei Tedeschi <-> Teatro La Fenice
(16, 10, 2), -- Teatro La Fenice <-> Piazza San Marco
(10, 21, 2), -- Piazza San Marco <-> Palazzo Ducale
(21, 17, 2), -- Palazzo Ducale <-> Ponte dei Sospiri
(17, 18, 2), -- Ponte dei Sospiri <-> Arsenale
(18, 5, 2), -- Arsenale <-> Giardini

-- Linea 3 - Giro in gondola
(12, 13, 3), -- Stazione Santa Lucia <-> Ghetto
(13, 15, 3), -- Ghetto <-> Fondaco dei Tedeschi
(15, 2, 3),  -- Fondaco dei Tedeschi <-> Rialto
(2, 9, 3),   -- Rialto <-> Squero
(9, 10, 3),  -- Squero <-> Piazza San Marco
(10, 17, 3), -- Piazza San Marco <-> Ponte dei Sospiri

-- Linea 4 - Bacaro Tour
(1, 11, 4), -- Piazzale Roma <-> Da Lele
(11, 4, 4), -- Da Lele <-> Campo Santa Marghe
(4, 9, 4),  -- Campo Santa Marghe <-> Squero
(9, 3, 4),  -- Squero <-> Gelateria da Nico
(3, 2, 4),  -- Gelateria da Nico <-> Rialto
(2, 14, 4); -- Rialto <-> Mercato del Pesce


-- Inserimento Eventi di Cultura Locale (Effetti da -4 a +4)
INSERT INTO events (description, effect_value) VALUES 
("Sciopero improvviso del' ACTV! Devi prendere un taxi costoso", -4),
("Acqua alta improvvisa! Devi comprare gli stivali di gomma dal venditore ambulante", -3),
("Nebbia fitta in laguna: il vaporetto procede a rilento, perdi tempo", -2),
("Giorno di elezioni, tutti i marinai fanno gli scrutatori, servizio ridotto", -1),
("Traghetto tranquillo, ti godi il fresco della brezza serale", 0),
("Festival del cinema: la folla è enorme, ma l'atmosfera è magica", 1),
("Incontri un passeggero gentile che ti offre un'ombra di vino e un cicchetto", 2),
("Giro panoramico in gondola senza traffico nel Canal Grande", 3),
("Sveglia all'alba con una splendida vista su San Giorgio", 4),
("Piera bianca fa il culo nero, attenzione sei finito in canale", -4),
("Attenzione Cocaii! Il tuo pranzo è appena stato rubato da un gabbiano affamato", -3),
("Precedenza ai local, senza la tessera ACTV ti tocca pagare di più e asettare il prossimo vaporetto", -2),
("Attenzion pick pocket! Per fortuna avevi pochi spicci in tasca", -1),
("Anche in alta stagione riesci a trovare un posto in terrazza, ti goddi la fresca brezza", 0),
("Un anziano ti offre un caffè e una leggenda tradizionale", 1),
("Un turista ti ferma per chiederti indicazioni, la tua gentilezza inaspettata ti fa guadagnare", 2),
("Inciampi su un masegno ma trovi una moneta d'della vecchia Repubblica", 3),
("Una gondola si avvicina e il gondoliere ti offre un passaggio gratuito, guadagni tempo e fascino", 4);

-- Inserimento Utenti 
INSERT INTO users (id, username, hash, salt) VALUES 
(1, 'irene_avezzu', 'hash_fittizio_1', 'salt_1'),
(2, 'zanze', 'hash_fittizio_2', 'salt_2'),
(3, 'laerica', 'hash_fittizio_3', 'salt_3');

-- Inserimento Storico Partite per la Classifica
INSERT INTO games (user_id, score) VALUES 
(1, 24), -- irene_avezzu partita 1
(1, 15), -- irene_avezzu partita 2
(2, 18), -- zanze partita 1
(2, 12); -- zanze partita 2