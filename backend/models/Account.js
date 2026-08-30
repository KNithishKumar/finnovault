const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add account name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Savings', 'Current', 'Cash Wallet', 'UPI Wallet', 'Credit Card'],
      required: [true, 'Please select account type'],
    },
    balance: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#2563EB',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Account', accountSchema);
