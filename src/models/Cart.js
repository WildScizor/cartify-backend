import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

// Virtual for cart total calculation
cartSchema.virtual('total').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);
});

// Method to add item to cart
cartSchema.methods.addItem = function(itemId, quantity = 1) {
  const existingItem = this.items.find(item => item.itemId.toString() === itemId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ itemId, quantity });
  }
  
  this.updatedAt = new Date();
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.find(item => item.itemId.toString() === itemId.toString());
  
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    this.items = this.items.filter(item => item.itemId.toString() !== itemId.toString());
  } else {
    item.quantity = quantity;
  }
  
  this.updatedAt = new Date();
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item.itemId.toString() !== itemId.toString());
  this.updatedAt = new Date();
  return this.save();
};

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ userId }).populate('items.itemId');
  
  if (!cart) {
    cart = await this.create({ userId, items: [] });
  }
  
  return cart;
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
