const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add loan name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Home Loan', 'Car Loan', 'Education Loan', 'Personal Loan'],
      required: true,
    },
    principal: {
      type: Number,
      required: [true, 'Please add principal amount'],
    },
    interestRate: {
      type: Number, // Annual percentage rate
      required: [true, 'Please add annual interest rate'],
    },
    termMonths: {
      type: Number,
      required: [true, 'Please add loan term in months'],
    },
    emi: {
      type: Number,
      required: [true, 'Please add monthly EMI amount'],
    },
    remainingBalance: {
      type: Number,
      required: true,
    },
    nextDueDate: {
      type: Date,
      required: [true, 'Please add next due date'],
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
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

module.exports = mongoose.model('Loan', loanSchema);
