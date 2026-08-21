const RiskProfile = require("../models/RiskProfile");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const TRENDING_HYPE_DATABASE = {
  "dogecoin": {
    name: "Dogecoin / Memecoins",
    category: "Crypto Speculation",
    hypeScore: 92,
    status: "high_hype",
    statusLabel: "🔴 High Hype / Extreme Speculation",
    summary: "Memecoin value is almost entirely driven by social media viral cycles, celebrity endorsements, and speculative momentum with negligible underlying cash flows.",
    metrics: {
      fundamentalStrength: { score: 10, label: "Very Weak", detail: "Zero cashflow generation, unlimited inflationary coin supply." },
      valuationSanity: { score: 15, label: "Detached", detail: "Price reflects speculative liquidity rather than intrinsic discounted cash flow." },
      volatility: { score: 95, label: "Extreme", detail: "Historical drawdowns frequently exceed 80-90% in bear cycles." },
      evidenceQuality: { score: 15, label: "Low", detail: "No institutional balance sheet utility or regulatory consumer safeguards." },
      socialFrenzy: { score: 95, label: "Frenzied", detail: "High retail FOMO on TikTok/Twitter/Reddit forums." },
      portfolioFit: { score: 10, label: "High Risk", detail: "Limit speculative allocations to <1% of total net worth." },
    },
    recommendation: "Treat as pure recreational speculation rather than a long-term retirement investment.",
  },
  "nifty50": {
    name: "Nifty 50 Index Fund",
    category: "Broad Market Index",
    hypeScore: 12,
    status: "evidence_backed",
    statusLabel: "🟢 Evidence-Backed Core Asset",
    summary: "Backed by the earnings, dividends, and governance of the 50 largest blue-chip enterprises driving India's GDP growth.",
    metrics: {
      fundamentalStrength: { score: 90, label: "Institutional", detail: "Aggregate Return on Equity >15% across diversified sectors." },
      valuationSanity: { score: 75, label: "Fairly Valued", detail: "P/E trades within historical 10-year mean bands." },
      volatility: { score: 35, label: "Moderate", detail: "Broad diversification cushions single-stock black swan risks." },
      evidenceQuality: { score: 95, label: "Academic Standard", detail: "Decades of peer-reviewed empirical evidence validate low-cost index compounding." },
      socialFrenzy: { score: 20, label: "Subdued", detail: "Unexciting, disciplined compounding." },
      portfolioFit: { score: 95, label: "Core Holding", detail: "Ideal foundational cornerstone for all Risk DNA profiles." },
    },
    recommendation: "High-conviction core wealth building asset via systematic monthly SIP compounding.",
  },
  "options_trading": {
    name: "F&O Intraday Options Trading",
    category: "Derivatives Trading",
    hypeScore: 88,
    status: "high_hype",
    statusLabel: "🔴 High Hype / Heavy Retail Loss Rate",
    summary: "SEBI empirical studies show 93% of retail derivative traders lose money with average losses exceeding ₹1.25 Lakhs.",
    metrics: {
      fundamentalStrength: { score: 20, label: "Zero-Sum", detail: "Derivatives are zero-sum contracts with significant brokerage/tax frictions." },
      valuationSanity: { score: 25, label: "Negative Expectancy", detail: "Time decay (theta) rapidly erodes out-of-the-money option values." },
      volatility: { score: 98, label: "Catastrophic Risk", detail: "Leverage allows 100% total capital loss in minutes." },
      evidenceQuality: { score: 90, label: "SEBI Verified Risk", detail: "SEBI official study confirms 9 out of 10 retail traders register net losses." },
      socialFrenzy: { score: 92, label: "High Course Hype", detail: "Proliferation of unregulated telegram tips and screenshot marketing." },
      portfolioFit: { score: 5, label: "Incompatible", detail: "Incompatible with disciplined long-term wealth compounding." },
    },
    recommendation: "Avoid retail option buying schemes. Prioritize direct index compounding.",
  },
  "gold_etf": {
    name: "Digital Gold / Gold ETFs",
    category: "Precious Metals",
    hypeScore: 28,
    status: "evidence_backed",
    statusLabel: "🟢 Evidence-Backed Wealth Hedge",
    summary: "Physical gold backed with 99.5% purity, zero making charges, and transparent exchange liquidity.",
    metrics: {
      fundamentalStrength: { score: 75, label: "Sovereign Store", detail: "5,000 years of monetary history protecting purchasing power." },
      valuationSanity: { score: 70, label: "Market Driven", detail: "Directly mirrors LBMA international gold spot price." },
      volatility: { score: 40, label: "Defensive", detail: "Negative correlation to equities during geopolitical crises." },
      evidenceQuality: { score: 90, label: "Audited", detail: "Audited vault storage monitored by SEBI regulated trustees." },
      socialFrenzy: { score: 30, label: "Traditional", detail: "Steady cultural and macroeconomic asset." },
      portfolioFit: { score: 85, label: "Recommended Hedge", detail: "5-10% portfolio allocation provides portfolio resilience." },
    },
    recommendation: "Maintain 5-10% of total wealth in Gold ETFs or SGBs as a non-correlated shock absorber.",
  },
};

/**
 * Evaluate Hype Score and fundamentals for an asset or query
 */
const analyzeHype = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.body;

    if (!query) {
      return sendError(res, "Please provide an asset, ticker, or financial topic to analyze", 400);
    }

    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Check database match
    let match = null;
    for (const [k, v] of Object.entries(TRENDING_HYPE_DATABASE)) {
      if (cleanQuery.includes(k) || k.includes(cleanQuery)) {
        match = v;
        break;
      }
    }

    // If not in database, generate a structured analytical evaluation
    if (!match) {
      const isCrypto = /crypto|coin|token|nft|solana|bitcoin|meme/i.test(query);
      const isDerivative = /f&o|future|option|trading|intraday|forex/i.test(query);
      const isPenny = /penny|smallcap|multibagger|tip|circuit/i.test(query);

      let score = 50;
      let status = "caution";
      let statusLabel = "🟡 Requires Caution & Verification";

      if (isCrypto || isDerivative || isPenny) {
        score = 82;
        status = "high_hype";
        statusLabel = "🔴 High Speculation / High Hype";
      } else {
        score = 42;
        status = "caution";
        statusLabel = "🟡 Requires Caution & Verification";
      }

      match = {
        name: query,
        category: isCrypto ? "Crypto / Digital Asset" : isDerivative ? "Leveraged Trading" : "Public Equities",
        hypeScore: score,
        status,
        statusLabel,
        summary: `Preliminary structural assessment of "${query}". Verify balance sheet fundamentals, historical volatility, and liquidity before allocating capital.`,
        metrics: {
          fundamentalStrength: { score: 100 - score, label: score > 60 ? "Speculative" : "Moderate", detail: "Assess audited earnings, debt-to-equity, and operating cash flow." },
          valuationSanity: { score: 100 - score, label: "Requires Scrutiny", detail: "Compare P/E, P/B, and PEG against sector peers." },
          volatility: { score, label: score > 60 ? "Elevated" : "Moderate", detail: "Measure beta and historical maximum drawdown in adverse market climates." },
          evidenceQuality: { score: 50, label: "Moderate", detail: "Verify statutory SEBI disclosures and auditor track record." },
          socialFrenzy: { score, label: score > 60 ? "Viral" : "Normal", detail: "Check social media discussion volume vs. institutional filings." },
          portfolioFit: { score: 100 - score, label: "Discretionary", detail: "Ensure allocation aligns with your Risk DNA posture." },
        },
        recommendation: "Perform comprehensive fundamental diligence and verify audited reports on NSE/BSE before committing capital.",
      };
    }

    return sendSuccess(res, {
      ...match,
      engineTag: "SIMULATED / SYNTHETIC ANALYTICAL ENGINE",
      disclaimer: "WealthX Hype Check is an educational analytical framework evaluating structural risk patterns. It does not provide real-time market quotes or buy/sell recommendations.",
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getTrendingTopics = async (req, res) => {
  const topics = Object.entries(TRENDING_HYPE_DATABASE).map(([key, val]) => ({
    key,
    name: val.name,
    category: val.category,
    hypeScore: val.hypeScore,
    status: val.status,
    statusLabel: val.statusLabel,
  }));
  return sendSuccess(res, topics);
};

module.exports = {
  analyzeHype,
  getTrendingTopics,
};
