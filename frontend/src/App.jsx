import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, ShieldAlert, LogOut, LogIn } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AddAsset from './pages/AddAsset';
import RiskCalculation from './pages/RiskCalculation';
import Login from './pages/Login';
import Register from './pages/Register';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" />;
    return children;
};

function App() {
    const isAuthenticated = !!localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="app-container">
                <nav className="navbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <NavLink to="/" className="logo">RiskVision</NavLink>
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{ display: 'none' }}
                        >
                            {isMenuOpen ? '✕' : '☰'}
                        </button>
                    </div>

                    {isAuthenticated ? (
                        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                <LayoutDashboard size={18} /> <span>Dashboard</span>
                            </NavLink>
                            <NavLink to="/add" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                <PlusCircle size={18} /> <span>Add Asset</span>
                            </NavLink>
                            <NavLink to="/risk" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                <ShieldAlert size={18} /> <span>Risk Analysis</span>
                            </NavLink>
                            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                                <LogOut size={18} /> <span>Logout ({user.username})</span>
                            </button>
                        </div>
                    ) : (
                        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                            <NavLink to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                                <LogIn size={18} /> <span>Login</span>
                            </NavLink>
                        </div>
                    )}
                </nav>


                <Routes>
                    <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                    <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/add" element={<ProtectedRoute><AddAsset /></ProtectedRoute>} />
                    <Route path="/risk" element={<ProtectedRoute><RiskCalculation /></ProtectedRoute>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
