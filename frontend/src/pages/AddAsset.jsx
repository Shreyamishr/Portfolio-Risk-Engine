import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAsset } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

const AddAsset = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        type: 'STOCK',
        price: '',
        quantity: '',
        priceHistory: '', // Will be parsed as JSON
        strikePrice: '',
        underlyingPrice: '',
        leverage: '1'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Parse price history
            let parsedHistory = [];
            try {
                parsedHistory = JSON.parse(formData.priceHistory);
            } catch (err) {
                // Simple fallback: convert comma separated values to today and working backwards
                const prices = formData.priceHistory.split(',').map(Number);
                if (prices.some(isNaN)) throw new Error('Invalid price history format');

                parsedHistory = prices.map((p, i) => ({
                    date: new Date(Date.now() - (prices.length - 1 - i) * 24 * 60 * 60 * 1000),
                    price: p
                }));
            }

            const payload = {
                name: formData.name,
                type: formData.type,
                price: Number(formData.price),
                quantity: Number(formData.quantity),
                priceHistory: parsedHistory,
                strikePrice: formData.type === 'OPTION' ? Number(formData.strikePrice) : undefined,
                underlyingPrice: formData.type === 'OPTION' ? Number(formData.underlyingPrice) : undefined,
                leverage: formData.type === 'FUTURE' ? Number(formData.leverage) : undefined,
            };

            await createAsset(payload);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to create asset. Check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    const sampleHistory = "100, 102, 101, 105, 103, 108, 110, 107, 109, 112";

    return (
        <div className="animate-fade-in">
            <div className="dashboard-header">
                <button onClick={() => navigate('/')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
                <h1>Add New Asset</h1>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Asset Name</label>
                        <input
                            className="input"
                            name="name"
                            placeholder="e.g. Apple Inc, BTC-USD Future"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label className="label">Asset Type</label>
                            <select className="select" name="type" value={formData.type} onChange={handleChange}>
                                <option value="STOCK">STOCK</option>
                                <option value="OPTION">OPTION</option>
                                <option value="FUTURE">FUTURE</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label">Current Price</label>
                            <input className="input" type="number" name="price" step="0.01" required value={formData.price} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Quantity (use negative for short positions)</label>
                        <input className="input" type="number" name="quantity" required value={formData.quantity} onChange={handleChange} />
                    </div>

                    {formData.type === 'OPTION' && (
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="label">Strike Price</label>
                                <input className="input" type="number" name="strikePrice" step="0.01" required value={formData.strikePrice} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="label">Underlying Price</label>
                                <input className="input" type="number" name="underlyingPrice" step="0.01" required value={formData.underlyingPrice} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {formData.type === 'FUTURE' && (
                        <div className="form-group">
                            <label className="label">Leverage</label>
                            <input className="input" type="number" name="leverage" step="0.1" required value={formData.leverage} onChange={handleChange} />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="label">Price History (Min 5 days, recommend 20+)</label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            Enter comma-separated prices (oldest to newest): <code>{sampleHistory}</code>
                        </p>
                        <textarea
                            className="textarea"
                            name="priceHistory"
                            rows="4"
                            required
                            placeholder={sampleHistory}
                            value={formData.priceHistory}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={loading}>
                        <Save size={18} /> {loading ? 'Saving...' : 'Add Asset to Portfolio'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAsset;
