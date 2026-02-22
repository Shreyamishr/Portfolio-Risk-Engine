import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, ShieldAlert } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AddAsset from './pages/AddAsset';
import RiskCalculation from './pages/RiskCalculation';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="app-container">
                <nav className="navbar">
                    <NavLink to="/" className="logo">RiskVision</NavLink>
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
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/add" element={<AddAsset />} />
                    <Route path="/risk" element={<RiskCalculation />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
