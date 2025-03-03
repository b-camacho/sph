import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { Pool } from 'pg';
import { config } from 'dotenv';
config();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const addUser = (pool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    const email = payload.email;
    if (!email) {
      return res.status(401).json({ error: 'No email found in token' });
    }

    let result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 1) {
      req.user = result.rows[0];
      next();
      return;
    }
    console.log('Creating new user for email: ' + email)

    // First time user, add them to database
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let existingUser = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length === 0) {
        await client.query(
          'INSERT INTO users (email) VALUES ($1)',
          [email]
        );
      }
      existingUser = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      req.user = existingUser.rows[0];

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error('Error adding user to request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
  next();
};
