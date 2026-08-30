const Asset = require('../models/Asset');

// @desc    Get all assets
// @route   GET /api/v1/assets
// @access  Private
const getAssets = async (req, res, next) => {
  try {
    const assets = await Asset.find({ user: req.user._id });
    res.json({ success: true, assets });
  } catch (error) {
    next(error);
  }
};

// @desc    Create asset
// @route   POST /api/v1/assets
// @access  Private
const createAsset = async (req, res, next) => {
  try {
    const { name, type, purchasePrice, currentPrice, purchaseDate, description } = req.body;

    if (!name || !type || purchasePrice === undefined || currentPrice === undefined) {
      res.status(400);
      throw new Error('Please add name, type, purchase price, and current price');
    }

    const images = [];
    if (req.files) {
      req.files.forEach((f) => {
        images.push(`/uploads/${f.filename}`);
      });
    }

    const asset = await Asset.create({
      user: req.user._id,
      name,
      type,
      purchasePrice,
      currentPrice,
      purchaseDate: purchaseDate || new Date(),
      description,
      images,
    });

    res.status(201).json({ success: true, asset });
  } catch (error) {
    next(error);
  }
};

// @desc    Update asset
// @route   PUT /api/v1/assets/:id
// @access  Private
const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, user: req.user._id });

    if (!asset) {
      res.status(404);
      throw new Error('Asset not found');
    }

    asset.name = req.body.name || asset.name;
    asset.type = req.body.type || asset.type;
    asset.purchasePrice = req.body.purchasePrice !== undefined ? req.body.purchasePrice : asset.purchasePrice;
    asset.currentPrice = req.body.currentPrice !== undefined ? req.body.currentPrice : asset.currentPrice;
    asset.purchaseDate = req.body.purchaseDate || asset.purchaseDate;
    asset.description = req.body.description || asset.description;

    if (req.files && req.files.length > 0) {
      const images = [];
      req.files.forEach((f) => {
        images.push(`/uploads/${f.filename}`);
      });
      asset.images = images;
    }

    const updated = await asset.save();
    res.json({ success: true, asset: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete asset
// @route   DELETE /api/v1/assets/:id
// @access  Private
const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, user: req.user._id });

    if (!asset) {
      res.status(404);
      throw new Error('Asset not found');
    }

    await asset.deleteOne();
    res.json({ success: true, message: 'Asset record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
};
