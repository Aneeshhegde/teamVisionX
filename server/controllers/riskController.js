const RiskProfile = require("../models/RiskProfile");
const Asset = require("../models/Asset");
const FinancialProfile = require("../models/FinancialProfile");
const { logFinancialEvent } = require("../services/historyService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const calculateRiskDNA = (answers) => {
  let score = 50;

  // 1. Age
  const age = answers.ageGroup;
  if (age === "<25") score += 15;
  else if (age === "25-35") score += 10;
  else if (age === "36-45") score += 2;
  else if (age === "46-55") score -= 8;
  else if (age === ">55") score -= 15;

  // 2. Income Stability
  const income = answers.incomeStability;
  if (income === "very_stable_few_deps") score += 10;
  else if (income === "stable_moderate_deps") score += 4;
  else if (income === "variable_freelance") score -= 6;
  else if (income === "unpredictable") score -= 12;

  // 3. Emergency Buffer
  const emg = answers.emergencyBuffer;
  if (emg === ">6_months") score += 10;
  else if (emg === "3-6_months") score += 4;
  else if (emg === "1-3_months") score -= 6;
  else if (emg === "<1_month") score -= 14;

  // 4. Time Horizon
  const horizon = answers.timeHorizon;
  let horizonYears = 7;
  if (horizon === ">10_years") { score += 15; horizonYears = 12; }
  else if (horizon === "5-10_years") { score += 8; horizonYears = 7; }
  else if (horizon === "3-5_years") { score += 0; horizonYears = 4; }
  else if (horizon === "1-3_years") { score -= 10; horizonYears = 2; }
  else if (horizon === "<1_year") { score -= 20; horizonYears = 1; }

  // 5. Market Reaction (Psychological Tolerance)
  const rxn = answers.marketReaction;
  if (rxn === "buy_aggressively") score += 16;
  else if (rxn === "hold_patiently") score += 6;
  else if (rxn === "reduce_slightly") score -= 8;
  else if (rxn === "panic_sell_all") score -= 20;

  // 6. Primary Goal
  const goal = answers.primaryGoal;
  if (goal === "aggressive_wealth") score += 12;
  else if (goal === "balanced_growth") score += 4;
  else if (goal === "income_generation") score -= 6;
  else if (goal === "capital_preservation") score -= 14;

  // 7. Experience
  const exp = answers.investmentExperience;
  if (exp === "advanced_stocks_derivatives") score += 10;
  else if (exp === "intermediate_mutual_funds") score += 4;
  else if (exp === "beginner_fd_gold") score -= 4;
  else if (exp === "none") score -= 10;

  const riskScore = Math.min(100, Math.max(5, Math.round(score)));

  let profileCategory = "moderate_growth";
  let categoryLabel = "Strategic Compounder (Moderate Growth)";
  let riskTolerance = "Moderate";
  let riskCapacity = "Medium-High";
  let recommendedAllocation = { equityPct: 55, debtPct: 25, goldPct: 10, cashPct: 10 };

  if (riskScore <= 25) {
    profileCategory = "conservative";
    categoryLabel = "Capital Preserver (Conservative)";
    riskTolerance = "Low";
    riskCapacity = "Defensive";
    recommendedAllocation = { equityPct: 20, debtPct: 50, goldPct: 15, cashPct: 15 };
  } else if (riskScore <= 45) {
    profileCategory = "moderate";
    categoryLabel = "Balanced Accumulator (Moderate)";
    riskTolerance = "Medium-Low";
    riskCapacity = "Moderate";
    recommendedAllocation = { equityPct: 40, debtPct: 35, goldPct: 15, cashPct: 10 };
  } else if (riskScore <= 65) {
    profileCategory = "moderate_growth";
    categoryLabel = "Strategic Compounder (Moderate Growth)";
    riskTolerance = "Medium";
    riskCapacity = "Medium-High";
    recommendedAllocation = { equityPct: 55, debtPct: 25, goldPct: 10, cashPct: 10 };
  } else if (riskScore <= 82) {
    profileCategory = "growth";
    categoryLabel = "Growth Builder (Growth)";
    riskTolerance = "High";
    riskCapacity = "High";
    recommendedAllocation = { equityPct: 70, debtPct: 15, goldPct: 10, cashPct: 5 };
  } else {
    profileCategory = "aggressive";
    categoryLabel = "Dynamic Maximizer (Aggressive)";
    riskTolerance = "Very High";
    riskCapacity = "Aggressive";
    recommendedAllocation = { equityPct: 80, debtPct: 10, goldPct: 5, cashPct: 5 };
  }

  return {
    riskScore,
    profileCategory,
    categoryLabel,
    riskTolerance,
    riskCapacity,
    investmentHorizonYears: horizonYears,
    recommendedAllocation,
  };
};

/**
 * Get Risk DNA and compare with actual portfolio allocation
 */
const getRiskDNA = async (req, res) => {
  try {
    const userId = req.user.id;
    let riskProfile = await RiskProfile.findOne({ userId });
    const profile = await FinancialProfile.findOne({ userId });
    const assets = await Asset.find({ userId });

    // If not assessed yet, provide baseline moderate default
    if (!riskProfile) {
      riskProfile = {
        riskScore: 58,
        profileCategory: "moderate_growth",
        categoryLabel: "Moderate Growth (Default Baseline)",
        riskTolerance: "Medium",
        riskCapacity: "Medium",
        investmentHorizonYears: 7,
        recommendedAllocation: { equityPct: 55, debtPct: 25, goldPct: 10, cashPct: 10 },
        isAssessed: false,
      };
    }

    // Compute actual portfolio distribution
    const liquidCash = Number(profile?.currentSavings || 0);
    let equityTotal = 0;
    let debtTotal = 0;
    let goldTotal = 0;
    let otherTotal = 0;

    assets.forEach((a) => {
      const val = Number(a.currentValue || 0);
      const cat = (a.category || "").toLowerCase();

      if (["stock", "mutual_fund", "sip", "etf"].includes(cat)) {
        equityTotal += val;
      } else if (["fd", "bond", "epf", "ppf", "debt_fund"].includes(cat)) {
        debtTotal += val;
      } else if (["gold", "digital_gold", "sgb"].includes(cat)) {
        goldTotal += val;
      } else {
        otherTotal += val;
      }
    });

    const totalPortfolio = liquidCash + equityTotal + debtTotal + goldTotal + otherTotal;

    const actualAllocation = {
      equityPct: totalPortfolio > 0 ? Number(((equityTotal / totalPortfolio) * 100).toFixed(1)) : 0,
      debtPct: totalPortfolio > 0 ? Number(((debtTotal / totalPortfolio) * 100).toFixed(1)) : 0,
      goldPct: totalPortfolio > 0 ? Number(((goldTotal / totalPortfolio) * 100).toFixed(1)) : 0,
      cashPct: totalPortfolio > 0 ? Number(((liquidCash / totalPortfolio) * 100).toFixed(1)) : 100,
      equityTotal,
      debtTotal,
      goldTotal,
      cashTotal: liquidCash,
      totalPortfolio,
    };

    // Calculate Mismatch & Observations
    const rec = riskProfile.recommendedAllocation || { equityPct: 55, debtPct: 25, goldPct: 10, cashPct: 10 };
    const mismatches = [];

    const equityDiff = actualAllocation.equityPct - rec.equityPct;
    if (equityDiff >= 15 && totalPortfolio > 0) {
      mismatches.push({
        type: "aggressive_mismatch",
        severity: "warning",
        title: "Heavy Equity Exposure",
        message: `Your actual equity allocation (${actualAllocation.equityPct}%) is ${Math.round(equityDiff)}% higher than your Risk DNA target (${rec.equityPct}%). This introduces elevated volatility during market downturns.`,
        recommendation: "Consider directing fresh monthly surplus towards debt funds, FDs, or high-interest debt payoffs.",
      });
    } else if (equityDiff <= -20 && totalPortfolio > 0) {
      mismatches.push({
        type: "conservative_mismatch",
        severity: "info",
        title: "Under-Compounding Opportunity",
        message: `Your equity exposure (${actualAllocation.equityPct}%) is significantly below your Risk DNA target (${rec.equityPct}%). Over long horizons, heavy cash/FD drags inflation-adjusted returns.`,
        recommendation: "Explore systematic SIP compounding in diversified index mutual funds.",
      });
    }

    if (actualAllocation.cashPct >= 40 && totalPortfolio > 0) {
      mismatches.push({
        type: "cash_drag",
        severity: "info",
        title: "High Cash Reserves Drag",
        message: `${actualAllocation.cashPct}% of your wealth is held in low-yield savings. Beyond a 6-month emergency buffer, excess cash loses real purchasing power to inflation.`,
        recommendation: "Deploy idle cash into disciplined goals or liquid debt instruments.",
      });
    }

    if (mismatches.length === 0) {
      mismatches.push({
        type: "aligned",
        severity: "good",
        title: "Portfolio Well-Aligned with Risk DNA",
        message: "Your asset allocation closely matches your quantified psychological tolerance and investment horizon.",
        recommendation: "Maintain systematic rebalancing annually or when asset classes drift >10%.",
      });
    }

    return sendSuccess(res, {
      riskProfile,
      actualAllocation,
      recommendedAllocation: rec,
      mismatches,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Submit Risk DNA Assessment
 */
const submitRiskAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { answers } = req.body;

    if (!answers) {
      return sendError(res, "Assessment answers are required", 400);
    }

    const calculated = calculateRiskDNA(answers);

    const riskProfile = await RiskProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...calculated,
          assessmentAnswers: answers,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Log to financial history
    await logFinancialEvent({
      userId,
      eventType: "risk_profile_updated",
      title: "Risk DNA Assessed",
      description: `Risk score calculated at ${calculated.riskScore}/100 (${calculated.categoryLabel}).`,
      category: "risk_dna",
      metadata: { riskScore: calculated.riskScore, category: calculated.profileCategory },
    });

    return sendSuccess(res, riskProfile, "Risk DNA updated successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getRiskDNA,
  submitRiskAssessment,
};
