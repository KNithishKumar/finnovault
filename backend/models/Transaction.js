const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'transfer', 'investment', 'loan', 'borrow', 'lend', 'savings'],
      required: [true, 'Please specify transaction type'],
    },
    amount: {
      type: Number,
      required: [true, 'Please specify transaction amount'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account', // relevant only for transfers
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'Bank', 'Wallet'],
      default: 'Bank',
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
    attachment: {
      type: String,
      default: '',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceFrequency: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'none',
    },
    nextRecurrenceDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
