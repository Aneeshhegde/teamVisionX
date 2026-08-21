import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { LoadingState, ErrorState, EmptyState } from "../components/common/StateViews";
import api from "../utils/apiClient";
import "./Dashboard.css";

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/dashboard");
      if (res && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || "Failed to load command center data");
      }
    } catch (err) {
      setError(err.message || "Error connecting to WealthX intelligence server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Aggregating financial metrics & intelligence feeds..." fullPage />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState
          title="Command Center Offline"
          message={error}
          onRetry={fetchDashboard}
        />
      </AppLayout>
    );
  }

  if (!data || !data.isOnboarded) {
    return (
      <AppLayout>
        <EmptyState
          icon="🚀"
          title="Financial Profile Pending Calibration"
          description="Complete the 2-minute onboarding to calculate your true net worth, emergency runway, and financial health score."
          actionText="Start 2-Minute Onboarding →"
          onAction={() => (window.location.href = "/onboarding")}
        />
      </AppLayout>
    );
  }

  const { metrics, profile, recentAlerts, user } = data;

  const getScoreColor = (score) => {
    if (score >= 80) return "teal";
    if (score >= 60) return "blue";
    if (score >= 40) return "amber";
    return "rose";
  };

  const scoreBadgeColor = getScoreColor(metrics.healthScore);

  return (
    <AppLayout disclaimerVariant="general">
      <div className="dashboard-view">
        {/* Top Welcome & Health Header */}
        <div className="dashboard-banner glass-panel">
          <div className="banner-left">
            <span className="welcome-tag">Command Center</span>
            <h1 className="welcome-name">Welcome back, {user?.name || "Investor"}</h1>
            <p className="welcome-sub">
              Your financial blueprint is active. Review your cashflow metrics, emergency runway, and recommended actions below.
            </p>
            <div className="dashboard-quick-actions">
              <Link to="/wealth-vault" className="btn btn-primary btn-quick-action">
                + Add Asset
              </Link>
              <Link to="/goals" className="btn btn-secondary btn-quick-action">
                + Create Goal
              </Link>
              <Link to="/action-plan" className="btn btn-secondary btn-quick-action">
                📋 Action Plan
              </Link>
            </div>
          </div>

          <div className="banner-right">
            <div className={`health-score-dial dial-${scoreBadgeColor}`}>
              <div className="score-number">{metrics.healthScore}</div>
              <div className="score-max">/100</div>
              <span className={`badge badge-${scoreBadgeColor} score-pill`}>
                {metrics.healthScore >= 75
                  ? "Resilient"
                  : metrics.healthScore >= 50
                  ? "Moderate Health"
                  : "Attention Needed"}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Metric Grid */}
        <div className="metrics-grid">
          {/* Net Worth */}
          <div className="metric-card glass-panel glow-hover">
            <div className="metric-header">
              <span className="metric-label">Estimated Net Worth</span>
              <span className="metric-icon">🏦</span>
            </div>
            <div className="metric-value currency">
              ₹{Number(metrics.netWorth || 0).toLocaleString("en-IN")}
            </div>
            <div className="metric-footer">
              <span className="text-teal">Assets: ₹{Number(metrics.totalAssets || 0).toLocaleString("en-IN")}</span>
              <span className="footer-sep">•</span>
              <span className="text-muted">Liabilities: ₹{Number(metrics.totalLiabilities || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Monthly Inflow */}
          <div className="metric-card glass-panel glow-hover">
            <div className="metric-header">
              <span className="metric-label">Monthly Income</span>
              <span className="metric-icon">💵</span>
            </div>
            <div className="metric-value currency text-teal">
              ₹{Number(metrics.monthlyIncome || 0).toLocaleString("en-IN")}
            </div>
            <div className="metric-footer">
              <span className="badge badge-blue">{profile?.employmentStatus?.replace("_", " ") || "Salaried"}</span>
              <span className="text-muted">In-hand post tax</span>
            </div>
          </div>

          {/* Monthly Burn Rate */}
          <div className="metric-card glass-panel glow-hover">
            <div className="metric-header">
              <span className="metric-label">Monthly Outflows</span>
              <span className="metric-icon">📉</span>
            </div>
            <div className="metric-value currency text-rose">
              ₹{Number(metrics.monthlyExpenses || 0).toLocaleString("en-IN")}
            </div>
            <div className="metric-footer">
              <span className={metrics.expenseRatio > 70 ? "text-rose" : "text-teal"}>
                {metrics.expenseRatio}% of income
              </span>
              <span className="footer-sep">•</span>
              <span className="text-muted">Surplus: ₹{Number(metrics.monthlySurplus || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Emergency Runway */}
          <div className="metric-card glass-panel glow-hover">
            <div className="metric-header">
              <span className="metric-label">Emergency Runway</span>
              <span className="metric-icon">🛡️</span>
            </div>
            <div className="metric-value">
              {metrics.emergencyFundMonths} <span className="value-unit">Months</span>
            </div>
            <div className="metric-footer">
              <span className={metrics.emergencyFundMonths >= 6 ? "text-teal" : metrics.emergencyFundMonths >= 3 ? "text-amber" : "text-rose"}>
                {metrics.emergencyFundMonths >= 6 ? "Well Protected" : metrics.emergencyFundMonths >= 3 ? "Adequate (3-6m target)" : "Critically Low (<3m)"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Center & Intelligent Alerts */}
        <div className="dashboard-two-column">
          {/* Left Column: Intelligent Alerts & Status */}
          <div className="column-left">
            <div className="section-card glass-panel">
              <div className="section-card-header">
                <h3>⚡ Intelligent Financial Diagnostics</h3>
                <span className="badge badge-blue">Real-time</span>
              </div>

              <div className="alerts-list">
                {recentAlerts && recentAlerts.length > 0 ? (
                  recentAlerts.map((alert) => (
                    <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                      <div className="alert-badge-icon">
                        {alert.type === "warning" ? "⚠️" : alert.type === "success" ? "✅" : "ℹ️"}
                      </div>
                      <div className="alert-body">
                        <h4>{alert.title}</h4>
                        <p>{alert.message}</p>
                        {alert.link && (
                          <Link to={alert.link} className="alert-action-link">
                            Take Action &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-alerts text-muted">All financial health indicators are within optimal bounds.</p>
                )}
              </div>
            </div>

            {/* Savings & Cashflow Ratio Visualization */}
            <div className="section-card glass-panel">
              <div className="section-card-header">
                <h3>📊 Cashflow Allocation Breakdown</h3>
              </div>
              <div className="cashflow-bars">
                <div className="bar-label-group">
                  <span>Expenses Burn Rate ({metrics.expenseRatio}%)</span>
                  <span className="currency">₹{Number(metrics.monthlyExpenses || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill fill-rose"
                    style={{ width: `${Math.min(metrics.expenseRatio, 100)}%` }}
                  ></div>
                </div>

                <div className="bar-label-group" style={{ marginTop: "16px" }}>
                  <span>Monthly Savings Surplus ({metrics.savingsRate}%)</span>
                  <span className="currency">₹{Number(metrics.monthlySurplus || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill fill-teal"
                    style={{ width: `${Math.min(metrics.savingsRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Intelligence Launchpad */}
          <div className="column-right">
            <div className="section-card glass-panel">
              <div className="section-card-header">
                <h3>🧭 WealthX Decision Lab & Tools</h3>
              </div>

              <div className="launchpad-grid">
                <Link to="/wealth-vault" className="launchpad-card">
                  <div className="launchpad-icon">🏦</div>
                  <div className="launchpad-details">
                    <h4>Wealth Vault</h4>
                    <p>Track stocks, mutual funds, gold, FDs, and assets.</p>
                  </div>
                </Link>

                <Link to="/financial-xray" className="launchpad-card">
                  <div className="launchpad-icon">🔬</div>
                  <div className="launchpad-details">
                    <h4>Financial X-Ray</h4>
                    <p>Deep-dive liquidity, debt-to-income & stress tests.</p>
                  </div>
                </Link>

                <Link to="/ai-decision-lab" className="launchpad-card launchpad-highlight">
                  <div className="launchpad-icon">🤖</div>
                  <div className="launchpad-details">
                    <h4>AI Decision Lab</h4>
                    <p>Simulate financial questions with structured AI guardrails.</p>
                  </div>
                </Link>

                <Link to="/calculators/sip" className="launchpad-card">
                  <div className="launchpad-icon">📈</div>
                  <div className="launchpad-details">
                    <h4>SIP & Compounding</h4>
                    <p>Simulate wealth growth with Step-Up SIP calculator.</p>
                  </div>
                </Link>

                <Link to="/loans/debt-health" className="launchpad-card">
                  <div className="launchpad-icon">💳</div>
                  <div className="launchpad-details">
                    <h4>Loan & EMI Health</h4>
                    <p>Analyze debt burden and accelerated payoff schedules.</p>
                  </div>
                </Link>

                <Link to="/schemes" className="launchpad-card">
                  <div className="launchpad-icon">🏛️</div>
                  <div className="launchpad-details">
                    <h4>Govt Schemes Finder</h4>
                    <p>Discover eligible central and state welfare initiatives.</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;