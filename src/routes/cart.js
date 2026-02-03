import { Router } from 'express';
import { Cart, Item } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    // Calculate total with populated items
    const detailedItems = cart.items.map(cartItem => ({
      itemId: cartItem.itemId._id,
      quantity: cartItem.quantity,
      product: cartItem.itemId
    }));
    
    const total = detailedItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    
    res.json({ items: detailedItems, total });
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/add', requireAuth, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body || {};
    if (!itemId) return res.status(400).json({ message: 'Missing itemId' });
    
    // Validate itemId and check if item exists
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }
    
    const item = await Item.findById(itemId);
    if (!item) return res.status(400).json({ message: 'Invalid itemId' });

    const cart = await Cart.getOrCreateCart(req.user.id);
    await cart.addItem(itemId, Number(quantity) || 1);
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/update', requireAuth, async (req, res) => {
  try {
    const { itemId, quantity } = req.body || {};
    if (!itemId || typeof quantity !== 'number') return res.status(400).json({ message: 'Missing fields' });
    
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }
    
    const cart = await Cart.getOrCreateCart(req.user.id);
    
    try {
      await cart.updateItemQuantity(itemId, quantity);
      res.json({ ok: true });
    } catch (error) {
      if (error.message === 'Item not found in cart') {
        return res.status(404).json({ message: 'Item not in cart' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/remove', requireAuth, async (req, res) => {
  try {
    const { itemId } = req.body || {};
    if (!itemId) return res.status(400).json({ message: 'Missing itemId' });
    
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }
    
    const cart = await Cart.getOrCreateCart(req.user.id);
    await cart.removeItem(itemId);
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Cart remove error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;