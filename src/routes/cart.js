import { Router } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/cart
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const cart = await Cart.findOne({ userId }).populate('items.itemId');

    if (!cart) {
      return res.json({ items: [], total: 0 });
    }

    const items = cart.items.map(ci => ({
      quantity: ci.quantity,
      product: {
        ...ci.itemId.toObject(),
        id: ci.itemId._id.toString(),
      },
    }));

    const total = items.reduce(
      (sum, it) => sum + it.product.price * it.quantity,
      0
    );

    res.json({ items, total });
  } catch (err) {
    console.error('GET CART ERROR:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/cart/add
 */
router.post('/add', requireAuth, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ itemId, quantity }] });
    } else {
      const existing = cart.items.find(
        i => i.itemId.toString() === itemId
      );

      if (existing) existing.quantity += quantity;
      else cart.items.push({ itemId, quantity });
    }

    await cart.save();
    res.json({ success: true });
  } catch (err) {
    console.error('ADD CART ERROR:', err);
    res.status(500).json({ message: 'Failed to add item' });
  }
});

/**
 * POST /api/cart/update
 */
router.post('/update', requireAuth, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(
      i => i.itemId.toString() === itemId
    );

    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        i => i.itemId.toString() !== itemId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ success: true });
  } catch (err) {
    console.error('UPDATE CART ERROR:', err);
    res.status(500).json({ message: 'Failed to update item' });
  }
});

/**
 * POST /api/cart/remove
 */
router.post('/remove', requireAuth, async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      i => i.itemId.toString() !== itemId
    );

    await cart.save();
    res.json({ success: true });
  } catch (err) {
    console.error('REMOVE CART ERROR:', err);
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

// POST /api/cart/clear
router.post('/clear', requireAuth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});


export default router;
