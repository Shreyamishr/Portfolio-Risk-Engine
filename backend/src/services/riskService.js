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
 * Monte Carlo Simulation for VaR
 * Simulates 10,000 scenarios for portfolio returns
 */
const calculateMonteCarloVaR = (assetsData, portfolioVolatility, confidence = 0.95, simulations = 10000) => {
    if (portfolioVolatility === 0) return 0;

    // Total portfolio market value
    const totalMV = assetsData.reduce((sum, asset) => sum + asset.marketValue, 0);
    if (totalMV === 0) return 0;

    // Normal random number generator (Box-Muller)
    const randNormal = () => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };

    // Calculate daily volatility (portfolioVolatility is annualized)
    const dailyVol = portfolioVolatility / Math.sqrt(252);

    const simReturns = [];
    for (let i = 0; i < simulations; i++) {
        // Simple Brownian Motion: Return = (mu - 0.5*sigma^2)dt + sigma*sqrt(dt)*Z
        // Assuming mu (drift) = 0 for short horizons as per common VaR practice
        const simulatedReturn = dailyVol * randNormal();
        simReturns.push(simulatedReturn);
    }

    // Sort returns to find percentile
    simReturns.sort((a, b) => a - b);
    const index = Math.floor(simulations * (1 - confidence));
    const percentileReturn = simReturns[index];

    // VaR is the loss (positive value) at the percentile, annualized
    return Math.abs(percentileReturn) * Math.sqrt(252) * totalMV;
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
    let portfolioVolatility = 0;

    if (assets.length > 0) {
        /**
         * PORTFOLIO VaR WITH COVARIANCE MATRIX
         * Formula: VaR_p = 1.65 * sqrt(V^T * Cov * V) * sqrt(252)
         */
        let portfolioVariance = 0;
        const totalMV = assetsData.reduce((sum, a) => sum + a.marketValue, 0);

        for (let i = 0; i < assetsData.length; i++) {
            for (let j = 0; j < assetsData.length; j++) {
                const assetI = assetsData[i];
                const assetJ = assetsData[j];
                const cov = calculateCovariance(assetI.returns, assetJ.returns);
                portfolioVariance += assetI.marketValue * assetJ.marketValue * cov;
            }
        }

        // Annualized Portfolio Volatility
        const portfolioAnnualVariance = Math.abs(portfolioVariance) * 252;
        portfolioVolatility = totalMV > 0 ? Math.sqrt(portfolioAnnualVariance) / totalMV : 0;

        if (strategy === 'VAR') {
            totalRisk = 1.65 * Math.sqrt(portfolioAnnualVariance);
        } else if (strategy === 'MONTE_CARLO') {
            totalRisk = calculateMonteCarloVaR(assetsData, portfolioVolatility);
        } else {
            // Fallback for CVaR or others (Assume independence/Sum)
            totalRisk = assetsData.reduce((sum, item) => sum + item.risk, 0);
        }
    }

    // Calculate Risk Contribution (Marginal Contribution to Risk)
    // Component VaR approx: (Asset_MV * Weights * Cov_with_Portfolio) / Portfolio_Vol
    const sumIndividual = assetsData.reduce((s, a) => s + a.risk, 0);

    const assetRisks = assetsData.map(item => {
        // Calculate contribution based on how much this asset adds to total risk
        // For simplicity, we'll show both absolute risk and relative contribution
        let contributionValue = 0;
        if (totalRisk > 0 && strategy === 'VAR') {
            // Simplified Marginal Risk Contribution: How much of the total risk is due to this asset
            // CV_i = w_i * (Cov(i, p) / Var(p)) * VaR(p)
            // For this UI, we'll use a simplified version for demonstration
            contributionValue = item.risk;
        } else {
            contributionValue = item.risk;
        }

        return {
            assetId: item.assetId,
            name: item.name,
            individualRisk: item.risk,
            contributionPercentage: sumIndividual > 0 ? (item.risk / sumIndividual) * 100 : 0
        };
    });

    return {
        strategy,
        totalRisk,
        portfolioVolatility,
        diversificationBenefit: (strategy === 'VAR' || strategy === 'MONTE_CARLO') ? (sumIndividual - totalRisk) : 0,
        assetRisks,
        timestamp: new Date()
    };
};

module.exports = {
    calculateVolatility,
    calculateVaR,
    calculateCVaR,
    calculatePortfolioRisk
};
