import React from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import "./InvestmentHub.css";

const INVESTMENT_CATEGORIES = [
  {
    path: "/investments/stocks",
    icon: "⚡",
    title: "Stocks Explorer",
    subtitle: "Direct Equity Ownership",
    description: "Search Indian blue-chip stocks, inspect valuation ratios (P/E, Market Cap), and analyze historical trends.",
    badge: "Interactive Explorer",
    badgeColor: "badge-blue",
    risk: "High Risk",
  },
  {
    path: "/investments/sip",
    icon: "🌱",
    title: "SIP & Mutual Funds",
    subtitle: "Disciplined Compounding",
    description: "Learn how systematic rupee-cost averaging and professionally managed mutual funds build multi-year wealth.",
    badge: "Most Popular",
    badgeColor: "badge-green",
    risk: "Moderate to High",
  },
  {
    path: "/investments/gold",
    icon: "🥇",
    title: "Digital Gold & SGB",
    subtitle: "Inflation & Crisis Hedge",
    description: "Discover the mechanics of Sovereign Gold Bonds (2.5% p.a. interest) and 24K digital gold storage.",
    badge: "Safe Haven",
    badgeColor: "badge-amber",
    risk: "Low to Moderate",
  },
  {
    path: "/investments/fd",
    icon: "🔒",
    title: "Fixed Deposits (FD)",
    subtitle: "Guaranteed Term Yield",
    description: "Understand DICGC bank deposit insurance (₹5 Lakhs), compounding frequencies, and tax implications.",
    badge: "Capital Guaranteed",
    badgeColor: "badge-blue",
    risk: "Very Low",
  },
  {
    path: "/investments/bonds",
    icon: "🏛️",
    title: "Government Bonds",
    subtitle: "Sovereign Debt Papers",
    description: "Analyze G-Secs, Treasury Bills, and State Development Loans with zero credit default risk.",
    badge: "Sovereign Backed",
    badgeColor: "badge-blue",
    risk: "Lowest Default Risk",
  },
  {
    path: "/investments/etfs",
    icon: "🌐",
    title: "Index & ETFs",
    subtitle: "Passive Market Replication",
    description: "Explore low-cost index funds and ETFs tracking benchmark indices like Nifty 50 and BSE Sensex.",
    badge: "Ultra Low Cost",
    badgeColor: "badge-green",
    risk: "Market Linked",
  },
];

export const InvestmentHub = () => {
  return (
    <AppLayout disclaimerVariant="investment">
      <div className="investment-hub-view">
        {/* Header */}
        <div className="hub-header-banner glass-panel">
          <div className="banner-left">
            <span className="welcome-tag">Asset Class Intelligence</span>
            <h1 className="welcome-name">Investment Hub</h1>
            <p className="welcome-sub">
              Master the foundational mechanics of diverse asset classes. Learn risk-return trade-offs, liquidity windows, tax treatments, and long-term wealth compounding strategies.
            </p>
          </div>
          <div className="banner-right">
            <Link to="/wealth-vault" className="btn btn-primary">
              <span>View Your Wealth Vault &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="investment-grid">
          {INVESTMENT_CATEGORIES.map((cat) => (
            <Link key={cat.path} to={cat.path} className="investment-category-card glass-panel glow-hover">
              <div className="category-top">
                <div className="category-icon">{cat.icon}</div>
                <div className="category-badges">
                  <span className={`badge ${cat.badgeColor}`}>{cat.badge}</span>
                  <span className="risk-tag">{cat.risk}</span>
                </div>
              </div>

              <div className="category-info">
                <h3 className="category-title">{cat.title}</h3>
                <span className="category-subtitle">{cat.subtitle}</span>
                <p className="category-desc">{cat.description}</p>
              </div>

              <div className="category-footer">
                <span className="explore-link">Explore Guide & Analytics &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default InvestmentHub;
