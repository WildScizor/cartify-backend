import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import mongoose from 'mongoose';

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(payload.userId)) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    User.findById(payload.userId)
      .then(user => {
        if (!user) return res.status(401).json({ message: 'Invalid token' });
        req.user = user.publicProfile;
        next();
      })
      .catch(() => res.status(401).json({ message: 'Unauthorized' }));
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}