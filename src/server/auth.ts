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

    const result = await pool.query(
      'SELECT * FROM users WHERE auth0_id = $1',
      [auth0Id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('Error adding user to request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export async function handleAuth(req: Request, res: Response, pool: Pool) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const response = await fetch(`https://${process.env.VITE_AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to validate token');
    }

    const userData: Auth0User = await response.json();
    
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE auth0_id = $1',
      [userData.sub]
    );

    if (existingUser.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (auth0_id, email, name, avatar_url) VALUES ($1, $2, $3, $4)',
        [userData.sub, userData.email, userData.name || null, userData.picture || null]
      );
    }

    res.json(userData);
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
} 