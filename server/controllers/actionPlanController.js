const FinancialProfile = require("../models/FinancialProfile");
const Asset = require("../models/Asset");
const Goal = require("../models/Goal");
const { enrichGoal } = require("./goalController");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Generate prioritized action plan items based on user's real financial standing
 */
const getActionPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await FinancialProfile.findOne({ userId });
    const assets = await Asset.find({ userId });
    const goals = await Goal.find({ userId });

    const actionItems = [];

    // Rule 0: Onboarding incomplete
    if (!profile) {
      actionItems.push({
        id: "calibrate-profile",
        title: "Calibrate Financial Profile",
        priority: "high",
        explanation: "Your financial blueprint is not yet calibrated. Complete your profile to unlock precision analytics.",
        actionRoute: "/onboarding",
        actionText: "Start Calibration →",
      });
      return sendSuccess(res, actionItems);
    }

    const expenses = profile.monthlyExpenses || 0;
    const income = profile.monthlyIncome || 0;
    const savings = profile.currentSavings || 0;
    const emergencyMonths = expenses > 0 ? Number((savings / expenses).toFixed(1)) : 0;
    const expenseRatio = income > 0 ? Math.round((expenses / income) * 100) : 0;

    // Rule 1: Emergency Fund < 3 months -> HIGH
    if (emergencyMonths < 3) {
      actionItems.push({
        id: "build-emergency-fund",
        title: "Fortify Emergency Reserve",
        priority: "high",
        explanation: `Your tracked liquid reserves cover ${emergencyMonths} months of living expenses. Standard resilient targets suggest establishing 3 to 6 months of buffer.`,
        actionRoute: "/financial-xray",
        actionText: "Inspect Liquid Runway →",
      });
    }

    // Rule 2: High Burn Rate -> HIGH
    if (expenseRatio > 70) {
      actionItems.push({
        id: "optimize-cashflow",
        title: "Optimize Monthly Expense Burn",
        priority: "high",
        explanation: `Current monthly outflows account for ${expenseRatio}% of income, leaving a narrow margin for disciplined compounding.`,
        actionRoute: "/financial-xray",
        actionText: "Review Cash Flow →",
      });
    }

    // Rule 3: Behind Schedule Goals -> MEDIUM
    const enrichedGoals = goals.map(enrichGoal);
    const behindGoals = enrichedGoals.filter((g) => g.status === "behind_schedule");

    behindGoals.forEach((bg) => {
      actionItems.push({
        id: `goal-recalibrate-${bg._id}`,
        title: `Recalibrate Goal: ${bg.title}`,
        priority: "medium",
        explanation: `Milestone is currently pacing behind schedule. Adjust monthly allocation to ₹${bg.requiredMonthlyContribution.toLocaleString("en-IN")}/mo or extend the target date.`,
        actionRoute: "/goals",
        actionText: "Adjust Goal Milestones →",
      });
    });

    // Rule 4: No goals created yet -> MEDIUM
    if (goals.length === 0) {
      actionItems.push({
        id: "create-first-goal",
        title: "Define Target Financial Milestones",
        priority: "medium",
        explanation: "Structuring specific financial milestones gives systematic direction to monthly surplus savings.",
        actionRoute: "/goals",
        actionText: "Create First Goal →",
      });
    }

    // Rule 5: Zero assets in vault -> MEDIUM
    if (assets.length === 0) {
      actionItems.push({
        id: "seed-wealth-vault",
        title: "Consolidate Portfolio in Wealth Vault",
        priority: "medium",
        explanation: "Track mutual funds, stocks, fixed deposits, and gold holdings to obtain an accurate consolidated net worth.",
        actionRoute: "/wealth-vault",
        actionText: "Add First Asset →",
      });
    }

    // Rule 6: Asset concentration warning -> LOW
    if (assets.length > 1) {
      let totalCurrentValue = 0;
      const catMap = {};
      assets.forEach((a) => {
        totalCurrentValue += Number(a.currentValue || 0);
        catMap[a.category] = (catMap[a.category] || 0) + Number(a.currentValue || 0);
      });

      Object.entries(catMap).forEach(([cat, val]) => {
        const pct = totalCurrentValue > 0 ? Math.round((val / totalCurrentValue) * 100) : 0;
        if (pct >= 65) {
          actionItems.push({
            id: `diversify-${cat}`,
            title: `Review ${cat.replace("_", " ").toUpperCase()} Concentration`,
            priority: "low",
            explanation: `${pct}% of your recorded portfolio value is currently concentrated in ${cat.replace("_", " ")}. Consider evaluating broader asset classes.`,
            actionRoute: "/wealth-vault",
            actionText: "Review Allocation →",
          });
        }
      });
    }

    // Rule 7: Explore disciplined investment compounding -> LOW
    if (income > expenses && assets.length > 0) {
      actionItems.push({
        id: "explore-sip-growth",
        title: "Automate Systematic Compounding",
        priority: "low",
        explanation: "Harness rupee cost averaging and disciplined monthly compounding by exploring index and SIP growth avenues.",
        actionRoute: "/investments/sip",
        actionText: "Explore SIPs & Funds →",
      });
    }

    return sendSuccess(res, actionItems);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getActionPlan,
};
