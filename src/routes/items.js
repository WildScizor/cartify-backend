import { Router } from 'express';
import { Item } from '../models/index.js';
import mongoose from 'mongoose';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Normalize language (e.g. en-US → en)
    const rawLang = req.headers['accept-language'] || 'en';
    const lang = rawLang.split(',')[0].split('-')[0].toLowerCase();

    const { search, category } = req.query;

    // 1. Fetch English items from 'items' collection
    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    const rawItems = await Item.find(query).lean();

    // 2. Fetch the SINGLE translations document
    const db = mongoose.connection.db;
    const translationsDoc = await db
      .collection('translations')
      .findOne({});

    // 3. Overwrite English titles with translations
    const items = rawItems.map(item => {
      const translatedSet = translationsDoc?.[item.title];

      return {
        ...item,
        title:
          translatedSet?.[lang] ||
          translatedSet?.en ||
          item.title,
        id: item._id.toString(),
      };
    });

    res.json({ items });
  } catch (error) {
    console.error('Translation Overwrite Failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
