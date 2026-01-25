import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_123';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ error: 'Not authorized' });
  }
};
