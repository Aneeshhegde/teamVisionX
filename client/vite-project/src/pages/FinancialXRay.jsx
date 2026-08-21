import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { LoadingState, ErrorState } from "../components/common/StateViews";
import api from "../utils/apiClient";
import "./FinancialXRay.css";

export const FinancialXRay = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchXRay = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/financial-xray");
      if (res && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || "Failed to load financial X-ray diagnostics.");
      }
    } catch (err) {
      setError(err.message || "Error connecting to financial diagnostics service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchXRay();
  }, [fetchXRay]);

  if (loading) {
    return (
      <AppLayout disclaimerVariant="general">
        <LoadingState message="Conducting algorithmic financial stress-tests & concentration audits..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout disclaimerVariant="general">
        <ErrorState
          title="Diagnostics Offline"
          message={error}
          onRetry={fetchXRay}
        />
      </AppLayout>
    );
  }

  const { income, emergencyFund, debtHealth, investmentHealth, goalHealth, insights } = data;

  const getEmergencyBadge = (status) => {
    if (status === "strong") return { label: "Strong (>6 Mos)", class: "badge-green" };
    if (status === "developing") return { label: "Developing (3-6 Mos)", class: "badge-amber" };
    return { label: "Needs Attention (<3 Mos)", class: "badge-rose" };
  };

  const emgBadge = getEmergencyBadge(emergencyFund.status);

  return (
    <AppLayout disclaimerVariant="general">
      <div className="xray-view">
        {/* Header */}
        <div className="xray-header-row">
          <div>
            <div className="breadcrumb-pill">
              <span className="live-dot"></span>
              <span>ALGORITHMIC HEALTH AUDIT</span>
            </div>
            <h1 className="xray-title">Financial X-Ray</h1>
            <p className="xray-sub">
              Multi-dimensional diagnostic evaluation of your cashflow ratios, emergency liquidity runway, portfolio concentration risks, and milestone pacing.
            </p>
          </div>
          <Link to="/action-plan" className="btn btn-primary">
            <span>View Prioritized Action Plan &rarr;</span>
          </Link>
        </div>

        {/* Diagnostic Pillars Grid */}
        <div className="xray-grid">
          {/* Pillar 1: Cashflow & Burn Rate */}
          <div className="diagnostic-card glass-panel glow-hover">
            <div className="card-top">
              <div className="card-icon-box">💵</div>
              <div className="card-badge-wrap">
                <span
                  className={`badge ${
                    income.expenseRatio <= 50
                      ? "badge-green"
                      : income.expenseRatio <= 70
                      ? "badge-blue"
                      : "badge-rose"
                  }`}
                >
                  {income.expenseRatio}% Burn Rate
                </span>
              </div>
            </div>

            <h3 className="diagnostic-title">Income & Cashflow Dynamics</h3>
            <p className="diagnostic-desc">
              Evaluates monthly take-home surplus against recurring essential and lifestyle expenses.
            </p>

            <div className="diagnostic-metrics-list">
              <div className="diag-metric-row">
                <span>Monthly Inflow</span>
                <span className="currency font-bold text-teal">
                  ₹{Number(income.monthlyIncome || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="diag-metric-row">
                <span>Monthly Outflows</span>
                <span className="currency font-bold text-rose">
                  ₹{Number(income.monthlyExpenses || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="diag-metric-row highlight">
                <span>Net Monthly Surplus</span>
                <span className="currency font-bold text-cyan">
                  ₹{Number(income.cashFlow || 0).toLocaleString("en-IN")} ({income.savingsRate}%)
                </span>
              </div>
            </div>

            <div className="card-action-footer">
              <Link to="/onboarding" className="action-arrow-link">
                Update Income Calibration &rarr;
              </Link>
            </div>
          </div>

          {/* Pillar 2: Emergency Runway */}
          <div className="diagnostic-card glass-panel glow-hover">
            <div className="card-top">
              <div className="card-icon-box">🛡️</div>
              <div className="card-badge-wrap">
                <span className={`badge ${emgBadge.class}`}>{emgBadge.label}</span>
              </div>
            </div>

            <h3 className="diagnostic-title">Emergency Liquidity Runway</h3>
            <p className="diagnostic-desc">
              Measures how many months of necessary living expenses your tracked liquid savings can support.
            </p>

            <div className="diagnostic-metrics-list">
              <div className="diag-metric-row">
                <span>Current Liquid Buffer</span>
                <span className="currency font-bold">
                  ₹{Number(emergencyFund.currentSavings || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="diag-metric-row">
                <span>Calculated Runway</span>
                <span className="font-bold text-cyan">
                  {emergencyFund.months} Months
                </span>
              </div>
              <div className="diag-metric-row highlight">
                <span>Recommended 6-Mo Reserve</span>
                <span className="currency font-bold">
                  ₹{Number(emergencyFund.targetAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="card-action-footer">
              <Link to="/wealth-vault" className="action-arrow-link">
                Review Liquid Reserves &rarr;
              </Link>
            </div>
          </div>

          {/* Pillar 3: Investment Diversification */}
          <div className="diagnostic-card glass-panel glow-hover">
            <div className="card-top">
              <div className="card-icon-box">📊</div>
              <div className="card-badge-wrap">
                {investmentHealth.concentrationWarning ? (
                  <span className="badge badge-rose">⚠️ High Concentration</span>
                ) : investmentHealth.categoriesUsed >= 3 ? (
                  <span className="badge badge-green">✓ Diversified</span>
                ) : (
                  <span className="badge badge-blue">Developing</span>
                )}
              </div>
            </div>

            <h3 className="diagnostic-title">Portfolio Diversification</h3>
            <p className="diagnostic-desc">
              Checks asset spread across asset classes (stocks, mutual funds, gold, fixed deposits, bonds).
            </p>

            <div className="diagnostic-metrics-list">
              <div className="diag-metric-row">
                <span>Active Asset Classes</span>
                <span className="font-bold">{investmentHealth.categoriesUsed} Classes</span>
              </div>
              <div className="diag-metric-row">
                <span>Total Vault Valuation</span>
                <span className="currency font-bold text-teal">
                  ₹{Number(investmentHealth.currentValue || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="diag-metric-row highlight">
                <span>Unrealized Net P&L</span>
                <span
                  className={`currency font-bold ${
                    investmentHealth.unrealizedGainLoss >= 0 ? "text-teal" : "text-rose"
                  }`}
                >
                  {investmentHealth.unrealizedGainLoss >= 0 ? "+" : ""}
                  ₹{Number(investmentHealth.unrealizedGainLoss || 0).toLocaleString("en-IN")} (
                  {investmentHealth.unrealizedGainLossPct}%)
                </span>
              </div>
            </div>

            <div className="card-action-footer">
              <Link to="/wealth-vault" className="action-arrow-link">
                Inspect Asset Breakdown &rarr;
              </Link>
            </div>
          </div>

          {/* Pillar 4: Debt & Liability Health */}
          <div className="diagnostic-card glass-panel glow-hover">
            <div className="card-top">
              <div className="card-icon-box">💳</div>
              <div className="card-badge-wrap">
                <span className="badge badge-blue">Phase 2 Planned</span>
              </div>
            </div>

            <h3 className="diagnostic-title">Debt-to-Income (DTI) & Liabilities</h3>
            <p className="diagnostic-desc">
              Calculates debt-service ratio, EMI obligations, and interest burden relative to net earnings.
            </p>

            <div className="debt-inactive-box">
              <div className="inactive-icon">🔒</div>
              <p className="inactive-text">{debtHealth.note}</p>
            </div>

            <div className="card-action-footer">
              <span className="text-muted" style={{ fontSize: "12px" }}>
                Loans module releasing in upcoming release
              </span>
            </div>
          </div>
        </div>

        {/* Milestone Health Overview */}
        <div className="section-card glass-panel">
          <div className="section-card-header">
            <h3>🎯 Goal Milestone Health & Pacing</h3>
            <Link to="/goals" className="action-arrow-link">
              Manage Goals &rarr;
            </Link>
          </div>

          {goalHealth.length === 0 ? (
            <p className="text-muted">
              No financial goals configured yet. Define goals to evaluate deadline pacing.
            </p>
          ) : (
            <div className="goals-mini-grid">
              {goalHealth.map((g) => (
                <div key={g.id} className="goal-mini-item">
                  <div className="goal-mini-header">
                    <span className="font-bold">{g.title}</span>
                    <span
                      className={`badge ${
                        g.status === "completed"
                          ? "badge-green"
                          : g.status === "behind_schedule"
                          ? "badge-rose"
                          : g.status === "needs_attention"
                          ? "badge-amber"
                          : "badge-blue"
                      }`}
                    >
                      {g.statusLabel}
                    </span>
                  </div>
                  <div className="goal-mini-progress">
                    <div
                      className="goal-mini-fill"
                      style={{ width: `${Math.min(g.progressPct, 100)}%` }}
                    />
                  </div>
                  <div className="goal-mini-footer">
                    <span className="text-muted">
                      ₹{Number(g.currentAmount).toLocaleString("en-IN")} / ₹
                      {Number(g.targetAmount).toLocaleString("en-IN")}
                    </span>
                    <span className="font-bold text-cyan">{g.progressPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Objective Diagnostic Observations */}
        <div className="section-card glass-panel">
          <div className="section-card-header">
            <h3>🔬 Algorithmic Diagnostics & Observations</h3>
            <span className="badge badge-blue">Non-Judgmental Audit</span>
          </div>

          <div className="observations-list">
            {insights && insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className="observation-item">
                  <span className="obs-bullet">✦</span>
                  <p className="obs-text">{insight}</p>
                </div>
              ))
            ) : (
              <p className="text-muted">No specific diagnostic observations at this time.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FinancialXRay;
