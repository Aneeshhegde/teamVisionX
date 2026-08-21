import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";
import api from "../utils/apiClient";
import Disclaimer from "../components/common/Disclaimer";
import { LoadingState } from "../components/common/StateViews";
import "./Onboarding.css";

export const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    employmentStatus: "salaried",
    monthlyIncome: "",
    monthlyExpenses: "",
    currentSavings: "",
    investmentExperience: ["mutual_fund"],
    riskProfile: "moderate",
    primaryGoals: ["wealth_creation", "emergency_fund"],
    dependentsCount: 0,
    emergencyFundTargetMonths: 6,
  });

  // Fetch current financial profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await api.get("/api/profile");
        if (res && res.data && res.data.profile) {
          const p = res.data.profile;
          setFormData({
            employmentStatus: p.employmentStatus || "salaried",
            monthlyIncome: p.monthlyIncome ?? "",
            monthlyExpenses: p.monthlyExpenses ?? "",
            currentSavings: p.currentSavings ?? "",
            investmentExperience: Array.isArray(p.investmentExperience) && p.investmentExperience.length > 0
              ? p.investmentExperience
              : ["mutual_fund"],
            riskProfile: p.riskProfile || "moderate",
            primaryGoals: Array.isArray(p.primaryGoals) && p.primaryGoals.length > 0
              ? p.primaryGoals
              : ["wealth_creation", "emergency_fund"],
            dependentsCount: p.dependentsCount ?? 0,
            emergencyFundTargetMonths: p.emergencyFundTargetMonths ?? 6,
          });
          setHasExistingProfile(true);
          setIsEditing(false);
        } else {
          setHasExistingProfile(false);
          setIsEditing(true);
        }
      } catch (err) {
        console.warn("No existing profile found:", err.message);
        setHasExistingProfile(false);
        setIsEditing(true);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickAdd = (fieldName, amount) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: Math.max(0, (Number(prev[fieldName]) || 0) + amount),
    }));
  };

  const toggleArrayItem = (fieldName, item) => {
    setFormData((prev) => {
      const current = prev[fieldName] || [];
      const exists = current.includes(item);
      return {
        ...prev,
        [fieldName]: exists ? current.filter((x) => x !== item) : [...current, item],
      };
    });
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!formData.monthlyIncome || Number(formData.monthlyIncome) <= 0) {
        setError("Please enter a valid monthly income (in ₹)");
        return;
      }
    }
    if (step === 2) {
      if (formData.monthlyExpenses === "" || Number(formData.monthlyExpenses) < 0) {
        setError("Please enter your estimated monthly expenses");
        return;
      }
      if (Number(formData.monthlyExpenses) > Number(formData.monthlyIncome)) {
        setError("Monthly expenses cannot exceed your total income");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        employmentStatus: formData.employmentStatus,
        monthlyIncome: Number(formData.monthlyIncome),
        monthlyExpenses: Number(formData.monthlyExpenses),
        currentSavings: Number(formData.currentSavings) || 0,
        investmentExperience: formData.investmentExperience,
        riskProfile: formData.riskProfile,
        primaryGoals: formData.primaryGoals,
        dependentsCount: Number(formData.dependentsCount) || 0,
        emergencyFundTargetMonths: Number(formData.emergencyFundTargetMonths) || 6,
      };

      const response = await api.post("/api/profile", payload);
      if (response.success) {
        if (refreshUser) {
          await refreshUser();
        }
        setHasExistingProfile(true);
        setIsEditing(false);
        setSuccessMsg("Financial profile calibrated and saved successfully!");
        setTimeout(() => {
          setSuccessMsg("");
        }, 4000);
      } else {
        throw new Error(response.message || "Failed to save profile");
      }
    } catch (err) {
      setError(err.message || "An error occurred while saving your financial profile.");
    } finally {
      setLoading(false);
    }
  };

  const goalOptions = [
    { id: "emergency_fund", label: "🛡️ Emergency Fund", desc: "6 months safety cushion for unexpected events" },
    { id: "wealth_creation", label: "📈 Long-term Wealth", desc: "Compounding via equity, index funds & SIPs" },
    { id: "buy_home", label: "🏠 Buying a Home", desc: "Down payment planning and debt capacity" },
    { id: "retirement", label: "🌅 Early Retirement", desc: "Financial independence & F.I.R.E milestone" },
    { id: "debt_freedom", label: "💳 Debt Freedom", desc: "Accelerated loan prepayment & debt payoff" },
    { id: "child_education", label: "🎓 Higher Education", desc: "Dedicated growth fund for future tuition" },
  ];

  const experienceOptions = [
    { id: "savings_fd", label: "Fixed Deposits & Savings" },
    { id: "mutual_fund", label: "Mutual Funds & SIPs" },
    { id: "direct_stocks", label: "Direct Indian Stocks (NSE/BSE)" },
    { id: "gold_real_estate", label: "Digital Gold & Real Estate" },
    { id: "crypto_derivatives", label: "Government Bonds & PPF" },
  ];

  const employmentLabels = {
    salaried: "Salaried Professional",
    self_employed: "Self-Employed / Freelancer",
    business: "Business Owner / Entrepreneur",
    student: "Student / Early Career",
    retired: "Retired / Pensioner",
    other: "Other / Homemaker",
  };

  const riskLabels = {
    conservative: "Conservative (Capital Preservation - Low Risk)",
    moderate: "Moderate (Balanced Growth - Medium Risk)",
    aggressive: "Aggressive (Wealth Maximizer - High Growth)",
  };

  const monthlyIncome = Number(formData.monthlyIncome || 0);
  const monthlyExpenses = Number(formData.monthlyExpenses || 0);
  const currentSavings = Number(formData.currentSavings || 0);
  const monthlySurplus = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySurplus / monthlyIncome) * 100) : 0;
  const emergencyTargetAmount = monthlyExpenses * Number(formData.emergencyFundTargetMonths || 6);
  const runwayMonths = monthlyExpenses > 0 ? Number((currentSavings / monthlyExpenses).toFixed(1)) : 0;
  const targetMonths = Number(formData.emergencyFundTargetMonths || 6);
  const isRunwayHealthy = runwayMonths >= targetMonths;

  // Ratios for cashflow bar
  const totalBase = monthlyIncome > 0 ? monthlyIncome : 1;
  const expensePct = Math.min(100, Math.round((monthlyExpenses / totalBase) * 100));
  const surplusPct = Math.max(0, Math.min(100, Math.round((monthlySurplus / totalBase) * 100)));

  if (fetching) {
    return (
      <AppLayout>
        <div style={{ padding: "40px 0" }}>
          <LoadingState message="Loading your calibrated financial profile..." fullPage />
        </div>
      </AppLayout>
    );
  }

  const content = (
    <div className="onboarding-page-wrapper">
      <div className="onboarding-container glass-panel">
        {/* =========================================================================
            VIEW 1: READ-ONLY DISPLAY OF USER FINANCIAL PROFILE
            ========================================================================= */}
        {hasExistingProfile && !isEditing ? (
          <div className="profile-display-card">
            {/* User Header / Hero Banner */}
            <div className="profile-user-banner">
              <div className="profile-user-left">
                <div className="profile-avatar-lg">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="profile-user-info">
                  <h3>
                    {user?.name || "WealthX Investor"}
                    <span className="badge badge-blue" style={{ fontSize: "11px" }}>
                      {user?.role === "admin" ? "Administrator" : "Verified Account"}
                    </span>
                  </h3>
                  <p>{user?.email || "Investor Account"} • Active Session</p>
                </div>
              </div>

              <div className="profile-status-pill">
                <span>✓</span> Active Financial Calibration
              </div>
            </div>

            {successMsg && (
              <div style={{ padding: "14px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", borderRadius: "10px", color: "#34d399", textAlign: "center", fontWeight: "700" }}>
                ✅ {successMsg}
              </div>
            )}

            {/* Visual Cashflow Breakdown Track */}
            <div className="cashflow-breakdown-card">
              <div className="cashflow-bar-header">
                <span style={{ textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", fontSize: "12px" }}>
                  Monthly Cashflow Distribution
                </span>
                <span className="currency" style={{ color: "var(--accent-cyan)" }}>
                  Monthly Inflow: ₹{monthlyIncome.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="cashflow-ratio-track">
                <div
                  className="cashflow-ratio-seg"
                  style={{ width: `${expensePct}%`, background: "var(--accent-rose)" }}
                  title={`Living Expenses: ${expensePct}%`}
                />
                <div
                  className="cashflow-ratio-seg"
                  style={{ width: `${surplusPct}%`, background: "var(--accent-teal)" }}
                  title={`Savings Surplus: ${surplusPct}%`}
                />
              </div>
              <div className="cashflow-legend-row">
                <div className="legend-chip">
                  <span className="legend-indicator" style={{ background: "var(--accent-rose)" }}></span>
                  <span>Living Outflows: <strong>₹{monthlyExpenses.toLocaleString("en-IN")}</strong> ({expensePct}%)</span>
                </div>
                <div className="legend-chip">
                  <span className="legend-indicator" style={{ background: "var(--accent-teal)" }}></span>
                  <span>Savings Surplus: <strong>₹{monthlySurplus.toLocaleString("en-IN")}</strong> ({surplusPct}%)</span>
                </div>
              </div>
            </div>

            {/* Core Financial Numbers Grid */}
            <div className="profile-data-grid">
              {/* Monthly Income */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Monthly Income</span>
                  <span className="profile-data-icon">💵</span>
                </div>
                <div className="profile-data-value currency" style={{ color: "#38bdf8" }}>
                  ₹{monthlyIncome.toLocaleString("en-IN")}
                </div>
                <span className="profile-data-sub">
                  Career: {employmentLabels[formData.employmentStatus] || formData.employmentStatus}
                </span>
              </div>

              {/* Monthly Expenses */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Monthly Expenses</span>
                  <span className="profile-data-icon">📉</span>
                </div>
                <div className="profile-data-value currency" style={{ color: "#fb7185" }}>
                  ₹{monthlyExpenses.toLocaleString("en-IN")}
                </div>
                <span className="profile-data-sub">Rent, EMIs, utilities & lifestyle ({expensePct}% of income)</span>
              </div>

              {/* Monthly Surplus */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Monthly Surplus</span>
                  <span className="profile-data-icon">📈</span>
                </div>
                <div className="profile-data-value currency" style={{ color: "#34d399" }}>
                  +₹{monthlySurplus.toLocaleString("en-IN")}
                </div>
                <span className="profile-data-sub">
                  <span className={`badge ${savingsRate >= 30 ? "badge-green" : savingsRate >= 15 ? "badge-amber" : "badge-rose"}`} style={{ fontSize: "11px", padding: "2px 8px" }}>
                    {savingsRate}% Savings Rate
                  </span>
                </span>
              </div>

              {/* Liquid Bank Savings */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Liquid Savings</span>
                  <span className="profile-data-icon">🏦</span>
                </div>
                <div className="profile-data-value currency" style={{ color: "#a78bfa" }}>
                  ₹{currentSavings.toLocaleString("en-IN")}
                </div>
                <span className="profile-data-sub">Instant liquidity & emergency cash</span>
              </div>

              {/* Financial Dependents */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Financial Dependents</span>
                  <span className="profile-data-icon">👨‍👩‍👧</span>
                </div>
                <div className="profile-data-value">
                  {formData.dependentsCount || 0} <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-muted)" }}>Members</span>
                </div>
                <span className="profile-data-sub">Supported by monthly cashflow</span>
              </div>

              {/* Emergency Cushion */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Emergency Buffer</span>
                  <span className="profile-data-icon">🛡️</span>
                </div>
                <div className="profile-data-value">
                  {runwayMonths} <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-muted)" }}>/ {targetMonths} Mo</span>
                </div>
                <span className="profile-data-sub">
                  {isRunwayHealthy ? "🟢 Adequate 6-month buffer" : `🟡 Target: ₹${emergencyTargetAmount.toLocaleString("en-IN")}`}
                </span>
              </div>

              {/* Risk Profile */}
              <div className="profile-data-card" style={{ gridColumn: "1 / -1" }}>
                <div className="profile-card-header">
                  <span className="profile-data-label">Risk Profile Calibration</span>
                  <span className="profile-data-icon">⚡</span>
                </div>
                <div className="profile-data-value" style={{ fontSize: "18px", textTransform: "capitalize", color: "#38bdf8", marginTop: "2px" }}>
                  {formData.riskProfile} Growth Strategy
                </div>
                <span className="profile-data-sub">{riskLabels[formData.riskProfile] || formData.riskProfile}</span>
              </div>
            </div>

            {/* Selected Milestones Section */}
            <div className="profile-detail-section">
              <div className="profile-section-title">
                <span>🎯</span> Primary Financial Milestones
              </div>
              <div className="profile-milestones-list">
                {goalOptions
                  .filter((g) => formData.primaryGoals.includes(g.id))
                  .map((goal) => (
                    <div key={goal.id} className="profile-milestone-chip">
                      <span className="milestone-chip-title">{goal.label}</span>
                      <span className="milestone-chip-desc">{goal.desc}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Investment Experience Section */}
            <div className="profile-detail-section">
              <div className="profile-section-title">
                <span>🌐</span> Investment Instruments & Experience
              </div>
              <div className="profile-experience-pills">
                {experienceOptions
                  .filter((e) => formData.investmentExperience.includes(e.id))
                  .map((exp) => (
                    <div key={exp.id} className="profile-exp-pill">
                      <span>✓</span> {exp.label}
                    </div>
                  ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="profile-actions-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/dashboard")}
              >
                ← Back to Dashboard
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsEditing(true);
                  setStep(1);
                }}
              >
                ✏️ Edit & Update Profile Details
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
              VIEW 2: EDIT & CALIBRATION WIZARD (MULTI-STEP & LIVE FEEDBACK)
              ========================================================================= */
          <>
            <div className="onboarding-header">
              <div className="onboarding-logo-badge">Financial Calibration Engine</div>
              <h2>{hasExistingProfile ? "Update Your Financial Profile" : `Welcome, ${user?.name || "Investor"}! Let’s Build Your Financial Profile`}</h2>
              <p>
                Adjust your monthly income, living expenses, emergency reserves, and behavioral risk posture in real-time.
              </p>

              {/* Stepper Bar */}
              <div className="stepper-bar">
                {[
                  { num: 1, label: "Income" },
                  { num: 2, label: "Expenses" },
                  { num: 3, label: "Goals" },
                  { num: 4, label: "Risk" },
                ].map((s, idx) => (
                  <React.Fragment key={s.num}>
                    <div
                      className={`step-node ${step >= s.num ? "active" : ""}`}
                      onClick={() => setStep(s.num)}
                      title={`Jump to Step ${s.num}: ${s.label}`}
                    >
                      <div className="step-num">{s.num}</div>
                      <span>{s.label}</span>
                    </div>
                    {idx < 3 && (
                      <div className={`step-line ${step > s.num ? "active" : ""}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="live-calibration-banner">
              <div className="live-banner-title">
                <span>⚡ Live Calibration Preview</span>
              </div>
              <div className="live-banner-metrics">
                <div className="live-metric-item">
                  <span className="live-metric-label">Monthly Surplus</span>
                  <span className="live-metric-value" style={{ color: monthlySurplus >= 0 ? "var(--accent-teal)" : "var(--accent-rose)" }}>
                    {monthlySurplus >= 0 ? "+" : ""}₹{monthlySurplus.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="live-metric-item">
                  <span className="live-metric-label">Savings Rate</span>
                  <span className="live-metric-value" style={{ color: savingsRate >= 30 ? "var(--accent-teal)" : "#38bdf8" }}>
                    {savingsRate}%
                  </span>
                </div>
                <div className="live-metric-item">
                  <span className="live-metric-label">Buffer Runway</span>
                  <span className="live-metric-value" style={{ color: isRunwayHealthy ? "var(--accent-teal)" : "var(--accent-amber)" }}>
                    {runwayMonths} Mo
                  </span>
                </div>
              </div>
            </div>

            {error && <div className="onboarding-error-banner">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="onboarding-form">
              {/* STEP 1: Income & Employment */}
              {step === 1 && (
                <div className="step-content">
                  <h3 className="step-heading">Step 1: Employment Model & Monthly Inflow</h3>
                  <p className="step-subtext">How do you earn and what is your net monthly take-home?</p>

                  <div className="form-group">
                    <label>Employment Model</label>
                    <div className="employment-grid">
                      {[
                        { id: "salaried", label: "Salaried Professional" },
                        { id: "self_employed", label: "Self-Employed / Freelancer" },
                        { id: "business", label: "Business Owner / Founder" },
                        { id: "student", label: "Student / Early Career" },
                        { id: "retired", label: "Retired / Pensioner" },
                        { id: "other", label: "Other / Homemaker" },
                      ].map((emp) => (
                        <div
                          key={emp.id}
                          className={`radio-card ${formData.employmentStatus === emp.id ? "selected" : ""}`}
                          onClick={() => setFormData({ ...formData, employmentStatus: emp.id })}
                        >
                          <input
                            type="radio"
                            name="employmentStatus"
                            checked={formData.employmentStatus === emp.id}
                            onChange={() => {}}
                          />
                          <span>{emp.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Monthly Take-Home Inflow (₹ INR)</label>
                    <div className="input-with-symbol">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        name="monthlyIncome"
                        placeholder="e.g. 75000"
                        value={formData.monthlyIncome}
                        onChange={handleInputChange}
                        required
                        min="1"
                      />
                    </div>
                    <div className="quick-chips-row">
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center" }}>Quick Add:</span>
                      <button type="button" className="quick-chip-btn" onClick={() => handleQuickAdd("monthlyIncome", 5000)}>+₹5k</button>
                      <button type="button" className="quick-chip-btn" onClick={() => handleQuickAdd("monthlyIncome", 10000)}>+₹10k</button>
                      <button type="button" className="quick-chip-btn" onClick={() => handleQuickAdd("monthlyIncome", 25000)}>+₹25k</button>
                      <button type="button" className="quick-chip-btn" onClick={() => handleQuickAdd("monthlyIncome", 50000)}>+₹50k</button>
                    </div>
                    <small className="form-hint">Net in-hand post-tax monthly income.</small>
                  </div>

                  <div className="form-group">
                    <label>Number of Financial Dependents</label>
                    <input
                      type="number"
                      name="dependentsCount"
                      placeholder="0"
                      value={formData.dependentsCount}
                      onChange={handleInputChange}
                      min="0"
                      max="15"
                    />
                    <small className="form-hint">Family members reliant on your monthly income.</small>
                  </div>
                </div>
              )}

              {/* STEP 2: Expenses & Liquid Savings */}
              {step === 2 && (
                <div className="step-content">
                  <h3 className="step-heading">Step 2: Monthly Outflow & Existing Cushion</h3>
                  <p className="step-subtext">
                    Your living expenses calculate your Emergency Runway and savings capacity.
                  </p>

                  <div className="form-group">
                    <label>Estimated Total Monthly Expenses (₹ INR)</label>
                    <div className="input-with-symbol">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        name="monthlyExpenses"
                        placeholder="e.g. 35000"
                        value={formData.monthlyExpenses}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </div>
                    <div className="quick-chips-row">
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center" }}>Quick Add:</span>
                      <button type="button" className="quick-chip-btn" onClick={() => handleQuickAdd("monthlyExpenses", 2000)}>+₹2k</button>
                      <button type="button" className="quick-chip-btn" onClick={() => handleQuickAdd("monthlyExpenses", 5000)}>+₹5k</button>
                      <button type="button" className="quick-chip-btn" onClick={() => handleQuickAdd("monthlyExpenses", 10000)}>+₹10k</button>
                    </div>
                    <small className="form-hint">Includes rent, groceries, EMIs, utilities, and lifestyle expenses.</small>
                  </div>

                  <div className="form-group">
                    <label>Current Liquid Savings & Bank Balance (₹ INR)</label>
                    <div className="input-with-symbol">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        name="currentSavings"
                        placeholder="e.g. 150000"
                        value={formData.currentSavings}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    <div className="quick-chips-row">
                      <button type="button" className="quick-chip-btn" onClick={() => handleQuickAdd("currentSavings", 25000)}>+₹25k</button>
                      <button type="button" className="quick-chip-btn" onClick={() => handleQuickAdd("currentSavings", 50000)}>+₹50k</button>
                      <button type="button" className="quick-chip-btn" onClick={() => handleQuickAdd("currentSavings", 100000)}>+₹100k</button>
                    </div>
                    <small className="form-hint">Easily accessible funds in savings accounts and liquid mutual funds.</small>
                  </div>

                  <div className="form-group">
                    <label>Target Emergency Fund Duration</label>
                    <select
                      name="emergencyFundTargetMonths"
                      value={formData.emergencyFundTargetMonths}
                      onChange={handleInputChange}
                    >
                      <option value={3}>3 Months Expenses (Aggressive / Dual Income)</option>
                      <option value={6}>6 Months Expenses (Standard Recommended)</option>
                      <option value={9}>9 Months Expenses (Moderate Conservative)</option>
                      <option value={12}>12 Months Expenses (High Responsibility / Single Earner)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3: Goals & Experience */}
              {step === 3 && (
                <div className="step-content">
                  <h3 className="step-heading">Step 3: Financial Milestones & Experience</h3>
                  <p className="step-subtext">Select the instruments you have used and your primary milestones.</p>

                  <div className="form-group">
                    <label>Primary Financial Milestones</label>
                    <div className="options-grid">
                      {goalOptions.map((goal) => {
                        const isSelected = formData.primaryGoals.includes(goal.id);
                        return (
                          <div
                            key={goal.id}
                            className={`checkbox-card ${isSelected ? "selected" : ""}`}
                            onClick={() => toggleArrayItem("primaryGoals", goal.id)}
                          >
                            <span className="option-title">{goal.label}</span>
                            <span className="option-desc">{goal.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Investment Familiarity & Experience</label>
                    <div className="tags-grid">
                      {experienceOptions.map((exp) => {
                        const isSelected = formData.investmentExperience.includes(exp.id);
                        return (
                          <div
                            key={exp.id}
                            className={`tag-pill ${isSelected ? "selected" : ""}`}
                            onClick={() => toggleArrayItem("investmentExperience", exp.id)}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {exp.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Risk Profile Assessment */}
              {step === 4 && (
                <div className="step-content">
                  <h3 className="step-heading">Step 4: Behavioral Risk DNA Posture</h3>
                  <p className="step-subtext">How do you react to market fluctuations and market volatility?</p>

                  <div className="risk-cards-grid">
                    {[
                      {
                        id: "conservative",
                        title: "Conservative (Capital Preservation)",
                        tag: "Low Risk",
                        color: "teal",
                        desc: "You prioritize safety of capital. You prefer FDs, Govt Bonds, and Debt Funds over volatile stock market swings.",
                      },
                      {
                        id: "moderate",
                        title: "Moderate (Balanced Growth)",
                        tag: "Medium Risk",
                        color: "blue",
                        desc: "You seek a balanced blend of equity mutual funds (SIP) and debt instruments. You can tolerate 10-15% market dips for higher long-term compounding.",
                      },
                      {
                        id: "aggressive",
                        title: "Aggressive (Wealth Maximizer)",
                        tag: "High Growth",
                        color: "amber",
                        desc: "You are focused on maximum compounding through equity, direct stocks, and index ETFs, and comfortable with short-term market drawdowns.",
                      },
                    ].map((risk) => (
                      <div
                        key={risk.id}
                        className={`risk-card ${formData.riskProfile === risk.id ? "selected" : ""}`}
                        onClick={() => setFormData({ ...formData, riskProfile: risk.id })}
                      >
                        <div className="risk-card-top">
                          <span className={`badge badge-${risk.color}`}>{risk.tag}</span>
                          <input
                            type="radio"
                            name="riskProfile"
                            checked={formData.riskProfile === risk.id}
                            onChange={() => {}}
                          />
                        </div>
                        <h4>{risk.title}</h4>
                        <p>{risk.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="onboarding-controls">
                {step > 1 ? (
                  <button type="button" className="btn btn-secondary" onClick={handleBack}>
                    ← Back
                  </button>
                ) : hasExistingProfile ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel Editing
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button type="button" className="btn btn-primary" onClick={handleNext}>
                    Continue →
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading
                      ? "Saving Intelligence Profile..."
                      : hasExistingProfile
                      ? "Save & Update Profile ✅"
                      : "Complete Setup & Enter Dashboard 🚀"}
                  </button>
                )}
              </div>
            </form>
          </>
        )}

        <Disclaimer variant="general" />
      </div>
    </div>
  );

  return hasExistingProfile ? <AppLayout>{content}</AppLayout> : <div className="onboarding-page">{content}</div>;
};

export default Onboarding;
