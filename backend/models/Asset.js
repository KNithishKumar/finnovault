const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add asset name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['House', 'Car', 'Bike', 'Gold', 'Silver', 'Land', 'Crypto', 'Stocks', 'Electronics', 'Cash', 'Bank Balance'],
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Please add purchase price'],
    },
    currentPrice: {
      type: Number,
      required: [true, 'Please add current market price'],
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Asset', assetSchema);
