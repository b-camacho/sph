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

interface Auth0User {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export const checkJwt = auth({
  audience: process.env.VITE_AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.VITE_AUTH0_DOMAIN}`,
  tokenSigningAlg: 'RS256'
});

export const addUser = (pool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    if (!auth0Id) {
      return res.status(401).json({ error: 'No auth0 ID found' });
    }

    let result = await pool.query(
      'SELECT * FROM users WHERE auth0_id = $1',
      [auth0Id]
    );
    if (result.rows.length === 1) {
      // auth0 user already exists in our db
      req.user = result.rows[0];
      next();
      return;
    }
    console.log('Creating new user for ' + auth0Id)

    // auth0 user does not yet exist in our db
    // this is a first time login
    // add the user to our db
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    // grab email, name, avatar_url from auth0
    const response = await fetch(`https://${process.env.VITE_AUTH0_DOMAIN}/userinfo`, {
        headers: {
          Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to validate token');
    }

    const userData: Auth0User = await response.json();
    
    // possible race: someone else inserts the user
    // easiest fix is to start a transaction above
    // but that is a lot of overhead to each request
    // instead, notice first-time login is a cold path
    // so we are happy to incur a double db roundtrip here
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let existingUser = await client.query(
        'SELECT * FROM users WHERE auth0_id = $1',
        [userData.sub]
      );

      if (existingUser.rows.length === 0) {
        await client.query(
          'INSERT INTO users (auth0_id, email, name, avatar_url) VALUES ($1, $2, $3, $4)',
          [userData.sub, userData.email, userData.name || null, userData.picture || null]
        );
      }
      existingUser = await client.query(
        'SELECT * FROM users WHERE auth0_id = $1',
        [userData.sub]
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
