/**
 * Risk Engine Service
 * Handles financial calculations for VaR and CVaR
 */

/**
 * Calculates daily returns from price history
 * R_t = (P_t - P_{t-1}) / P_{t-1}
 */
const calculateDailyReturns = (priceHistory) => {
    if (!priceHistory || priceHistory.length < 2) return [];

    // Sort by date to ensure chronological order
    const sortedHistory = [...priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date));

    const returns = [];
    for (let i = 1; i < sortedHistory.length; i++) {
        const prevPrice = sortedHistory[i - 1].price;
        const currPrice = sortedHistory[i].price;
        if (prevPrice !== 0) {
            returns.push((currPrice - prevPrice) / prevPrice);
        }
    }
    return returns;
};

/**
 * Calculates standard deviation of an array of numbers
 */
const calculateStdDev = (data) => {
    if (!data || data.length === 0) return 0;
    const n = data.length;
    const mean = data.reduce((a, b) => a + b) / n;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1 || 1);
    return Math.sqrt(variance);
};

/**
 * Calculates annualized volatility
 */
const calculateVolatility = (priceHistory) => {
    const returns = calculateDailyReturns(priceHistory);
    if (returns.length === 0) return 0;

    const stdDev = calculateStdDev(returns);
    return stdDev * Math.sqrt(252);
};

/**
 * Calculates Market Value of an asset
 * Handles both long (positive quantity) and short (negative quantity) positions
 */
const calculateMarketValue = (asset) => {
    // Risk is the absolute exposure to price movements
    let mv = Math.abs(asset.price * asset.quantity);
    if (asset.type === 'FUTURE') {
        mv *= (asset.leverage || 1);
    }
    return mv;
};

/**
 * Calculates Value at Risk (VaR) at 95% confidence level
 * Formula: VaR = 1.65 * annualized_volatility * marketValue
 * Horizon: 1-Year (based on sqrt(252) annualization)
 */
const calculateVaR = (asset) => {
    if (!asset.priceHistory || asset.priceHistory.length < 5) {
        return 0; // Not enough history for standard deviation
    }
    const volatility = calculateVolatility(asset.priceHistory);
    const marketValue = calculateMarketValue(asset);
    return 1.65 * volatility * marketValue;
};

/**
 * Calculates Conditional Value at Risk (CVaR) using Historical Simulation
 * Steps: Compute returns, sort ascending, take worst 5%, average, multiply by MV
 */
const calculateCVaR = (asset) => {
    const returns = calculateDailyReturns(asset.priceHistory);
    if (returns.length < 5) return 0;

    // Sort ascending (worst returns first)
    const sortedReturns = [...returns].sort((a, b) => a - b);

    // Take worst 5% (at least one worst return)
    const index = Math.max(1, Math.floor(sortedReturns.length * 0.05));
    const worstReturns = sortedReturns.slice(0, index);

    // Average those losses (as positive value)
    const avgLoss = Math.abs(worstReturns.reduce((a, b) => a + b, 0) / worstReturns.length);
    const marketValue = calculateMarketValue(asset);

    // Annualize for 1-Year Horizon consistency with VaR
    return avgLoss * Math.sqrt(252) * marketValue;
};

/**
 * Calculates covariance between two return series
 */
const calculateCovariance = (returnsA, returnsB) => {
    const n = Math.min(returnsA.length, returnsB.length);
    if (n < 2) return 0;

    const meanA = returnsA.slice(0, n).reduce((a, b) => a + b) / n;
    const meanB = returnsB.slice(0, n).reduce((a, b) => a + b) / n;

    let covariance = 0;
    for (let i = 0; i < n; i++) {
        covariance += (returnsA[i] - meanA) * (returnsB[i] - meanB);
    }
    return covariance / (n - 1);
};

/**
 * Calculates total portfolio risk
 * Now uses Covariance Matrix for correlated assets
 */
const calculatePortfolioRisk = (assets, strategy = 'VAR') => {
    // 1. Calculate individual risks and return series
    const assetsData = assets.map(asset => {
        const returns = calculateDailyReturns(asset.priceHistory);
        const marketValue = calculateMarketValue(asset);
        const risk = strategy === 'VAR' ? calculateVaR(asset) : calculateCVaR(asset);

        return {
            assetId: asset._id,
            name: asset.name,
            returns,
            marketValue,
            risk
        };
    });

    let totalRisk = 0;

    if (strategy === 'VAR' && assets.length > 1) {
        /**
         * PORTFOLIO VaR WITH COVARIANCE MATRIX
         * Formula: VaR_p = 1.65 * sqrt(V^T * Cov * V) * sqrt(252)
         * Where V is the vector of dollar exposures
         */
        let portfolioVariance = 0;

        for (let i = 0; i < assetsData.length; i++) {
            for (let j = 0; j < assetsData.length; j++) {
                const assetI = assetsData[i];
                const assetJ = assetsData[j];

                // Calculate covariance between asset i and j
                const cov = calculateCovariance(assetI.returns, assetJ.returns);

                // Add to total variance: w_i * w_j * cov(i, j)
                // Here we use absolute exposure for risk calculation
                portfolioVariance += assetI.marketValue * assetJ.marketValue * cov;
            }
        }

        // Annualize the variance and calculate VaR
        totalRisk = 1.65 * Math.sqrt(Math.abs(portfolioVariance) * 252);
    } else {
        // Fallback for CVaR or single asset (Assume independence/Sum)
        totalRisk = assetsData.reduce((sum, item) => sum + item.risk, 0);
    }

    // Calculate individual risks for the response
    const assetRisks = assetsData.map(item => ({
        assetId: item.assetId,
        name: item.name,
        risk: item.risk,
        contributionPercentage: totalRisk > 0 ? (item.risk / assetsData.reduce((s, a) => s + a.risk, 0)) * (item.risk / totalRisk * 100) : 0
    }));

    // Adjust contribution to be relative to totalRisk
    const sumIndividual = assetsData.reduce((s, a) => s + a.risk, 0);
    const assetRisksAdjusted = assetsData.map(item => ({
        assetId: item.assetId,
        name: item.name,
        risk: item.risk,
        contributionPercentage: sumIndividual > 0 ? (item.risk / sumIndividual) * 100 : 0
    }));

    return {
        strategy,
        totalRisk,
        diversificationBenefit: strategy === 'VAR' ? (sumIndividual - totalRisk) : 0,
        assetRisks: assetRisksAdjusted,
        timestamp: new Date()
    };
};

module.exports = {
    calculateVolatility,
    calculateVaR,
    calculateCVaR,
    calculatePortfolioRisk
};
