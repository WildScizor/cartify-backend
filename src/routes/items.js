import { Router } from 'express';
import { Item } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', minPrice, maxPrice, page = '1', limit = '12' } = req.query;
    
    // Build query
    let query = {};
    
    // Text search
    const s = String(search).trim();
    if (s) {
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } }
      ];
    }
    
    // Category filter
    const cat = String(category).trim().toLowerCase();
    if (cat) {
      query.category = { $regex: `^${cat}$`, $options: 'i' };
    }
    
    // Price range filter
    const priceFilter = {};
    const min = Number(minPrice);
    const max = Number(maxPrice);
    
    if (!Number.isNaN(min)) priceFilter.$gte = min;
    if (!Number.isNaN(max)) priceFilter.$lte = max;
    
    if (Object.keys(priceFilter).length > 0) {
      query.price = priceFilter;
    }
    
    // Pagination
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;
    
    // Execute query with pagination
    const [items, total] = await Promise.all([
      Item.find(query).skip(skip).limit(l).sort({ createdAt: -1 }),
      Item.countDocuments(query)
    ]);
    
    res.json({ 
      items, 
      total, 
      page: p, 
      pages: Math.ceil(total / l) 
    });
  } catch (error) {
    console.error('Items fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    
    res.json(item);
  } catch (error) {
    console.error('Item fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description = '', price, category = 'General', imageUrl = '' } = req.body || {};
    if (!title || price == null) return res.status(400).json({ message: 'Missing fields' });
    
    const item = await Item.create({
      title,
      description,
      price: Number(price),
      category,
      imageUrl
    });
    
    res.status(201).json(item);
  } catch (error) {
    console.error('Item creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const updateData = { ...req.body };
    if (req.body.price != null) {
      updateData.price = Number(req.body.price);
    }
    
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!item) return res.status(404).json({ message: 'Not found' });
    
    res.json(item);
  } catch (error) {
    console.error('Item update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    
    res.json(item);
  } catch (error) {
    console.error('Item deletion error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;