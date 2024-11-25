// not currently used! for prod I will need to encrypt but for now whatever

import { config } from 'dotenv';
config();

const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const seed = process.env.CRYPTO_SEED || 'default_seed_value'; // fallback for testing
const key = crypto.createHash('sha256').update(seed).digest(); // derive 32-byte key
const iv = crypto.createHash('md5').update(seed).digest(); // derive 16-byte iv

export function encryptJson(jsonObj: Object): String {
  const jsonString = JSON.stringify(jsonObj);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let ciphertext = cipher.update(jsonString, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  return ciphertext;
}

export function decryptJson(ciphertext: String, keyHex: String, ivHex: String) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(keyHex, 'hex'),
    Buffer.from(ivHex, 'hex')
  );
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted); // convert back to json
}

//// example usage
//const jsonData = { name: 'Alice', age: 30, job: 'engineer' };
//
//// encrypt the json
//const { encryptedData, key, iv } = encryptJson(jsonData);
//console.log('Encrypted:', encryptedData);
//
//// decrypt the json
//const decryptedData = decryptJson(encryptedData, key, iv);
//console.log('Decrypted:', decryptedData);