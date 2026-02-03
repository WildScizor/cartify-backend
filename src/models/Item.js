import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
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

// Index for search functionality
itemSchema.index({ title: 'text', description: 'text' });
itemSchema.index({ category: 1 });
itemSchema.index({ price: 1 });

const Item = mongoose.model('Item', itemSchema);

export default Item;

