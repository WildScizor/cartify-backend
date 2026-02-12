import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/index.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload?.userId || !mongoose.Types.ObjectId.isValid(payload.userId)) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export default requireAuth;
