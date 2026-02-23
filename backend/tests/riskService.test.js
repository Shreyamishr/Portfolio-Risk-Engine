const { calculateVolatility, calculateVaR, calculateCVaR, calculatePortfolioRisk } = require('../src/services/riskService');

describe('RiskService', () => {
    const mockPriceHistory = [
        { date: '2023-01-01', price: 100 },
        { date: '2023-01-02', price: 102 },
        { date: '2023-01-03', price: 101 },
        { date: '2023-01-04', price: 103 },
        { date: '2023-01-05', price: 105 }
    ];

    const mockAsset = {
        _id: '1',
        name: 'Test Asset',
        price: 105,
        quantity: 10,
        priceHistory: mockPriceHistory
    };

    test('calculateVolatility should return a number', () => {
        const volatility = calculateVolatility(mockPriceHistory);
        expect(typeof volatility).toBe('number');
        expect(volatility).toBeGreaterThan(0);
    });

    test('calculateVaR should return a number', () => {
        const varValue = calculateVaR(mockAsset);
        expect(typeof varValue).toBe('number');
        expect(varValue).toBeGreaterThan(0);
    });

    test('calculateCVaR should return a number', () => {
        const cvarValue = calculateCVaR(mockAsset);
        expect(typeof cvarValue).toBe('number');
        expect(cvarValue).toBeGreaterThan(0);
    });

    test('calculatePortfolioRisk should handle multiple assets', () => {
        const assets = [
            mockAsset,
            { ...mockAsset, _id: '2', name: 'Asset 2' }
        ];
        const risk = calculatePortfolioRisk(assets, 'VAR');
        expect(risk.totalRisk).toBeGreaterThan(0);
        expect(risk.assetRisks.length).toBe(2);
    });

    test('calculatePortfolioRisk should handle Monte Carlo strategy', () => {
        const assets = [mockAsset];
        const risk = calculatePortfolioRisk(assets, 'MONTE_CARLO');
        expect(risk.totalRisk).toBeGreaterThan(0);
        expect(risk.strategy).toBe('MONTE_CARLO');
    });
});
