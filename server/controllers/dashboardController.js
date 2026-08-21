const FinancialProfile = require("../models/FinancialProfile");
const User = require("../models/User");
const Asset = require("../models/Asset");
const Goal = require("../models/Goal");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Get aggregated dashboard statistics and command center overview
 */
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("name email role isOnboarded createdAt");
    const profile = await FinancialProfile.findOne({ userId });
    const assets = await Asset.find({ userId });
    const goals = await Goal.find({ userId });

    // Calculate aggregated asset values
    let totalInvestmentsValue = 0;
    let totalInvestedPrincipal = 0;
    assets.forEach((asset) => {
      totalInvestmentsValue += Number(asset.currentValue || 0);
      totalInvestedPrincipal += Number(asset.investedAmount || 0);
    });

    const income = profile?.monthlyIncome || 0;
    const expenses = profile?.monthlyExpenses || 0;
    const savings = profile?.currentSavings || 0;
    const netSavingsPerMonth = Math.max(0, income - expenses);
    const savingsRate = income > 0 ? Math.round((netSavingsPerMonth / income) * 100) : 0;
    const expenseRatio = income > 0 ? Math.round((expenses / income) * 100) : 0;
    const emergencyFundMonths = expenses > 0 ? Number((savings / expenses).toFixed(1)) : 0;

    const totalAssets = savings + totalInvestmentsValue;
    const totalLiabilities = 0;
    const netWorth = totalAssets - totalLiabilities;

    // Calculate a comprehensive Financial Health Score (0 - 100)
    let score = 50; // base score
    if (!profile) {
      score = assets.length > 0 ? 55 : 45;
    } else {
      if (savingsRate >= 30) score += 15;
      else if (savingsRate >= 15) score += 8;
      else if (savingsRate < 5) score -= 10;

      if (emergencyFundMonths >= 6) score += 20;
      else if (emergencyFundMonths >= 3) score += 10;
      else score -= 15;

      if (expenseRatio <= 50) score += 10;
      else if (expenseRatio > 80) score -= 15;

      if (assets.length >= 3) score += 5;
      if (goals.length >= 1) score += 5;
    }

    const healthScore = Math.min(100, Math.max(10, score));

    // Dynamic intelligent alerts
    const recentAlerts = [];
    if (!profile) {
      recentAlerts.push({
        id: "onboarding-reminder",
        type: "info",
        title: "Calibrate Financial Profile",
        message: "Complete the 2-minute calibration to unlock precise cash flow analysis, emergency runway, and debt health diagnostics.",
        link: "/onboarding",
      });
    } else {
      if (emergencyFundMonths < 3) {
        recentAlerts.push({
          id: "low-emergency-fund",
          type: "warning",
          title: "Emergency Runway Alert",
          message: `Your emergency fund covers ${emergencyFundMonths} months. We recommend building at least 3 to 6 months of expenses (₹${(expenses * 6).toLocaleString("en-IN")}).`,
          link: "/financial-xray",
        });
      }
      if (expenseRatio > 70) {
        recentAlerts.push({
          id: "high-expense-ratio",
          type: "warning",
          title: "High Burn Rate",
          message: `You are spending ${expenseRatio}% of your monthly income. Aiming for 50-60% will accelerate your wealth compounding.`,
          link: "/financial-xray",
        });
      }
      if (savingsRate >= 30) {
        recentAlerts.push({
          id: "great-savings-rate",
          type: "success",
          title: "Strong Savings Momentum",
          message: `Excellent! You are saving ${savingsRate}% of your income. Consider allocating surplus to disciplined SIP investments.`,
          link: "/investments/sip",
        });
      }
    }

    if (assets.length === 0) {
      recentAlerts.push({
        id: "no-assets-vault",
        type: "info",
        title: "Consolidate Your Portfolio",
        message: "Your Wealth Vault is empty. Track stocks, mutual funds, gold, and FDs to see your full financial blueprint.",
        link: "/wealth-vault",
      });
    }

    return sendSuccess(res, {
      user,
      isOnboarded: Boolean(user?.isOnboarded || profile),
      metrics: {
        monthlyIncome: income,
        monthlyExpenses: expenses,
        monthlySurplus: netSavingsPerMonth,
        currentSavings: savings,
        totalInvestments: totalInvestmentsValue,
        totalInvestedPrincipal,
        netWorth,
        totalAssets,
        totalLiabilities,
        savingsRate,
        expenseRatio,
        emergencyFundMonths,
        healthScore,
        assetsCount: assets.length,
        goalsCount: goals.length,
      },
      profile: {
        employmentStatus: profile?.employmentStatus || "salaried",
        riskProfile: profile?.riskProfile || "moderate",
        investmentExperience: profile?.investmentExperience || [],
        primaryGoals: profile?.primaryGoals || [],
      },
      recentAlerts,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getDashboardData,
};
