const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

router.post('/', assetController.createAsset);
router.get('/', assetController.getAssets);
router.delete('/:id', assetController.deleteAsset);

module.exports = router;
