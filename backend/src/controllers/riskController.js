const Asset = require('../models/Asset');
const riskService = require('../services/riskService');

exports.calculateRisk = async (req, res) => {
    try {
        const { strategy } = req.body;
        const assets = await Asset.find();

        if (!assets || assets.length === 0) {
            return res.status(400).json({ message: 'No assets found in portfolio' });
        }

        const riskData = riskService.calculatePortfolioRisk(assets, strategy);
        res.json(riskData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
