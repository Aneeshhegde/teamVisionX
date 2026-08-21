import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
        await refreshUser();
        setHasExistingProfile(true);
        setIsEditing(false);
        setSuccessMsg("Financial profile updated successfully!");
        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
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
    { id: "emergency_fund", label: "🛡️ Emergency Fund", desc: "6 months safety cushion" },
    { id: "wealth_creation", label: "📈 Long-term Wealth", desc: "Compounding via equity/SIPs" },
    { id: "buy_home", label: "🏠 Buying a Home", desc: "Down payment & EMI planning" },
    { id: "retirement", label: "🌅 Early Retirement", desc: "Financial freedom & FIRE" },
    { id: "debt_freedom", label: "💳 Debt Payoff", desc: "Clear loans & credit card dues" },
    { id: "child_education", label: "🎓 Higher Education", desc: "Tuition & future funds" },
  ];

  const experienceOptions = [
    { id: "savings_fd", label: "Fixed Deposits & Savings" },
    { id: "mutual_fund", label: "Mutual Funds & SIPs" },
    { id: "direct_stocks", label: "Direct Indian Stocks (NSE/BSE)" },
    { id: "gold_real_estate", label: "Gold & Real Estate" },
    { id: "crypto_derivatives", label: "Futures / Options / Crypto" },
  ];

  const employmentLabels = {
    salaried: "Salaried Professional",
    self_employed: "Self-Employed / Freelancer",
    business: "Business Owner",
    student: "Student",
    retired: "Retired",
    other: "Other",
  };

  const riskLabels = {
    conservative: "Conservative (Capital Preservation - Low Risk)",
    moderate: "Moderate (Balanced Growth - Medium Risk)",
    aggressive: "Aggressive (Wealth Maximizer - High Growth)",
  };

  const monthlyIncome = Number(formData.monthlyIncome || 0);
  const monthlyExpenses = Number(formData.monthlyExpenses || 0);
  const monthlySurplus = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySurplus / monthlyIncome) * 100) : 0;
  const emergencyTargetAmount = monthlyExpenses * Number(formData.emergencyFundTargetMonths || 6);

  if (fetching) {
    return (
      <div className="onboarding-page">
        <LoadingState message="Loading your financial profile..." fullPage />
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container glass-panel">
        {/* =========================================================================
            VIEW 1: READ-ONLY DISPLAY OF USER FINANCIAL PROFILE
            ========================================================================= */}
        {hasExistingProfile && !isEditing ? (
          <div className="profile-display-card">
            {/* Header / Banner */}
            <div className="profile-user-banner">
              <div className="profile-user-left">
                <div className="profile-avatar-lg">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="profile-user-info">
                  <h3>{user?.name || "WealthX Investor"}</h3>
                  <p>{user?.email || "Investor Account"} • Registered Member</p>
                </div>
              </div>

              <div className="profile-status-pill">
                <span>✓</span> Active Financial Blueprint
              </div>
            </div>

            {successMsg && (
              <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", borderRadius: "8px", color: "#34d399", textAlign: "center" }}>
                ✅ {successMsg}
              </div>
            )}

            {/* Core Financial Numbers Grid */}
            <div className="profile-data-grid">
              {/* Monthly Income */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Monthly Income</span>
                  <span className="profile-data-icon">💵</span>
                </div>
                <div className="profile-data-value" style={{ color: "#34d399" }}>
                  ₹{monthlyIncome.toLocaleString("en-IN")}
                </div>
                <span className="profile-data-sub">In-hand post-tax inflow</span>
              </div>

              {/* Monthly Expenses */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Monthly Expenses</span>
                  <span className="profile-data-icon">📉</span>
                </div>
                <div className="profile-data-value" style={{ color: "#fb7185" }}>
                  ₹{monthlyExpenses.toLocaleString("en-IN")}
                </div>
                <span className="profile-data-sub">Rent, EMIs, utilities & lifestyle</span>
              </div>

              {/* Monthly Surplus */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Monthly Surplus</span>
                  <span className="profile-data-icon">📈</span>
                </div>
                <div className="profile-data-value" style={{ color: "#58a6ff" }}>
                  ₹{monthlySurplus.toLocaleString("en-IN")}
                </div>
                <span className="profile-data-sub">Savings Rate: {savingsRate}% of inflow</span>
              </div>

              {/* Liquid Savings */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Liquid Savings</span>
                  <span className="profile-data-icon">🏦</span>
                </div>
                <div className="profile-data-value">
                  ₹{Number(formData.currentSavings || 0).toLocaleString("en-IN")}
                </div>
                <span className="profile-data-sub">Accessible bank & emergency funds</span>
              </div>

              {/* Employment Type */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Employment Type</span>
                  <span className="profile-data-icon">💼</span>
                </div>
                <div className="profile-data-value" style={{ fontSize: "17px", fontWeight: "700" }}>
                  {employmentLabels[formData.employmentStatus] || formData.employmentStatus}
                </div>
                <span className="profile-data-sub">Primary income source</span>
              </div>

              {/* Dependents */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Financial Dependents</span>
                  <span className="profile-data-icon">👨‍👩‍👧</span>
                </div>
                <div className="profile-data-value">
                  {formData.dependentsCount || 0} <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-muted)" }}>Members</span>
                </div>
                <span className="profile-data-sub">Relying on monthly income</span>
              </div>

              {/* Emergency Fund Target */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Emergency Cushion</span>
                  <span className="profile-data-icon">🛡️</span>
                </div>
                <div className="profile-data-value" style={{ fontSize: "18px" }}>
                  {formData.emergencyFundTargetMonths || 6} Months
                </div>
                <span className="profile-data-sub">Target: ₹{emergencyTargetAmount.toLocaleString("en-IN")}</span>
              </div>

              {/* Risk Profile */}
              <div className="profile-data-card">
                <div className="profile-card-header">
                  <span className="profile-data-label">Risk Profile</span>
                  <span className="profile-data-icon">⚡</span>
                </div>
                <div className="profile-data-value" style={{ fontSize: "16px", textTransform: "capitalize", color: "#38bdf8" }}>
                  {formData.riskProfile} Growth
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

            {/* Selected Investment Experience Section */}
            <div className="profile-detail-section">
              <div className="profile-section-title">
                <span>📊</span> Investment Background & Assets
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
             VIEW 2: EDITABLE / FIRST-TIME ONBOARDING WIZARD
             ========================================================================= */
          <>
            {/* Header */}
            <div className="onboarding-header">
              <div className="onboarding-logo-badge">WealthX Intelligence</div>
              <h2>
                {hasExistingProfile
                  ? "Edit Financial Profile Details"
                  : `Welcome, ${user?.name || "Investor"}! Let’s Build Your Financial Profile`}
              </h2>
              <p>
                {hasExistingProfile
                  ? "Update your monthly inflow, expenses, risk profile, and investment milestones."
                  : "Answer a few quick questions to calibrate your personalized Financial Health Score, Wealth Vault, and AI Decision Lab."}
              </p>

              {/* Stepper Progress */}
              <div className="stepper-bar">
                <div
                  className={`step-node ${step >= 1 ? "active" : ""}`}
                  onClick={() => setStep(1)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="step-num">1</div>
                  <span>Income</span>
                </div>
                <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
                <div
                  className={`step-node ${step >= 2 ? "active" : ""}`}
                  onClick={() => setStep(2)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="step-num">2</div>
                  <span>Expenses</span>
                </div>
                <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
                <div
                  className={`step-node ${step >= 3 ? "active" : ""}`}
                  onClick={() => setStep(3)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="step-num">3</div>
                  <span>Goals</span>
                </div>
                <div className={`step-line ${step >= 4 ? "active" : ""}`}></div>
                <div
                  className={`step-node ${step >= 4 ? "active" : ""}`}
                  onClick={() => setStep(4)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="step-num">4</div>
                  <span>Risk</span>
                </div>
              </div>
            </div>

            {error && <div className="onboarding-error-banner">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="onboarding-form">
              {/* STEP 1: Income & Employment */}
              {step === 1 && (
                <div className="step-content">
                  <h3 className="step-heading">Step 1: Employment & Inflow</h3>
                  <p className="step-subtext">How do you earn and what is your monthly take-home?</p>

                  <div className="form-group">
                    <label>Employment Type</label>
                    <div className="employment-grid">
                      {[
                        { id: "salaried", label: "Salaried Professional" },
                        { id: "self_employed", label: "Self-Employed / Freelancer" },
                        { id: "business", label: "Business Owner" },
                        { id: "student", label: "Student" },
                        { id: "retired", label: "Retired" },
                        { id: "other", label: "Other" },
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
                    <small className="form-hint">Net in-hand post-tax monthly amount.</small>
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
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Expenses & Liquid Savings */}
              {step === 2 && (
                <div className="step-content">
                  <h3 className="step-heading">Step 2: Outflows & Existing Cushion</h3>
                  <p className="step-subtext">
                    Your monthly burn rate helps calculate your Emergency Runway and Savings Rate.
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
                    <small className="form-hint">Includes rent, groceries, EMIs, utilities, and lifestyle.</small>
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
                    <small className="form-hint">Easily accessible funds in savings accounts and FDs.</small>
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
                      <option value={12}>12 Months Expenses (Conservative / High Responsibility)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3: Goals & Experience */}
              {step === 3 && (
                <div className="step-content">
                  <h3 className="step-heading">Step 3: Priorities & Experience</h3>
                  <p className="step-subtext">Select all the assets you have experience with and your core goals.</p>

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
                    <label>Investment Experience</label>
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
                  <h3 className="step-heading">Step 4: Investment Temperament</h3>
                  <p className="step-subtext">How do you react to market fluctuations?</p>

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
                        desc: "You seek a balanced blend of equity mutual funds (SIP) and debt instruments. You can tolerate 10-15% market dips for higher long-term gains.",
                      },
                      {
                        id: "aggressive",
                        title: "Aggressive (Wealth Maximizer)",
                        tag: "High Growth",
                        color: "amber",
                        desc: "You are focused on maximum compounding through equity, direct stocks, and index ETFs, and comfortable with short-term volatility.",
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
};

export default Onboarding;
