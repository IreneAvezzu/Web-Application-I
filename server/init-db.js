import sqlite3 from 'sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Configurazione per emulare __dirname negli ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorsi dei file
const dbPath = path.join(__dirname, 'db.sqlite');
const sqlScriptPath = path.join(__dirname, 'schema.sql');

// Attiva i log dettagliati (verbose)
const sqlite = sqlite3.verbose();

// Crea l'istanza del database usando il "new" sulla classe Database
const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        return console.error("Errore nell'apertura del database:", err.message);
    }
    console.log('Connesso al database SQLite (o creato se non esisteva).');
});

// Legge il file schema.sql
const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');

// Esegue lo script SQL
db.exec(sqlScript, (err) => {
    if (err) {
        console.error("Errore durante l'inizializzazione delle tabelle:", err.message);
    } else {
        console.log('Database inizializzato con successo con il tema Venezia!');
    }
    db.close();
});