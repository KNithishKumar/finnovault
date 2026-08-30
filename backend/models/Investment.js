const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add investment name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Stocks', 'Mutual Funds', 'SIP', 'FD', 'PPF', 'EPF', 'Gold', 'Crypto', 'Real Estate'],
      required: true,
    },
    investedAmount: {
      type: Number,
      required: [true, 'Please specify invested amount'],
    },
    currentValue: {
      type: Number,
      required: [true, 'Please specify current value'],
    },
    units: {
      type: Number,
      default: 0,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Investment', investmentSchema);
