import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProgressRing from "../components/charts/ProgressRing";
import DonutChart from "../components/charts/DonutChart";
import AllocationBar from "../components/charts/AllocationBar";
import { LoadingState, ErrorState } from "../components/common/StateViews";
import api from "../utils/apiClient";
import "./RiskDNA.css";

const ASSESSMENT_QUESTIONS = [
  {
    id: "ageGroup",
    question: "What is your current age bracket?",
    subtitle: "Age informs your natural compounding horizon and career earnings runway.",
    options: [
      { value: "<25", label: "Under 25 Years", desc: "Long runway for compounding" },
      { value: "25-35", label: "25 – 35 Years", desc: "Prime wealth accumulation phase" },
      { value: "36-45", label: "36 – 45 Years", desc: "Peak earning & family commitments" },
      { value: "46-55", label: "46 – 55 Years", desc: "Consolidation & pre-retirement" },
      { value: ">55", label: "Above 55 Years", desc: "Capital preservation & pension" },
    ],
  },
  {
    id: "incomeStability",
    question: "How would you characterize your income stability and dependents?",
    subtitle: "Evaluates cashflow resilience and financial obligations.",
    options: [
      { value: "very_stable_few_deps", label: "Highly Stable (0–1 Dependents)", desc: "Corporate / PSU salary with low fixed obligations" },
      { value: "stable_moderate_deps", label: "Stable (2–3 Dependents)", desc: "Consistent income with regular household expenses" },
      { value: "variable_freelance", label: "Variable / Commission / Freelance", desc: "High earning potential but fluctuating monthly cashflow" },
      { value: "unpredictable", label: "Early-Stage Business / Unpredictable", desc: "Income varies significantly month-to-month" },
    ],
  },
  {
    id: "emergencyBuffer",
    question: "How many months of living expenses are in liquid cash or savings?",
    subtitle: "A strong emergency buffer enables you to take calculated investment risk.",
    options: [
      { value: ">6_months", label: "Over 6 Months of Expenses", desc: "Fully fortified liquid defense" },
      { value: "3-6_months", label: "3 to 6 Months of Expenses", desc: "Adequate standard safety cushion" },
      { value: "1-3_months", label: "1 to 3 Months of Expenses", desc: "Developing emergency reserve" },
      { value: "<1_month", label: "Less than 1 Month", desc: "Urgent liquidity vulnerability" },
    ],
  },
  {
    id: "timeHorizon",
    question: "What is your primary investment time horizon before needing the funds?",
    subtitle: "Longer durations allow equity volatility to smooth into exponential compounding.",
    options: [
      { value: ">10_years", label: "10+ Years (Decade Scale)", desc: "Can comfortably withstand cyclical market crashes" },
      { value: "5-10_years", label: "5 to 10 Years", desc: "Balanced medium-to-long term horizon" },
      { value: "3-5_years", label: "3 to 5 Years", desc: "Medium term goals" },
      { value: "1-3_years", label: "1 to 3 Years", desc: "Short term horizon requiring stability" },
      { value: "<1_year", label: "Less than 1 Year", desc: "Immediate liquidity needed" },
    ],
  },
  {
    id: "marketReaction",
    question: "If your portfolio dropped 20% in a market correction, how would you react?",
    subtitle: "Measures your psychological risk tolerance under emotional pressure.",
    options: [
      { value: "buy_aggressively", label: "Buy More Aggressively", desc: "View discounts as historic buying opportunities" },
      { value: "hold_patiently", label: "Hold Patiently & Do Nothing", desc: "Understand that drawdowns are standard market behavior" },
      { value: "reduce_slightly", label: "Feel Anxious & Pause Contributions", desc: "Prefer lower volatility to sleep peacefully" },
      { value: "panic_sell_all", label: "Exit / Panic Sell to Cash", desc: "Cannot tolerate seeing paper losses" },
    ],
  },
  {
    id: "primaryGoal",
    question: "What is your overarching primary financial objective?",
    subtitle: "Aligns your asset strategy with your personal definition of wealth.",
    options: [
      { value: "aggressive_wealth", label: "Aggressive Wealth Creation", desc: "Maximize capital growth and future net worth" },
      { value: "balanced_growth", label: "Balanced Compounding", desc: "Steady growth beating inflation with moderate safety" },
      { value: "capital_preservation", label: "Capital Preservation", desc: "Protect accumulated principal at all costs" },
      { value: "income_generation", label: "Regular Cashflow & Dividends", desc: "Generate predictable passive monthly income" },
    ],
  },
  {
    id: "investmentExperience",
    question: "What is your prior experience with investment assets?",
    subtitle: "Familiarity with market dynamics reduces panic during volatile phases.",
    options: [
      { value: "advanced_stocks_derivatives", label: "Advanced (Direct Equities, ETFs, Mutual Funds)", desc: "Have navigated past bear markets" },
      { value: "intermediate_mutual_funds", label: "Intermediate (Mutual Funds, SIPs, Gold)", desc: "Comfortable with passive fund investing" },
      { value: "beginner_fd_gold", label: "Beginner (FDs, Savings, Physical Gold)", desc: "Primarily used traditional guaranteed vehicles" },
      { value: "none", label: "New to Investing", desc: "Starting financial journey from scratch" },
    ],
  },
];

export const RiskDNA = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assessment Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchRiskDNA = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/risk-dna");
      if (res && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || "Failed to load Risk DNA profile.");
      }
    } catch (err) {
      setError(err.message || "Error connecting to Risk Profiling engine.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskDNA();
  }, [fetchRiskDNA]);

  const handleSelectOption = (questionId, optionValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionValue }));
  };

  const handleNextStep = () => {
    if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    setSubmitting(true);
    try {
      await api.post("/api/risk-dna", { answers });
      setIsWizardOpen(false);
      fetchRiskDNA();
    } catch (err) {
      alert(err.message || "Failed to calculate Risk DNA.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Calibrating psychological risk tolerance & asset capacity..." fullPage />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState title="Risk DNA Engine Offline" message={error} onRetry={fetchRiskDNA} />
      </AppLayout>
    );
  }

  const riskProfile = data?.riskProfile || {};
  const actual = data?.actualAllocation || {};
  const recommended = data?.recommendedAllocation || { equityPct: 55, debtPct: 25, goldPct: 10, cashPct: 10 };
  const mismatches = data?.mismatches || [];

  const getRiskScoreColor = (score) => {
    if (score >= 80) return "#8b5cf6"; // Purple (Aggressive)
    if (score >= 60) return "#3b82f6"; // Blue (Growth)
    if (score >= 45) return "#06b6d4"; // Cyan (Moderate Growth)
    if (score >= 25) return "#10b981"; // Teal (Moderate)
    return "#f59e0b"; // Amber (Conservative)
  };

  const scoreColor = getRiskScoreColor(riskProfile.riskScore);

  const recommendedSlices = [
    { label: "Equity (Growth)", percentage: recommended.equityPct, amount: Math.round((actual.totalPortfolio || 100000) * (recommended.equityPct / 100)), color: "#3b82f6" },
    { label: "Debt / Fixed Income", percentage: recommended.debtPct, amount: Math.round((actual.totalPortfolio || 100000) * (recommended.debtPct / 100)), color: "#8b5cf6" },
    { label: "Gold (Hedge)", percentage: recommended.goldPct, amount: Math.round((actual.totalPortfolio || 100000) * (recommended.goldPct / 100)), color: "#f59e0b" },
    { label: "Liquid Cash", percentage: recommended.cashPct, amount: Math.round((actual.totalPortfolio || 100000) * (recommended.cashPct / 100)), color: "#10b981" },
  ];

  const actualSlices = [
    { label: "Actual Equity", percentage: actual.equityPct || 0, amount: actual.equityTotal || 0, color: "#3b82f6" },
    { label: "Actual Debt", percentage: actual.debtPct || 0, amount: actual.debtTotal || 0, color: "#8b5cf6" },
    { label: "Actual Gold", percentage: actual.goldPct || 0, amount: actual.goldTotal || 0, color: "#f59e0b" },
    { label: "Actual Cash", percentage: actual.cashPct || 0, amount: actual.cashTotal || 0, color: "#10b981" },
  ];

  const currentQ = ASSESSMENT_QUESTIONS[currentStep];
  const isCurrentAnswered = !!answers[currentQ?.id];

  return (
    <AppLayout disclaimerVariant="general">
      <div className="risk-dna-view">
        {/* Header */}
        <div className="risk-header-row">
          <div>
            <div className="breadcrumb-pill">
              <span className="live-dot"></span>
              <span>PERSONALIZED BEHAVIORAL PROFILE</span>
            </div>
            <h1 className="risk-title">Your Risk DNA</h1>
            <p className="risk-sub">
              A quantified evaluation of your financial risk capacity, emotional drawdown tolerance, and algorithmic target asset allocation.
            </p>
          </div>
          <div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setCurrentStep(0);
                setIsWizardOpen(true);
              }}
            >
              🧬 {riskProfile.isAssessed === false ? "Take Risk Assessment" : "Retake Assessment"}
            </button>
          </div>
        </div>

        {/* Level 1: Risk DNA Core Card */}
        <div className="risk-hero-card glass-panel glow-hover">
          <div className="risk-hero-left">
            <ProgressRing
              score={riskProfile.riskScore}
              size={130}
              strokeWidth={10}
              color={scoreColor}
              label="/ 100 Score"
            />
            <div className="risk-hero-title-box">
              <span className="welcome-tag" style={{ color: scoreColor }}>
                Quantified Risk Posture
              </span>
              <h2 className="risk-category-name">{riskProfile.categoryLabel}</h2>
              <p className="risk-category-desc">
                Calculated based on your {riskProfile.investmentHorizonYears}-year investment horizon, income stability, and {riskProfile.riskTolerance?.toLowerCase()} volatility tolerance.
              </p>
            </div>
          </div>

          <div className="risk-hero-stats-grid">
            <div className="risk-stat-item">
              <span className="stat-box-label">Risk Tolerance</span>
              <span className="stat-box-val font-bold" style={{ color: scoreColor }}>
                {riskProfile.riskTolerance}
              </span>
            </div>
            <div className="risk-stat-item">
              <span className="stat-box-label">Risk Capacity</span>
              <span className="stat-box-val font-bold text-teal">
                {riskProfile.riskCapacity}
              </span>
            </div>
            <div className="risk-stat-item">
              <span className="stat-box-label">Time Horizon</span>
              <span className="stat-box-val font-bold text-cyan">
                {riskProfile.investmentHorizonYears} Years
              </span>
            </div>
          </div>
        </div>

        {/* Level 2: Portfolio vs Risk DNA Mismatch Analysis */}
        <div className="section-card glass-panel">
          <div className="section-card-header">
            <h3>⚖️ Recommended Allocation vs. Your Current Portfolio</h3>
            <Link to="/wealth-vault" className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>
              Manage Vault Assets &rarr;
            </Link>
          </div>

          <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
            Comparing your actual tracked assets in Wealth Vault against your Risk DNA target allocation:
          </p>

          {/* Allocation Comparison Visualizer */}
          <div className="allocation-compare-container">
            {/* Target */}
            <div className="allocation-side-box">
              <div className="allocation-side-header">
                <span className="font-bold text-teal">🎯 Target Risk DNA Allocation</span>
                <span className="badge badge-green">Recommended</span>
              </div>
              <AllocationBar slices={recommendedSlices} total={actual.totalPortfolio || 100000} showCards={true} />
            </div>

            {/* Actual */}
            <div className="allocation-side-box">
              <div className="allocation-side-header">
                <span className="font-bold text-cyan">🏦 Your Actual Portfolio Holdings</span>
                <span className="badge badge-blue">Wealth Vault</span>
              </div>
              <AllocationBar slices={actualSlices} total={actual.totalPortfolio || 100000} showCards={true} />
            </div>
          </div>

          {/* Mismatch Insights Feed */}
          <div className="mismatches-feed">
            {mismatches.map((m, idx) => (
              <div key={idx} className={`mismatch-card mismatch-${m.severity}`}>
                <div className="mismatch-header">
                  <span className="mismatch-icon">
                    {m.severity === "good" ? "✅" : m.severity === "warning" ? "⚠️" : "💡"}
                  </span>
                  <div>
                    <h4 className="mismatch-title">{m.title}</h4>
                    <p className="mismatch-msg">{m.message}</p>
                    {m.recommendation && (
                      <div className="mismatch-action">
                        <strong>Actionable Step:</strong> {m.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Wizard Modal */}
        {isWizardOpen && (
          <div className="modal-backdrop" onClick={() => setIsWizardOpen(false)}>
            <div className="modal-card wizard-card glass-panel" onClick={(e) => e.stopPropagation()}>
              <div className="wizard-progress-header">
                <div className="wizard-progress-track">
                  <div
                    className="wizard-progress-fill"
                    style={{
                      width: `${((currentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="wizard-step-counter">
                  Question {currentStep + 1} of {ASSESSMENT_QUESTIONS.length}
                </div>
              </div>

              <div className="wizard-question-box">
                <h3 className="wizard-q-title">{currentQ.question}</h3>
                <p className="wizard-q-sub">{currentQ.subtitle}</p>

                <div className="wizard-options-list">
                  {currentQ.options.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.value;
                    return (
                      <div
                        key={opt.value}
                        className={`wizard-opt-item ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectOption(currentQ.id, opt.value)}
                      >
                        <div className="wizard-radio-circle">
                          {isSelected && <span className="wizard-radio-dot" />}
                        </div>
                        <div>
                          <div className="wizard-opt-label">{opt.label}</div>
                          <div className="wizard-opt-desc">{opt.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="wizard-actions-bar">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0 || submitting}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNextStep}
                  disabled={!isCurrentAnswered || submitting}
                >
                  {submitting
                    ? "Calculating Risk DNA..."
                    : currentStep === ASSESSMENT_QUESTIONS.length - 1
                    ? "Complete & Calculate DNA →"
                    : "Next Question →"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default RiskDNA;
