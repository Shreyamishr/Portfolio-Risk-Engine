import React, { useState, useEffect } from 'react';
import { getAssets, deleteAsset } from '../services/api';
import { Trash2, AlertCircle, TrendingUp, DollarSign, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [assets, setAssets] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalAssets: 0, totalValue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchAssets(page);
    }, [page]);

    const fetchAssets = async (pageNum = 1) => {
        try {
            setLoading(true);
            const res = await getAssets(pageNum);
            // Handle both old array response and new object response
            if (res.data.assets) {
                setAssets(res.data.assets);
                setPagination({
                    currentPage: parseInt(res.data.currentPage),
                    totalPages: res.data.totalPages,
                    totalAssets: res.data.totalAssets,
                    totalValue: res.data.totalValue
                });
            } else {
                setAssets(res.data);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch assets. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                await deleteAsset(id);
                fetchAssets(page); // Refresh current page
            } catch (err) {
                alert('Failed to delete asset');
            }
        }
    };

    const totalPortfolioValue = pagination.totalValue || assets.reduce((sum, asset) => {
        let mv = asset.price * asset.quantity;
        if (asset.type === 'FUTURE') mv *= (asset.leverage || 1);
        return sum + mv;
    }, 0);

    if (loading) return <div className="text-center mt-10">Loading assets...</div>;

    return (
        <div className="animate-fade-in">
            <div className="dashboard-header">
                <h1>Portfolio Dashboard</h1>
                <div className="text-muted">{pagination.totalAssets} Total Assets</div>
            </div>

            <div className="stat-grid">
                <div className="card">
                    <div className="label">Total Portfolio Value</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                        ₹{totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="card">
                    <div className="label">Asset Allocation</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                        {assets.filter(a => a.type === 'STOCK').length} Stocks | {assets.filter(a => a.type === 'OPTION').length} Options
                    </div>
                </div>
            </div>

            {error && (
                <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--danger)' }}>
                        <AlertCircle size={20} /> {error}
                    </div>
                </div>
            )
            }

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Value</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No assets found. Start by adding one!
                                    </td>
                                </tr>
                            ) : (
                                assets.map((asset) => (
                                    <motion.tr
                                        key={asset._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td style={{ fontWeight: 600 }}>{asset.name}</td>
                                        <td>
                                            <span className={`badge badge-${asset.type.toLowerCase()}`}>
                                                {asset.type}
                                            </span>
                                        </td>
                                        <td>₹{asset.price.toFixed(2)}</td>
                                        <td>{asset.quantity}</td>
                                        <td>
                                            ₹{(asset.price * asset.quantity * (asset.type === 'FUTURE' ? (asset.leverage || 1) : 1)).toLocaleString('en-IN')}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(asset._id)}
                                                className="btn btn-danger"
                                                style={{ padding: '0.4rem' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
                        <button
                            className="btn"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Previous
                        </button>
                        <span style={{ fontWeight: 600 }}>Page {page} of {pagination.totalPages}</span>
                        <button
                            className="btn"
                            disabled={page === pagination.totalPages}
                            onClick={() => setPage(page + 1)}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Dashboard;
