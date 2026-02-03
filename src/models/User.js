import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Virtual for user without password
userSchema.virtual('publicProfile').get(function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    createdAt: this.createdAt
  };
});

// Method to compare password
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

// Static method to create user with hashed password
userSchema.statics.createUser = async function(userData) {
  const { email, password, name } = userData;
  const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  return this.create({ email, name, passwordHash });
};

const User = mongoose.model('User', userSchema);

export default User;

