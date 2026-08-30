const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const Loan = require('../models/Loan');
const BorrowLend = require('../models/BorrowLend');
const Asset = require('../models/Asset');
const Investment = require('../models/Investment');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_finvault_jwt_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Mock verification token
    const verificationToken = Math.random().toString(36).substring(2, 15);

    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      isVerified: true, // auto verify for quick onboarding in mock mode
    });

    if (user) {
      // Create initial cash wallet account for new user to make getting started easy
      await Account.create({
        user: user._id,
        name: 'Cash Wallet',
        type: 'Cash Wallet',
        balance: 1000, // Seed with $1000
        isPinned: true,
        color: '#10B981',
      });

      console.log(`Verification Email Link: http://localhost:5000/api/v1/auth/verify-email/${verificationToken}`);

      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        timezone: user.timezone,
        language: user.language,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        timezone: user.timezone,
        language: user.language,
        avatar: user.avatar,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password trigger
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('No account found with this email');
    }

    const resetToken = Math.random().toString(36).substring(2, 15);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    console.log(`Password Reset Link: http://localhost:3000/reset-password/${resetToken}`);

    res.json({ success: true, message: 'Password reset link simulated in server console.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile data
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.currency = req.body.currency || user.currency;
    user.timezone = req.body.timezone || user.timezone;
    user.language = req.body.language || user.language;
    user.avatar = req.body.avatar || user.avatar;

    const updatedUser = await user.save();

    res.json({
      success: true,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      currency: updatedUser.currency,
      timezone: updatedUser.timezone,
      language: updatedUser.language,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user || !(await user.matchPassword(oldPassword))) {
      res.status(400);
      throw new Error('Incorrect current password');
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and cascade delete all their data
// @route   DELETE /api/v1/auth/delete-account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Cascade delete everything associated with this user
    await Account.deleteMany({ user: userId });
    await Transaction.deleteMany({ user: userId });
    await Budget.deleteMany({ user: userId });
    await SavingsGoal.deleteMany({ user: userId });
    await Loan.deleteMany({ user: userId });
    await BorrowLend.deleteMany({ user: userId });
    await Asset.deleteMany({ user: userId });
    await Investment.deleteMany({ user: userId });
    await Notification.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Account and all associated financial data permanently deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  deleteAccount,
};
