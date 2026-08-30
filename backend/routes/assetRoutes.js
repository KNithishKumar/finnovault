const express = require('express');
const router = express.Router();
const {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getAssets)
  .post(upload.array('images', 5), createAsset);

router.route('/:id')
  .put(upload.array('images', 5), updateAsset)
  .delete(deleteAsset);

module.exports = router;
