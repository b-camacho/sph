import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import sharp from 'sharp';
import { addUser } from './authfake.js';

config();

const app = express();
const port = process.env.PORT || 3000;
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME
});

app.use(cors());
app.use(express.json());

app.get('/api/placeholder/:width/:height', async (req, res) => {
  try {
    const width = parseInt(req.params.width);
    const height = parseInt(req.params.height);
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e2e8f0"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial" 
          font-size="20" 
          fill="#64748b"
          text-anchor="middle" 
          dominant-baseline="middle"
        >${width}x${height}</text>
      </svg>
    `;

    const buffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    console.error('Error generating placeholder:', err);
    res.status(500).json({ error: 'Error generating placeholder image' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/auth/fake', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id as sub, email, name
      FROM users
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/fake', async (req, res) => {
  const { sub, email } = req.body;
  
  try {
    // Only retrieve the existing user
    const result = await pool.query(`
      SELECT id, email, name
      FROM users
      WHERE id = $1
    `, [sub]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate a fake JWT token
    const token = Buffer.from(JSON.stringify({
      email,
      iss: 'https://fake-auth0.dev/',
      aud: 'fake-audience',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    })).toString('base64');

    res.json({ access_token: token });
  } catch (err) {
    console.error('Error in fake auth:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//app.post('/api/auth', async (req, res) => {
//  await handleAuth(req, res, pool);
//});

app.get('/api/works/all', async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          w.id,
          w.name as title,
          w.descr as description,
          w.image,
          a.name as author_name,
          a.bio as author_bio
        FROM works w
        JOIN authors a ON w.author_id = a.id
        ORDER BY w.id DESC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching works:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// addUser not in the "create db entry for a user sense"
// but in the "fetch the user entry from db and add it to `req` sense"
app.use(addUser(pool));

app.get('/api/works', async (req, res) => {
    try {
      const result = await pool.query(`
        WITH latest_txs AS (
          SELECT DISTINCT ON (work_id) 
            work_id,
            user_id,
            created_at
          FROM txs
          ORDER BY work_id, created_at DESC
        )
        SELECT 
          w.id,
          w.name as title,
          w.descr as description,
          w.image,
          a.name as author_name,
          a.bio as author_bio,
          lt.created_at as tx_created_at
        FROM works w
        JOIN authors a ON w.author_id = a.id
        JOIN latest_txs lt ON lt.work_id = w.id
        WHERE lt.user_id = $1
        ORDER BY w.id DESC
      `, [req.user.id]);

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching works:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


const generateClaimUrl = (userId: string, workId: string, domain: string, price: number) => {
  const payload = {
    user_id: userId,
    work_id: workId,
    created_at: Math.floor(Date.now() / 1000), // unix ts in seconds
    price: price,
  }

  const url = new URL('/claim', domain);
  const payloadString = JSON.stringify(payload);
  const base64Url = Buffer.from(payloadString).toString('base64')
    .replace(/\+/g, '-') // https://datatracker.ietf.org/doc/html/rfc4648#section-5
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  url.searchParams.set('key', base64Url);
  return url.toString();
}

app.get('/api/work/:id',  async (req, res) => {
    try {
      const { id } = req.params;
      // Get user info from the JWT token
      const user = req.auth;
      console.log('User requesting work:', user);

      const result = await pool.query(`
        SELECT 
          w.id,
          w.name as title,
          w.descr as description,
          w.image,
          a.name as author_name,
          a.bio as author_bio
        FROM works w
        JOIN authors a ON w.author_id = a.id
        WHERE w.id = $1
      `, [id]);
      res.json(result.rows[0]);

    } catch (err) {
      console.error('Error fetching work:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// how the tx-url works:
// 1. user clicks "transfer" button on a work
// 2. server makes a url with a key param
// 3. client renders the url as a qr code
// 4. whoever scans the qr code, if they are logged in, will claim the work to their account
// cool Lucia but what if they are not logged in? "not part of mvp" I whisper
// ALSO this NEEDS to be encrypted otherwise anyone can transfer any work to their account LMAO
app.get('/api/works/claim/new', async (req, res) => {
  if (!req.query.work) {
    return res.status(400).json({ error: 'Missing work parameter' });
  }

  if (typeof req.query.work !== 'string') {
    return res.status(400).json({ error: 'Work parameter must be a string' });
  }
  const work = req.query.work as string;

  if (!req.query.price) {
    return res.status(400).json({ error: 'Missing price parameter' });
  }

  const price = Number(req.query.price);
  if (isNaN(price) || price < 0 || price > 10000) {
    return res.status(400).json({ error: 'Price must be a number between 0 and 10000' });
  }

  // TODO: better config parsing, crash the app on startup with helpful message when required env vars not set
  const domain = process.env.VITE_APP_DOMAIN || '';

  const url = generateClaimUrl(req.user.id, work, domain, price);
  res.json({ url });
});

// invariant: you always transfer to yourself
// that is, req.user.id becomes the new owner
app.get('/api/claim', async (req, res) => {
  const key = req.query.key as string;
  if (!key) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  let payload = {user_id: '', work_id: '', created_at: 0, price: 0};

  try {
  const base64 = key
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  payload = JSON.parse(Buffer.from(base64, 'base64').toString());
  } catch (err) {
    console.error('decoding key:', err);
    res.status(400).json({ error: 'Invalid key' });
    return
  }
    const TEN_MINUTES = 10 * 60; // in seconds
    const now = Math.floor(Date.now() / 1000);
    if (now - payload.created_at > TEN_MINUTES) {
      res.status(400).json({ error: 'Transfer code has expired' });
      return;
    }
    console.log('Claiming work:', payload);
 
    const latestTx = await pool.query(`
      SELECT user_id 
      FROM txs 
      WHERE work_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [payload.work_id]);

    if (latestTx.rows[0]?.user_id !== payload.user_id) {
      return res.status(400).json({ error: 'Work is not owned by user who generated claim url' });
    }

    const result = await pool.query(`
      SELECT 
        w.id,
        w.name as title,
        w.descr as description,
        w.image,
        a.name as author_name,
        a.bio as author_bio,
        a.id as author_id,
        s.name as seller_name
      FROM works w
      JOIN authors a ON w.author_id = a.id
      JOIN users s ON s.id = $2
      WHERE w.id = $1
    `, [payload.work_id, payload.user_id]);

    if (result.rows.length < 1) {
      return res.status(404).json({ error: 'Work not found' });
    }

    const work = result.rows[0];
    res.json({...work, price: payload.price});
      

  });
app.post('/api/claim/confirm', async (req, res) => {
  const key = req.query.key as string;
  if (!key) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  let payload = {user_id: '', work_id: '', created_at: 0, price: 0};

  try {
  const base64 = key
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  payload = JSON.parse(Buffer.from(base64, 'base64').toString());
  } catch (err) {
    console.error('decoding key:', err);
    res.status(400).json({ error: 'Invalid key' });
    return
  }
    const TEN_MINUTES = 10 * 60; // in seconds
    const now = Math.floor(Date.now() / 1000);
    if (now - payload.created_at > TEN_MINUTES) {
      res.status(400).json({ error: 'Transfer code has expired' });
      return;
    }
 
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const latestTx = await client.query(`
        SELECT user_id 
        FROM txs 
        WHERE work_id = $1 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [payload.work_id]);

      if (latestTx.rows[0]?.user_id === payload.user_id) {
        await client.query(`
          INSERT INTO txs (work_id, user_id, price)
          VALUES ($1, $2, $3)
        `, [payload.work_id, req.user.id, payload.price]);
        
        await client.query('COMMIT');
        res.json({ success: true });
      } else {
        await client.query('ROLLBACK');
        res.status(403).json({ error: 'Tried transfering work_id' + payload.work_id +
          ' from user_id ' + payload.user_id + ' but that user does not own it' });
      }

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});