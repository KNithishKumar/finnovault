const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add goal name'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please set target amount'],
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      required: [true, 'Please set a target date/deadline'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
