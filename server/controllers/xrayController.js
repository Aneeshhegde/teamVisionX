const FinancialProfile = require("../models/FinancialProfile");
const Asset = require("../models/Asset");
const Goal = require("../models/Goal");
const { enrichGoal } = require("./goalController");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Get in-depth Financial X-Ray diagnostics computed from Profile + Assets + Goals
 */
const getFinancialXRay = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await FinancialProfile.findOne({ userId });
    const assets = await Asset.find({ userId });
    const goals = await Goal.find({ userId });

    const monthlyIncome = profile?.monthlyIncome || 0;
    const monthlyExpenses = profile?.monthlyExpenses || 0;
    const cashFlow = Math.max(0, monthlyIncome - monthlyExpenses);
    const expenseRatio = monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0;
    const savingsRate = monthlyIncome > 0 ? Math.round((cashFlow / monthlyIncome) * 100) : 0;

    // Emergency Fund Calculations
    const liquidSavings = profile?.currentSavings || 0;
    const emergencyMonths = monthlyExpenses > 0 ? Number((liquidSavings / monthlyExpenses).toFixed(1)) : 0;
    let emergencyStatus = "needs_attention";
    if (emergencyMonths >= 6) {
      emergencyStatus = "strong";
    } else if (emergencyMonths >= 3) {
      emergencyStatus = "developing";
    }

    // Investment Health & Concentration Calculations
    let totalInvested = 0;
    let totalCurrentValue = 0;
    const categoryMap = {};

    assets.forEach((asset) => {
      totalInvested += Number(asset.investedAmount || 0);
      totalCurrentValue += Number(asset.currentValue || 0);
      categoryMap[asset.category] = (categoryMap[asset.category] || 0) + Number(asset.currentValue || 0);
    });

    const categoriesUsed = Object.keys(categoryMap).length;
    let concentrationWarning = false;
    let dominantCategory = null;

    const distribution = Object.entries(categoryMap).map(([category, value]) => {
      const pct = totalCurrentValue > 0 ? Number(((value / totalCurrentValue) * 100).toFixed(1)) : 0;
      if (pct >= 65 && assets.length > 1) {
        concentrationWarning = true;
        dominantCategory = category;
      }
      return { category, value, percentage: pct };
    });

    const unrealizedGainLoss = totalCurrentValue - totalInvested;
    const unrealizedGainLossPct = totalInvested > 0
      ? Number(((unrealizedGainLoss / totalInvested) * 100).toFixed(2))
      : 0;

    // Goal Health
    const enrichedGoals = goals.map(enrichGoal);
    const goalHealth = enrichedGoals.map((g) => ({
      id: g._id,
      title: g.title,
      category: g.category,
      progressPct: g.progressPct,
      status: g.status,
      statusLabel: g.statusLabel,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      remainingMonths: g.remainingMonths,
      requiredMonthlyContribution: g.requiredMonthlyContribution,
    }));

    // Insight statements (objective observations, non-judgmental)
    const insights = [];

    if (!profile) {
      insights.push("Financial calibration profile is currently pending completion.");
    } else {
      insights.push(
        `Monthly cash flow currently records ₹${cashFlow.toLocaleString("en-IN")} surplus after accounting for recurring expenses.`
      );
      insights.push(
        `Your tracked emergency liquidity covers approximately ${emergencyMonths} months of estimated living expenses.`
      );
    }

    if (assets.length === 0) {
      insights.push("Wealth Vault currently holds zero tracked investment assets.");
    } else if (concentrationWarning && dominantCategory) {
      insights.push(
        `Asset distribution shows heavy allocation in ${dominantCategory.replace("_", " ")}, representing over 65% of recorded portfolio value.`
      );
    } else if (categoriesUsed >= 3) {
      insights.push(`Portfolio demonstrates healthy asset diversity spanning ${categoriesUsed} distinct investment asset classes.`);
    }

    const behindGoals = goalHealth.filter((g) => g.status === "behind_schedule");
    if (behindGoals.length > 0) {
      insights.push(`${behindGoals.length} tracked financial goal(s) currently reflect a pacing deficit against scheduled target timelines.`);
    } else if (goals.length > 0) {
      insights.push("All established milestones are maintaining scheduled progress timelines.");
    }

    return sendSuccess(res, {
      income: {
        monthlyIncome,
        monthlyExpenses,
        cashFlow,
        expenseRatio,
        savingsRate,
      },
      emergencyFund: {
        months: emergencyMonths,
        status: emergencyStatus,
        currentSavings: liquidSavings,
        targetAmount: monthlyExpenses * (profile?.emergencyFundTargetMonths || 6),
      },
      debtHealth: {
        emiBurdenPct: null,
        status: "not_available",
        note: "Debt Health will activate once you add a loan in the Loans & Debt module.",
      },
      investmentHealth: {
        categoriesUsed,
        concentrationWarning,
        dominantCategory,
        totalInvested,
        currentValue: totalCurrentValue,
        unrealizedGainLoss,
        unrealizedGainLossPct,
        distribution,
      },
      goalHealth,
      insights,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getFinancialXRay,
};
