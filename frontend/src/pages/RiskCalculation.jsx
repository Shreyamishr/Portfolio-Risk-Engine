import React, { useState } from 'react';
import { calculateRisk } from '../services/api';
import { ShieldCheck, Info, PieChart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const RiskCalculation = () => {
    const [strategy, setStrategy] = useState('VAR');
    const [riskData, setRiskData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCalculate = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await calculateRisk(strategy);
            setRiskData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to calculate risk. Do you have assets?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="dashboard-header">
                <h1>Risk Analysis Engine</h1>
                <div className="text-muted">Analyze your portfolio exposure</div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Sidebar Controls */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Configuration</h3>

                    <div className="form-group">
                        <label className="label">Risk Strategy</label>
                        <select className="select" value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                            <option value="VAR">Parametric VaR (Covariance Matrix)</option>
                            <option value="MONTE_CARLO">Monte Carlo Simulation</option>
                            <option value="CVAR">Conditional VaR (Expected Shortfall)</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                            <Info size={16} /> Methodology
                        </div>
                        {strategy === 'VAR' ? (
                            <p><b>Parametric VaR</b> uses a <b>Covariance Matrix</b> to account for correlations between assets. It estimates the maximum potential loss over 1 year with 95% confidence.</p>
                        ) : strategy === 'MONTE_CARLO' ? (
                            <p><b>Monte Carlo VaR</b> simulates 10,000 random market scenarios based on portfolio volatility to determine the 95th percentile worst-case loss.</p>
                        ) : (
                            <p><b>1-Year CVaR</b> (Historical Simulation) computes the average of the worst 5% of historical returns to estimate loss during extreme tail events.</p>
                        )}
                        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                            * Correlation Modeling: Active
                        </p>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        onClick={handleCalculate}
                        disabled={loading}
                    >
                        {loading ? 'Calculating...' : (
                            <>
                                <ShieldCheck size={18} /> Run Risk Analysis
                            </>
                        )}
                    </button>

                    {error && <div style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</div>}
                </div>

                {/* Results Area */}
                <div>
                    {!riskData ? (
                        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                            <Activity size={48} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                            <h3>No Analysis Performed</h3>
                            <p>Configure strategy and click "Run Risk Analysis" to see results.</p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' }}>
                                <div className="label">Total Portfolio Risk ({riskData.strategy})</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                                    ₹{riskData.totalRisk.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>at 95% confidence level (1-Year Horizon)</span>
                                    {riskData.diversificationBenefit > 0 && (
                                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                                            Diversification Benefit: ₹{riskData.diversificationBenefit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>
                            </div>


                            <h3>Asset Risk Contribution</h3>
                            <div className="card" style={{ marginTop: '1rem' }}>
                                {riskData.assetRisks.sort((a, b) => b.individualRisk - a.individualRisk).map((asset, index) => (
                                    <div key={index} className="risk-item">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 600 }}>{asset.name}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>₹{asset.individualRisk.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="progress-bar">
                                                <motion.div
                                                    className="progress-fill"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${asset.contributionPercentage}%` }}
                                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ width: '60px', textAlign: 'right', fontWeight: 700, marginLeft: '1rem' }}>
                                            {asset.contributionPercentage.toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiskCalculation;
