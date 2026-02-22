# Portfolio Risk Management Engine

A full-stack application to manage financial assets and calculate portfolio risk using **Value at Risk (VaR)** and **Conditional Value at Risk (CVaR)**.

##  Features

- **Asset Management**: Support for STOCKS, OPTIONS, and FUTURES.
- **Risk Engine**: Automated calculation of volatility and risk metrics.
- **Portfolio-Level Risk**: Advanced **Covariance Matrix** logic to account for asset correlations.
- **Dashboard**: Professional UI with real-time portfolio summary and Diversification Benefit display.
- **Advanced Metrics**: Choose between Correlated Parametric VaR and Historical CVaR.

## 🛠 Architecture

The application follows a clean separation of concerns:

- **Frontend**: React.js with Functional Components and Hooks. Styled with Premium Vanilla CSS and Framer Motion for animations.
- **Backend**: Node.js & Express. Logic is modularized into Controllers, Services, and Routes.
- **Database**: MongoDB (Mongoose) for persistent asset storage.
- **Risk Service**: A dedicated service containerizes all financial logic, keeping the controllers lean.

##  Financial Formulas

### 1. Volatility Calculation
We use annualized daily return standard deviation:
1.  **Daily Returns ($R_t$)**: $R_t = \frac{P_t - P_{t-1}}{P_{t-1}}$
2.  **Standard Deviation ($\sigma$)**: calculated over the return series.
3.  **Annualized Volatility**: $\sigma_{annual} = \sigma_{daily} \times \sqrt{252}$

### 2. Value at Risk (VaR 95%) - 1 Year Horizon
Estimated maximum potential loss over a **1-year time horizon** with 95% confidence:
$VaR = 1.65 \times \sigma_{annual} \times MarketValue$

*Note: For Futures, Market Value is adjusted by leverage. For short positions, absolute exposure is used.*

### 3. Conditional Value at Risk (CVaR) - 1 Year Horizon
Also known as Expected Shortfall, calculated using **Historical Simulation** and annualized for horizon consistency:
1.  Compute all historical daily returns ($R_t$).
2.  Sort returns in ascending order.
3.  Identify the worst 5% of returns.
4.  **CVaR** = Average of those worst 5% returns $\times \sqrt{252} \times MarketValue$.

### 4. Portfolio VaR (Correlated Approach)
Unlike simple summation, the engine uses a **Covariance Matrix** to model how assets move together:
- **Formula**: $VaR_p = 1.65 \times \sqrt{V^T \Sigma V} \times \sqrt{252}$
- Where $V$ is the vector of dollar exposures and $\Sigma$ is the covariance matrix of daily returns.
- **Diversification Benefit**: The reduction in risk achieved by holding non-perfectly correlated assets.

##  Assumptions & Limitations

- **Correlation Modeling**: Assets are **no longer assumed to be independent**. The engine calculates a full covariance matrix for VaR, correctly modeling diversification benefits. (Note: CVaR still uses asset-level summation for individual logic).
- **Short Selling**: The engine handles negative quantities (shorting) by calculating risk based on total market exposure (absolute value).
- **Time Horizon**: Risk metrics are calculated on a **1-year horizon** using the $\sqrt{252}$ scaling factor.
- **Data Validation**: A minimum of 5 days of price history is required. Risk is calculated as 0 if data is insufficient.
- **Option Greeks**: For Options, we calculate risk based on historical price volatility rather than Delta/Gamma greeks.
- **Normal Distribution**: VaR assumes returns are normally distributed (Parametric approach).

##  Future Improvements

- [x] **Covariance Matrix**: Incorporate asset correlations for more accurate portfolio-level risk. (✅ COMPLETED)
- [ ] **Monte Carlo Simulation**: implement stochastic modeling for risk forecasting.
- [ ] **Real-time Data**: Integrate with Alpha Vantage or Yahoo Finance APIs for live pricing.
- [ ] **Authentication**: Secure user portfolios with JWT-based auth.
- [ ] **Dockerization**: Containerize services for easy deployment.

##  Setup

### Backend
1. `cd backend`
2. `npm install`
3. Create `.env` with `MONGODB_URI`
4. `node seed.js` (To populate sample Reliance & Nifty data)
5. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---
*Created for the Portfolio Risk Management Interview Assignment.*

