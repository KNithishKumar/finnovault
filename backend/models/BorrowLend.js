const mongoose = require('mongoose');

const borrowLendSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    personName: {
      type: String,
      required: [true, 'Please add contact name'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['borrowed', 'lent'],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add amount'],
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please set due date'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paymentHistory: [
      {
        date: { type: Date, default: Date.now },
        amount: Number,
        transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BorrowLend', borrowLendSchema);
