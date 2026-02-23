# 🛡️ RiskVision: Advanced Portfolio Risk Engine

RiskVision is a professional-grade, full-stack **Portfolio Risk Management System** designed to help investors quantify and visualize market exposure. It goes beyond simple tracking by implementing industrial financial risk models used by hedge funds and retail banks.

---

##  Key Features

###  1. Secure Authentication
- **JWT-Based Security**: Robust authentication using JSON Web Tokens.
- **User-Specific Portfolios**: Each user manages their own isolated asset collection.
- **Secure Storage**: Password hashing using `bcryptjs`.

###  2. Comprehensive Asset Management
- **Multi-Asset Support**: Handle STOCKS, OPTIONS, and FUTURES.
- **Smart Filtering**: Server-side searching and pagination for high-performance data handling.
- **Exposure Tracking**: Automatic calculation of Market Value, accounting for quantities, prices, and leverage (for futures).

###  3. Advanced Risk Engine (The Core)
- **VaR (Value at Risk)**: Parametric approach using **Covariance Matrices** to model cross-asset correlations (Diversification Benefit).
- **Monte Carlo Simulation**: 10,000 simulations using Geometric Brownian Motion to forecast potential losses.
- **CVaR (Expected Shortfall)**: Historical simulation to capture fat-tail events (Black Swan protection).
- **Risk Contribution**: Detailed breakdown of how much each asset adds to the total portfolio risk.

###  4. Premium Dashboard
- **Rich Aesthetics**: Dark-themed, glassmorphic UI built with Vanilla CSS.
- **Dynamic Animations**: Smooth transitions using **Framer Motion**.
- **Interactive Visuals**: Real-time progress bars showing risk contribution percentages.

---

##  Tech Stack

- **Frontend**: React.js 18, Vite, Framer Motion, Lucide React, Axios.
- **Backend**: Node.js, Express.js, JWT (Authentication), Bcrypt (Security).
- **Database**: MongoDB (Mongoose ODM).
- **Testing**: Jest & Supertest (Unit & Integration testing).

---

##  Financial Methodology (Interview Preparation)

### 1. Parametric VaR (95% Confidence)
The engine calculates the **1-Year Value at Risk** using the Variance-Covariance method:
- **Formula**: $VaR_p = 1.65 \times \sqrt{V^T \Sigma V} \times \sqrt{252}$
- **Logic**: We calculate the daily volatility of each asset, build a covariance matrix ($\Sigma$), and multiply by the exposure vector ($V$). The result is annualized using the $\sqrt{252}$ factor.

### 2. Monte Carlo Simulation
- **Logic**: We generate 10,000 random market scenarios based on the portfolio's aggregated volatility.
- **Calculation**: Each scenario represents a potential portfolio return. We take the 5th percentile (95% confidence) of these returns to determine the VaR. This provides a more robust estimate than parametric VaR when returns are non-normal.

### 3. Conditional VaR (CVaR)
- **Logic**: While VaR tells you "how much can I lose?", CVaR tells you "if things go bad, what is the average loss?".
- **Method**: Historical Simulation. We sort historical returns and average the worst 5%.

---

##  Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas or Local MongoDB

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Running Tests
To verify the risk calculations and API security:
```bash
cd backend
npm test
```

---

##  Documentation & Testing
- **Unit Tests**: Coverage for Risk Calculation logic and Auth Middlewares.
- **API Documentation**: RESTful endpoints for Auth (`/auth`), Assets (`/assets`), and Risk (`/risk`).

---
*Developed as a high-performance Financial Engineering project for Portfolio Risk Analysis.*

