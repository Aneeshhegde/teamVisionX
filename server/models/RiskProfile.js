const mongoose = require("mongoose");

const riskProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    profileCategory: {
      type: String,
      enum: ["conservative", "moderate", "moderate_growth", "growth", "aggressive"],
      required: true,
    },
    categoryLabel: {
      type: String,
      default: "Moderate Growth",
    },
    riskTolerance: {
      type: String,
      default: "Medium",
    },
    riskCapacity: {
      type: String,
      default: "Moderate",
    },
    investmentHorizonYears: {
      type: Number,
      default: 7,
    },
    recommendedAllocation: {
      equityPct: { type: Number, default: 55, min: 0, max: 100 },
      debtPct: { type: Number, default: 25, min: 0, max: 100 },
      goldPct: { type: Number, default: 10, min: 0, max: 100 },
      cashPct: { type: Number, default: 10, min: 0, max: 100 },
    },
    assessmentAnswers: {
      ageGroup: String,
      incomeStability: String,
      emergencyBuffer: String,
      investmentExperience: String,
      timeHorizon: String,
      marketReaction: String,
      primaryGoal: String,
      lossComfort: String,
    },
  },
  {
    timestamps: true,
  }
);

const RiskProfile = mongoose.model("RiskProfile", riskProfileSchema);

module.exports = RiskProfile;
