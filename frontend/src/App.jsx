import React from 'react';
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="app-container">
                <nav className="navbar">
                    <NavLink to="/" className="logo">RiskVision</NavLink>
                    {isAuthenticated ? (
                        <div className="nav-links">
                            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <LayoutDashboard size={18} /> Dashboard
                            </NavLink>
                            <NavLink to="/add" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <PlusCircle size={18} /> Add Asset
                            </NavLink>
                            <NavLink to="/risk" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <ShieldAlert size={18} /> Risk Analysis
                            </NavLink>
                            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                                <LogOut size={18} /> Logout ({user.username})
                            </button>
                        </div>
                    ) : (
                        <div className="nav-links">
                            <NavLink to="/login" className="nav-link">
                                <LogIn size={18} /> Login
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
