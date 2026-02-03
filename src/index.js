import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import cartRoutes from './routes/cart.js';

const app = express();

app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'https://cartify-m.netlify.app', 'http://cartify-m.netlify.app'],
  credentials: true
}));

app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/cart', cartRoutes);

// Start server after MongoDB connection
async function startServer() {
  try {
    console.log('Starting server...');
    await connectDB();
    
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
      console.log('Server is ready to handle requests');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();



