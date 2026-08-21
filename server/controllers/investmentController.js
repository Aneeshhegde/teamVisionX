const { searchStocks, getStockBySymbol } = require("../services/marketDataService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const EDUCATIONAL_MODULES = {
  stocks: {
    category: "stocks",
    title: "Stocks Explorer & Equities",
    tagline: "Direct ownership stakes in publicly listed enterprises.",
    whatIsIt:
      "Equity shares represent fractional ownership in a publicly traded corporation. Share values fluctuate based on earnings performance, macroeconomic trends, and supply-demand market dynamics.",
    riskLevel: "High / Market-Linked",
    liquidity: "High (T+1 Settlement on Indian Exchanges NSE/BSE)",
    typicalHorizon: "5+ Years (Long-Term Capital Appreciation)",
    advantages: [
      "Highest potential for inflation-beating long term compounding returns.",
      "Eligible for periodic dividend payouts and corporate bonus issues.",
      "Direct voting rights and ownership alignment in high-growth companies.",
      "Instant market liquidity during exchange trading hours.",
    ],
    risks: [
      "Short-term capital volatility and drawdowns during market corrections.",
      "Company-specific business and executive management risks.",
      "Requires active research or fundamental valuation expertise.",
    ],
    importantFactors: [
      "Evaluate fundamental health: Price-to-Earnings (P/E), Return on Equity (ROE), and Debt-to-Equity ratios.",
      "Avoid emotional impulsive trades or speculative penny-stock chasing.",
      "Maintain broad sector diversification across large, mid, and small-cap buckets.",
    ],
  },
  sip: {
    category: "sip",
    title: "Systematic Investment Plans (SIP) & Mutual Funds",
    tagline: "Disciplined automated investing across professionally managed asset pools.",
    whatIsIt:
      "A Systematic Investment Plan (SIP) allows you to invest fixed sums periodically (monthly or weekly) into mutual fund schemes managed by certified Asset Management Companies (AMCs).",
    riskLevel: "Moderate to High (Depending on Equity vs Debt fund mix)",
    liquidity: "High (Open-ended funds redeemable within 2-3 business days; ELSS has a 3-year lock-in)",
    typicalHorizon: "3 to 7+ Years",
    advantages: [
      "Rupee Cost Averaging automatically buys more units during market dips.",
      "Professional fund management and research pedigree.",
      "Enforces strict financial discipline without needing to time the market.",
      "ELSS mutual funds offer tax exemptions under Section 80C.",
    ],
    risks: [
      "Mutual funds are subject to broader equity and market fluctuations.",
      "Expense ratio and exit load fees can slightly impact net compound returns.",
      "Fund manager divergence or style drift.",
    ],
    importantFactors: [
      "Check the fund's expense ratio, AUM size, and 5-year rolling alpha.",
      "Align fund categories (Large Cap, Flexi Cap, Hybrid) with your personal risk tolerance.",
      "Implement an annual Step-Up SIP (e.g., +10% annually) to match salary increments.",
    ],
  },
  gold: {
    category: "gold",
    title: "Digital Gold & Sovereign Gold Bonds (SGB)",
    tagline: "Time-tested geopolitical hedge and capital preservation instrument.",
    whatIsIt:
      "Digital Gold and Sovereign Gold Bonds allow investors to capture pure 24K gold price movements electronically without the burdens of physical storage, making charges, or theft risks.",
    riskLevel: "Low to Moderate (Subject to global gold price cycle)",
    liquidity: "Moderate to High (Digital Gold 24/7; SGB secondary market exchange-traded)",
    typicalHorizon: "5 to 8 Years",
    advantages: [
      "Exceptional hedge against currency depreciation and systemic inflation.",
      "Sovereign Gold Bonds offer 2.5% p.a. additional interest and tax-free maturity.",
      "Eliminates jeweler making charges and purity verification issues.",
      "Fractional purchase capability (start with as low as ₹100).",
    ],
    risks: [
      "Does not generate ongoing business cash flow (unlike dividend-paying stocks).",
      "Gold cycles can experience extended multi-year consolidation phases.",
      "Currency strength (USD/INR) directly influences domestic landed prices.",
    ],
    importantFactors: [
      "Target allocating 5% - 10% of your total portfolio as an emergency safe-haven allocation.",
      "Prefer Sovereign Gold Bonds (RBI issued) over physical jewellery for purely financial investment goals.",
    ],
  },
  fd: {
    category: "fd",
    title: "Fixed Deposits (FD) & Guaranteed Term Savings",
    tagline: "Predictable, capital-guaranteed returns for short-to-medium horizons.",
    whatIsIt:
      "A Fixed Deposit is a financial instrument provided by scheduled commercial banks and NBFCs where an investor deposits funds for a pre-determined tenure at an agreed, fixed rate of interest.",
    riskLevel: "Very Low (DICGC insured up to ₹5 Lakhs per depositor per bank)",
    liquidity: "High (Instant premature withdrawal available subject to small penalty)",
    typicalHorizon: "6 Months to 3 Years (Ideal for emergency buffers & short goals)",
    advantages: [
      "100% capital guarantee and locked-in interest certainty.",
      "Senior citizens receive an additional 0.50% - 0.75% interest yield.",
      "Can serve as collateral to secure low-interest credit cards or overdraft loans.",
      "Zero market volatility or price fluctuation risk.",
    ],
    risks: [
      "Real post-tax returns can struggle to outpace core retail inflation.",
      "Interest income is fully taxable according to your marginal income tax slab.",
      "Premature liquidation typically incurs 0.5% - 1% interest rate penalties.",
    ],
    importantFactors: [
      "Compare scheduled commercial bank rates vs top AAA-rated corporate FDs.",
      "Use FD ladders (staggered maturities) to maintain liquidity and reinvestment flexibility.",
    ],
  },
  bonds: {
    category: "bonds",
    title: "Government & Sovereign Debt Securities",
    tagline: "Sovereign-backed fixed-income yield for ultra-conservative preservation.",
    whatIsIt:
      "Government Bonds (G-Secs, T-Bills, State Development Loans) are sovereign debt issuances by the Government of India or State Governments to fund developmental expenditures, guaranteeing periodic coupon interest and principal repayment.",
    riskLevel: "Lowest Default Risk (Sovereign Sovereign Credit Backing)",
    liquidity: "Moderate (Exchanged on RBI Retail Direct and secondary bond platforms)",
    typicalHorizon: "1 Year to 10+ Years",
    advantages: [
      "Zero credit default risk on Central Government issuances.",
      "Predictable semi-annual coupon payments for reliable cash flow.",
      "Higher yield potential than typical savings accounts or short term bank deposits.",
      "Direct retail participation enabled via RBI Retail Direct portal.",
    ],
    risks: [
      "Secondary bond prices fall when prevailing market interest rates rise.",
      "Lower retail liquidity compared to high-volume Nifty equity markets.",
    ],
    importantFactors: [
      "Hold bonds to maturity to eliminate interest rate price volatility risk entirely.",
      "Understand Modified Duration when investing in long-dated sovereign papers.",
    ],
  },
  etfs: {
    category: "etfs",
    title: "Index Funds & Exchange Traded Funds (ETFs)",
    tagline: "Low-cost passive replication of leading market indices like Nifty 50.",
    whatIsIt:
      "Index funds and ETFs passively replicate broad benchmark indices (e.g. Nifty 50, Nifty Bank, S&P BSE Sensex). They eliminate human fund manager bias and deliver pure market-matching returns at ultra-low expense ratios.",
    riskLevel: "Moderate to High (Exact replica of underlying index risk)",
    liquidity: "High (Traded in real-time on stock exchanges like individual shares)",
    typicalHorizon: "5+ Years",
    advantages: [
      "Ultra-low expense ratios (often 0.05% - 0.20% vs 1.5%+ for active funds).",
      "Instant diversification across India's top 50 corporate blue-chips in a single unit.",
      "Zero fund manager performance risk or style drifting.",
      "High transparency: portfolio constituents match published exchange indices daily.",
    ],
    risks: [
      "Will mirror 100% of market downturns (no cash cushion during bear phases).",
      "ETFs can have slight tracking errors or intraday bid-ask spreads.",
    ],
    importantFactors: [
      "Check tracking error and daily traded volume when selecting an ETF.",
      "Index investing is ideal for core, long-term multi-decade wealth compounding.",
    ],
  },
};

/**
 * Search stocks proxy
 */
const getStocksSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const result = await searchStocks(q || "");
    return sendSuccess(res, result.data, "Stocks retrieved", 200, {
      isSimulated: result.isSimulated,
      provider: result.provider,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get individual stock details by symbol (valid stocks only)
 */
const getStockDetails = async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await getStockBySymbol(symbol);
    if (!result.data) {
      return sendError(
        res,
        `No valid stock found matching ticker '${symbol}'. Please search with a valid certified stock symbol.`,
        404
      );
    }
    return sendSuccess(res, result.data, `Stock details for ${symbol}`, 200, {
      isSimulated: result.isSimulated,
      provider: result.provider,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get structured educational module content
 */
const getEducationalContent = async (req, res) => {
  try {
    const { category } = req.params;
    const content = EDUCATIONAL_MODULES[category.toLowerCase()];

    if (!content) {
      return sendError(res, `Educational module '${category}' not found`, 404);
    }

    return sendSuccess(res, content, "Educational content retrieved");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get all available educational modules summary
 */
const getAllModules = async (req, res) => {
  try {
    const summaryList = Object.values(EDUCATIONAL_MODULES).map((mod) => ({
      category: mod.category,
      title: mod.title,
      tagline: mod.tagline,
      riskLevel: mod.riskLevel,
      typicalHorizon: mod.typicalHorizon,
    }));

    return sendSuccess(res, summaryList, "Investment modules list");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getStocksSearch,
  getStockDetails,
  getEducationalContent,
  getAllModules,
};
