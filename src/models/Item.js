import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true, trim: true },
    hi: { type: String, required: true, trim: true }
  },
  description: {
    en: { type: String, default: '', trim: true },
    hi: { type: String, default: '', trim: true }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  imageUrl: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

// Updated indexes for the new object structure
itemSchema.index({ 'title.en': 'text', 'title.hi': 'text', 'description.en': 'text', 'description.hi': 'text' });
itemSchema.index({ category: 1 });
itemSchema.index({ price: 1 });

const Item = mongoose.model('Item', itemSchema);

export default Item;