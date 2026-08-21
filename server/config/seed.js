const bcrypt = require("bcrypt");
const User = require("../models/User");
const FinancialProfile = require("../models/FinancialProfile");
const Asset = require("../models/Asset");
const Goal = require("../models/Goal");

const seedDefaultData = async () => {
  try {
    const demoEmail = "demo@wealthx.ai";
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      user = await User.create({
        name: "Manoj Investor",
        email: demoEmail,
        password: hashedPassword,
        role: "user",
        isOnboarded: true,
        onboardingCompletedAt: new Date(),
      });

      console.log("🌱 Seeded default demo user: demo@wealthx.ai / password123");
    }

    // Seed Profile if not present
    const existingProfile = await FinancialProfile.findOne({ userId: user._id });
    if (!existingProfile) {
      await FinancialProfile.create({
        userId: user._id,
        employmentStatus: "salaried",
        monthlyIncome: 85000,
        monthlyExpenses: 35000,
        currentSavings: 250000,
        investmentExperience: ["mutual_fund", "direct_stocks"],
        riskProfile: "moderate",
        primaryGoals: ["wealth_creation", "emergency_fund"],
        dependentsCount: 1,
        emergencyFundTargetMonths: 6,
      });
      console.log("🌱 Seeded default financial profile for demo user");
    }

    // Seed sample assets if empty
    const assetCount = await Asset.countDocuments({ userId: user._id });
    if (assetCount === 0) {
      await Asset.create([
        {
          userId: user._id,
          name: "Vedanta Ltd (VEDL)",
          category: "stock",
          investedAmount: 50000,
          currentValue: 62500,
          purchaseDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          notes: "Equities portfolio",
        },
        {
          userId: user._id,
          name: "Nifty 50 Index Mutual Fund",
          category: "mutual_fund",
          investedAmount: 100000,
          currentValue: 118000,
          purchaseDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          notes: "Core index SIP",
        },
        {
          userId: user._id,
          name: "Sovereign Gold Bond (SGB)",
          category: "gold",
          investedAmount: 40000,
          currentValue: 46000,
          purchaseDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          notes: "Inflation hedge",
        },
      ]);
      console.log("🌱 Seeded default Wealth Vault assets for demo user");
    }
  } catch (error) {
    console.warn("⚠️  Seed data check skipped:", error.message);
  }
};

module.exports = seedDefaultData;
