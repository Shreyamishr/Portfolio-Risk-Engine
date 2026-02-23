const Asset = require('../models/Asset');

exports.createAsset = async (req, res) => {
    try {
        const assetData = { ...req.body, user: req.user.id };
        const asset = new Asset(assetData);
        await asset.save();
        res.status(201).json(asset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAssets = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, name } = req.query;

        // Build filter object with user ID
        const filter = { user: req.user.id };
        if (type) filter.type = type;
        if (name) filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search

        const assets = await Asset.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const allAssets = await Asset.find(filter).select('price quantity type leverage');
        const totalValue = allAssets.reduce((sum, asset) => {
            let mv = asset.price * asset.quantity;
            if (asset.type === 'FUTURE') mv *= (asset.leverage || 1);
            return sum + mv;
        }, 0);

        const count = await Asset.countDocuments(filter);

        res.json({
            assets,
            totalValue,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalAssets: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const asset = await Asset.findOneAndDelete({ _id: id, user: req.user.id });
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found or unauthorized' });
        }
        res.json({ message: 'Asset deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
