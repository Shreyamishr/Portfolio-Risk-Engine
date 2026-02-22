const Asset = require('../models/Asset');

exports.createAsset = async (req, res) => {
    try {
        const asset = new Asset(req.body);
        await asset.save();
        res.status(201).json(asset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAssets = async (req, res) => {
    try {
        const assets = await Asset.find();
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const asset = await Asset.findByIdAndDelete(id);
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json({ message: 'Asset deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
