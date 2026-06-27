import db from './db.js';
import crypto from 'crypto';

// get user by ID (use Passport to deserialize the session)
export function getUserById(id) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, username FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve(null);
      else resolve(row);
    });
  });
}

// verify user credentials
export function getUserByCredentials(username, password) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) { reject(err); }
      else if (row === undefined) { resolve(false); }
      else {
        const user = { id: row.id, username: row.username };
        
        // handle initial values (hash was manually set to 'hash_fittizio_') so no need to perfom cryptographic hashing
        if (row.hash.startsWith('hash_fittizio_')) { 
          if (password === 'password') return resolve(user); 
          else return resolve(false);
        }

        // standard cryptographic hashing with scrypt
        crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
          if (err) reject(err);
          if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
}

// register new user
export function createUser(username, password) {
  return new Promise((resolve, reject) => {
    // generate random salt (16 bits)
    const salt = crypto.randomBytes(16).toString('hex');
    
    // evaluate hashed password using scrypt
    crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
      if (err) return reject(err);
      
      const sql = 'INSERT INTO users (username, hash, salt) VALUES (?, ?, ?)';
      const hashStr = hashedPassword.toString('hex');
      
      db.run(sql, [username, hashStr, salt], function (err) {
        if (err) {
          // if we violate UNIQUE constraint 
          if (err.message.includes('UNIQUE constraint failed')) {
            return resolve({ error: 'DUPLICATE' });
          }
          return reject(err);
        }
        // in case of success, return the id and username
        resolve({ id: this.lastID, username: username });
      });
    });
  });
}