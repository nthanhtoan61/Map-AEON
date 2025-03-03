import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['shop', 'restaurant', 'entertainment', 'service', 'bathroom', 'elevator', 'escalator', 'entrance', 'info', 'parking'],
    default: 'shop'
  },
  category: {
    type: String,
    required: true,
    enum: ['fashion', 'food', 'electronics', 'supermarket', 'beauty', 'entertainment', 'service']
  },
  position: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  floor: {
    type: Number,
    required: true,
    default: 1
  },
  shopNumber: {
    type: String,
    required: true,
    unique: true
  },
  openTime: String,
  closeTime: String,
  imageUrl: String,
  isActive: {
    type: Boolean,
    default: true
  },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }]
}, {
  timestamps: true
});

const Location = mongoose.model('Location', locationSchema);

export default Location;