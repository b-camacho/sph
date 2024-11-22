import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import sharp from 'sharp';

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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/works', async (_req, res) => {
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

app.get('/api/work/:id', async (req, res) => {
    try {
      const { id } = req.params;
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

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Work not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching work:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// untested
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});