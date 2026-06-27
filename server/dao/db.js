import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Calcoliamo il percorso assoluto della cartella corrente in modalità ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Apriamo la connessione verso il file db.sqlite situato nella cartella superiore (server/)
const db = new sqlite3.Database(path.join(__dirname, '..', 'db.sqlite'), (err) => {
  if (err) {
    console.error("Errore di connessione al database SQLite:", err.message);
    throw err;
  }
  console.log("Connessione stabilita con successo a db.sqlite.");
});

// 3. Esportiamo l'istanza del database in modo che user-dao e game-dao possano importarla
export default db;