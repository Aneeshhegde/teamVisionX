# WealthX — Intelligent Wealth & Personal Financial Decision System
> **Built with the MERN Stack (MongoDB, Express, React 18, Node.js) & Vite**

WealthX is a full-featured Personal Financial Intelligence & Decision System designed with an institutional dark-navy fintech aesthetic, real-time portfolio analytics, multi-tenant security, algorithmic financial calculators, behavioral risk profiling, and multi-pillar diagnostics.

---

## 🌟 Key Modules & Features

### 1. 🔐 Authentication & Multi-Tenant Security
- **JWT Authentication & RBAC**: Secure JSON Web Token authentication with bcrypt password hashing.
- **Strict Data Isolation**: Multi-tenant database querying (`{ _id, userId }`) ensuring users cannot read, mutate, or delete cross-account financial records.
- **Password Recovery**: 6-digit OTP email verification with timed expiration and secure reset.
- **Protected Routing**: React Router v6 route guards with onboarding checks (`<ProtectedRoute>`, `<PublicOnlyRoute>`).

### 2. 📊 Command Center (Dashboard — 6-Level Hierarchy)
- **Level 1 — Financial Snapshot**: Net Worth (Live assets minus liabilities), Monthly Income, Monthly Surplus (Savings Rate), Emergency Runway.
- **Level 2 — What Needs My Attention?**: Top 2–4 prioritized algorithmic insights with severity indicators (`🟢 Good`, `🟡 Warning`, `🔴 Critical`).
- **Level 3 — Visual Diagnostics**: 6-Month Net Worth Trend Line Chart, Cashflow Dynamics Bar Chart, and Asset Allocation Donut.
- **Level 4 — Wealth Decision**: "Where should your next ₹10,000 go?" visual prompt and direct jump.
- **Level 5 — Behavioral Blueprint**: Risk DNA score preview and target allocation alignment.
- **Level 6 — Quick Actions**: Direct action shortcuts.

### 3. 🧬 WealthX Risk DNA (`/risk-dna`)
- **Behavioral Profiling Wizard**: 7-question diagnostic flow evaluating Age, Income Stability, Emergency Buffer, Investment Horizon, Drawdown Psychological Tolerance, and Primary Goals.
- **Quantified Risk Score (0–100)**: Classifies users into Conservative, Moderate, Moderate Growth, Growth, or Aggressive.
- **Portfolio vs. Risk DNA Mismatch Engine**: Evaluates live Wealth Vault holdings against recommended target asset allocation (Equity %, Debt %, Gold %, Cash %) and flags structural deviations.

### 4. 🤖 AI Decision Lab (`/ai-decision-lab`)
- **Google Gemini AI Intelligence Layer**: Powered by Google Gemini 3.6 Flash connected to the backend decision engine.
- **Strict Grounding Guardrails**: Gemini reasons over verified balance sheet numbers, Risk DNA, AMFI mutual fund NAVs, and Upstox market metrics without hallucinating financial values.
- **Conversational Multi-Turn Follow-Ups**: Supports interactive follow-up questions (*"What if I invest ₹5,000 every month?"*, *"Is my portfolio too risky?"*, *"Should I wait before investing?"*).
- **Structured Reasoning Output**: Explains why a fund matches or does not match, provides risk cautions, Risk DNA alignment, goal pacing impact, and dynamic surplus allocation.

### 5. 💡 "My Next ₹10,000" Surplus Optimizer (`/my-next-money`)
- **Dynamic Surplus Allocation**: Analyzes real-time emergency runway, debt burden, and growth capacity.
- **Interactive Custom Amount**: Sliders & quick selectors for ₹5k, ₹10k, ₹25k, ₹50k, and ₹100k.
- **Visual Segmented Allocation Bar**: Clean color-coded breakdown with rationale for every single rupee.

### 6. ⏳ Future You Simulator (`/future-you`)
- **Multi-Decade Wealth Trajectory Forecaster**: Compares **Current Baseline Path** (static SIP) vs. **WealthX Optimized Path** (annual step-up compounding).
- **Interactive SVG Trajectory Chart**: Displays 5, 10, 15, 20, 25, and 30-year projections with interactive crosshairs and delta callouts.

### 7. 🛡️ Investment Hype Check (`/hype-check`)
- **0–100 Speculation & FOMO Filter**: Audits any stock, memecoin, crypto, derivative, or trendy asset across 6 structural dimensions.
- **Explicit Labeling**: Tagged with `SIMULATED / SYNTHETIC ANALYTICAL ENGINE (Educational Assessment)`.

### 8. 🇮🇳 Government Schemes Finder (`/schemes`)
- **Sovereign Wealth & Welfare Directory**: Indexed with India's core government schemes (PPF, NPS, SSY, SGB, SCSS, MSSC, APY).
- **Profile Matching**: Recommends best fit based on income bracket, risk posture, and tax optimization goals with official government portal links.

### 9. 🕰️ Audit & Financial History (`/history`)
- **Chronological Timeline Ledger**: Automatically logs asset creations/mutations, loan additions, goal updates, risk profile calibrations, and decision inquiries.
- **Net Worth Progression Curve**: 6-month historical line chart.

### 10. 🔬 Understand (Diagnostics & Asset Ledger)
- **Financial X-Ray (`/financial-xray`)**: 4-pillar diagnostics laboratory:
  - *Income & Cashflow Dynamics*: Inflows, outflows, burn rate, and net savings rate with BarChart.
  - *Emergency Liquidity Runway*: Current liquid buffer vs. recommended 6-month reserve with visual progress bar.
  - *Portfolio Diversification*: Multi-category asset distribution with $>65\%$ concentration risk warnings.
  - *Debt-to-Income (DTI) Health*: Active loan EMI burden analysis (`Low <20%`, `Moderate 20-40%`, `High >40%`).
- **Wealth Vault (`/wealth-vault`)**: Consolidated asset registry across Stocks, Mutual Funds, Digital Gold, Fixed Deposits, Bonds, Crypto, and Real Estate with live unrealized P&L, DonutChart composition, and Risk DNA comparison.
- **Financial Goals (`/goals`)**: Milestone tracker with multi-goal progress comparison, deadline countdowns, required monthly contributions, and quick contribution logging.
- **Action Plan (`/action-plan`)**: Automated priority-grouped action engine (High / Medium / Low).

### 11. 📈 Invest & Save
- **Investment Hub (`/investments`)**: Asset class directory with risk ratings and statutory disclosures.
- **Stocks Explorer (`/investments/stocks`)**: Synthetic market analytics engine featuring debounced ticker search, interactive 30-day SVG trendlines, and valuation multiples.
- **Educational Knowledge Modules**: In-depth investment and tax guides for SIPs, Digital Gold, Fixed Deposits, Bonds, and Index ETFs.

### 12. 🧮 Plan & Calculate (Calculators Suite)
- **SIP Calculator (`/calculators/sip`)**, **Step-Up SIP (`/calculators/step-up-sip`)**, **Loan EMI (`/calculators/emi`)**, **FD Growth (`/calculators/fd`)**, and **Goal Target (`/calculators/goal`)**.

### 13. 💳 Loans & Debt Management
- **Loans Overview (`/loans`)**, **Loan Finder (`/loans/finder`)**, **Compare Loans (`/loans/compare`)**, and **Accelerated Prepayment & Payoff Simulator**.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Vanilla CSS (Design Tokens, Glassmorphism, Responsive Grid) |
| **Charts** | Custom Zero-Dependency Responsive SVG Chart Suite (`LineChart`, `BarChart`, `DonutChart`, `ProgressRing`, `AllocationBar`, `ComparisonAreaChart`) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Security & Auth**| JSON Web Tokens (JWT), Bcrypt password hashing, Multi-tenant scoping |
| **Email Service** | Nodemailer (SMTP / Gmail OTP verification) |

---

## 📁 Repository Structure

```
Authentication-main/
├── client/
│   └── vite-project/
│       ├── src/
│       │   ├── components/
│       │   │   ├── charts/         # LineChart, BarChart, DonutChart, ProgressRing, AllocationBar, ComparisonAreaChart
│       │   │   ├── common/         # Disclaimers, StateViews (Loading, Error, Empty)
│       │   │   ├── layout/         # AppLayout, Sidebar, Navbar
│       │   │   └── ProtectedRoute.jsx
│       │   ├── context/            # AuthContext.jsx
│       │   ├── pages/
│       │   │   ├── calculators/    # SIP, Step-Up SIP, EMI, FD, Goal Target
│       │   │   ├── loans/          # Loans Overview, Loan Finder, Compare Loans
│       │   │   ├── ActionPlan.jsx
│       │   │   ├── AIDecisionLab.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── FinancialHistory.jsx
│       │   │   ├── FinancialXRay.jsx
│       │   │   ├── FutureYou.jsx
│       │   │   ├── Goals.jsx
│       │   │   ├── GovernmentSchemes.jsx
│       │   │   ├── Home.jsx
│       │   │   ├── HypeCheck.jsx
│       │   │   ├── InvestmentEduPage.jsx
│       │   │   ├── InvestmentHub.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── MyNextMoney.jsx
│       │   │   ├── Onboarding.jsx
│       │   │   ├── RiskDNA.jsx
│       │   │   ├── SignUp.jsx
│       │   │   ├── StocksExplorer.jsx
│       │   │   └── WealthVault.jsx
│       │   ├── utils/              # apiClient.js
│       │   ├── App.jsx             # Route definitions
│       │   └── index.css           # Global tokens & glassmorphism system
│       ├── package.json
│       └── vite.config.js
├── server/
│   ├── config/                     # db.js (MongoDB Connection)
│   ├── controllers/                # Auth, Profile, Dashboard, Asset, Goal, X-Ray, ActionPlan, Investment, Calculator, Loan, Risk, Decision, NextMoney, Simulation, HypeCheck, Schemes, History
│   ├── middleware/                 # authMiddleware.js
│   ├── models/                     # User, FinancialProfile, Asset, Goal, Loan, RiskProfile, FinancialHistory
│   ├── routes/                     # authRoutes, profileRoutes, dashboardRoutes, assetRoutes, goalRoutes, xrayRoutes, actionPlanRoutes, investmentRoutes, calculatorRoutes, loanRoutes, riskRoutes, decisionRoutes, nextMoneyRoutes, simulationRoutes, hypeCheckRoutes, schemesRoutes, historyRoutes
│   ├── services/                   # historyService.js, marketDataService.js
│   ├── utils/                      # sipCalculator, stepUpSipCalculator, emiCalculator, fdCalculator, goalCalculator, apiResponse
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

---

### 1. Configure the Backend Server

Navigate to the `server/` directory:
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/wealthx
JWT_SECRET=your_super_secret_jwt_key_wealthx_2026
CLIENT_URL=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```
> The API will start on **`http://127.0.0.1:5000`**.

---

### 2. Configure the Frontend Client

In a new terminal, navigate to `client/vite-project/`:
```bash
cd client/vite-project
npm install
```

Start the Vite development server:
```bash
npm run dev
```
> The web application will launch on **`http://localhost:5173`**.

---

## 📡 Core API Endpoints

### 🔐 Authentication & Profile
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | No |
| `GET` | `/api/profile` | Retrieve user financial calibration | Yes |
| `POST` | `/api/profile` | Upsert financial profile | Yes |

### 🤖 Financial Intelligence & Decision Engines
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/risk-dna` | Retrieve Risk DNA & portfolio mismatch analysis | Yes |
| `POST` | `/api/risk-dna` | Submit 7-question Risk DNA assessment | Yes |
| `POST` | `/api/decision-lab/evaluate` | Evaluate financial questions with 6-pillar breakdown | Yes |
| `GET` | `/api/decision-lab/preset-questions` | Get curated decision topics | Yes |
| `POST` | `/api/next-money/allocate` | Calculate dynamic surplus distribution for ₹10k | Yes |
| `POST` | `/api/simulations/future-you` | Simulate 30-year Current vs Optimized trajectories | Yes |
| `POST` | `/api/hype-check/analyze` | 0–100 Hype Score assessment across 6 dimensions | Yes |
| `GET` | `/api/schemes` | Get India government schemes matched to profile | Yes |
| `GET` | `/api/history` | Chronological audit timeline & net worth trend | Yes |

### 📊 Dashboard & Diagnostics
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | 6-level metrics, net worth trend, health score | Yes |
| `GET` | `/api/financial-xray` | Multi-pillar financial diagnostics & insights | Yes |
| `GET` | `/api/action-plan` | Rule-prioritized action items | Yes |

---

## 🔒 Security & Compliance Standards

- **Tenant Isolation**: Every database write and read on Assets, Goals, Loans, RiskProfiles, and FinancialHistory is strictly scoped to `req.user.id` verified from the cryptographically signed JWT.
- **Server-Side Numeric Validation**: All amounts, interest rates, and tenures are strictly validated against non-negative boundary rules server-side.
- **Statutory Disclaimers**: Cautious, transparent disclosures rendered across all investment and lending views:
  > *"WealthX provides educational information and algorithmic calculations only. This should not be considered personalized financial or investment advice. Investments are subject to market risks."*
