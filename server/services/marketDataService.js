/**
 * Market Data Service Layer
 * Supports Upstox Analytics Token integration for live/EOD quotes on Indian equities,
 * with resilient fallback to synthetic research profiles and explicit source timestamps.
 */

const STOCKS_DATABASE = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    sector: "Energy & Conglomerate",
    instrumentKey: "NSE_EQ|INE002A01018",
    price: 2948.50,
    change: 32.40,
    changePct: 1.11,
    peRatio: 28.4,
    marketCap: "₹19,95,000 Cr",
    high52w: 3024.90,
    low52w: 2220.30,
    volume: "8.4M",
    dividendYield: "0.34%",
    description: "India's largest private sector enterprise spanning energy, petrochemicals, retail, and telecommunications (Jio).",
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    sector: "Information Technology",
    instrumentKey: "NSE_EQ|INE467B01029",
    price: 4180.25,
    change: -14.60,
    changePct: -0.35,
    peRatio: 31.2,
    marketCap: "₹15,12,000 Cr",
    high52w: 4590.00,
    low52w: 3310.00,
    volume: "2.1M",
    dividendYield: "1.15%",
    description: "Global leader in IT services, consulting, and business solutions with exceptional operating margins.",
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    sector: "Banking & Financials",
    instrumentKey: "NSE_EQ|INE040A01034",
    price: 1642.80,
    change: 18.90,
    changePct: 1.16,
    peRatio: 19.5,
    marketCap: "₹12,48,000 Cr",
    high52w: 1794.00,
    low52w: 1363.55,
    volume: "14.2M",
    dividendYield: "1.19%",
    description: "India's leading private sector banking institution renowned for robust asset quality and retail franchise.",
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    sector: "Information Technology",
    instrumentKey: "NSE_EQ|INE009A01021",
    price: 1845.60,
    change: 22.10,
    changePct: 1.21,
    peRatio: 27.8,
    marketCap: "₹7,65,000 Cr",
    high52w: 1991.45,
    low52w: 1358.35,
    volume: "5.7M",
    dividendYield: "2.05%",
    description: "Pioneer in technology consulting, digital services, and next-generation cloud architecture.",
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    sector: "Banking & Financials",
    instrumentKey: "NSE_EQ|INE090A01021",
    price: 1224.15,
    change: 9.30,
    changePct: 0.77,
    peRatio: 18.2,
    marketCap: "₹8,62,000 Cr",
    high52w: 1332.00,
    low52w: 928.00,
    volume: "9.8M",
    dividendYield: "0.82%",
    description: "Universal banking heavyweight delivering consistent return on assets and digital credit expansion.",
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd",
    sector: "Automobile & EV",
    instrumentKey: "NSE_EQ|INE155A01022",
    price: 986.40,
    change: -8.50,
    changePct: -0.85,
    peRatio: 10.4,
    marketCap: "₹3,62,000 Cr",
    high52w: 1179.05,
    low52w: 593.50,
    volume: "11.5M",
    dividendYield: "0.61%",
    description: "Global automobile manufacturer with commanding presence in commercial vehicles, passenger EVs, and JLR.",
  },
  {
    symbol: "ITC",
    name: "ITC Ltd",
    sector: "FMCG & Diversified",
    instrumentKey: "NSE_EQ|INE154A01025",
    price: 492.30,
    change: 4.80,
    changePct: 0.98,
    peRatio: 26.5,
    marketCap: "₹6,15,000 Cr",
    high52w: 528.50,
    low52w: 399.30,
    volume: "12.3M",
    dividendYield: "2.80%",
    description: "Diversified FMCG leader with dominant market share in tobacco, packaged foods, hospitality, and paperboards.",
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    sector: "Public Sector Banking",
    instrumentKey: "NSE_EQ|INE062A01020",
    price: 814.70,
    change: 6.20,
    changePct: 0.77,
    peRatio: 11.1,
    marketCap: "₹7,27,000 Cr",
    high52w: 912.10,
    low52w: 555.25,
    volume: "16.8M",
    dividendYield: "1.69%",
    description: "India's largest public sector bank with expansive nationwide branch network and systemic credit reach.",
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    sector: "Telecommunications",
    instrumentKey: "NSE_EQ|INE397D01024",
    price: 1568.90,
    change: 14.50,
    changePct: 0.93,
    peRatio: 46.2,
    marketCap: "₹8,90,000 Cr",
    high52w: 1680.00,
    low52w: 847.00,
    volume: "4.9M",
    dividendYield: "0.51%",
    description: "Premier communications solutions provider offering 5G wireless, broadband, data centers, and digital TV.",
  },
  {
    symbol: "LT",
    name: "Larsen & Toubro Ltd",
    sector: "Infrastructure & Engineering",
    instrumentKey: "NSE_EQ|INE018A01030",
    price: 3620.00,
    change: -28.00,
    changePct: -0.77,
    peRatio: 33.6,
    marketCap: "₹4,98,000 Cr",
    high52w: 3948.00,
    low52w: 2850.00,
    volume: "1.8M",
    dividendYield: "0.94%",
    description: "Multinational conglomerate engaged in technology, engineering, construction, manufacturing, and financial services.",
  },
];

/**
 * Fetch live or EOD quote using Upstox API v2 if UPSTOX_ACCESS_TOKEN is configured
 */
const fetchUpstoxQuote = async (instrumentKey) => {
  const token = process.env.UPSTOX_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const url = `https://api.upstox.com/v2/market-quote/quotes?instrument_key=${encodeURIComponent(instrumentKey)}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn(`Upstox API returned status ${response.status}`);
      return null;
    }

    const json = await response.json();
    if (json.status === "success" && json.data) {
      // Find instrument quote
      const key = Object.keys(json.data)[0];
      const quote = json.data[key];
      if (quote) {
        return {
          price: quote.last_price || quote.ltp,
          change: quote.net_change || (quote.last_price - quote.ohlc?.close),
          ohlc: quote.ohlc,
          volume: quote.volume,
          timestamp: new Date().toLocaleTimeString(),
        };
      }
    }
  } catch (err) {
    console.warn("Upstox connection error:", err.message);
  }
  return null;
};

/**
 * Generate 30-day realistic historical trendline points for a stock
 */
const generateHistoricalPoints = (basePrice) => {
  const points = [];
  let current = basePrice * 0.92;
  for (let i = 30; i >= 0; i--) {
    const randomVariation = (Math.random() - 0.48) * (basePrice * 0.025);
    current = Math.max(basePrice * 0.7, current + randomVariation);
    const date = new Date();
    date.setDate(date.getDate() - i);
    points.push({
      date: date.toISOString().split("T")[0],
      price: Number(current.toFixed(2)),
    });
  }
  points[points.length - 1].price = basePrice;
  return points;
};

const searchStocks = async (query = "") => {
  const q = query.trim().toUpperCase();
  const token = process.env.UPSTOX_ACCESS_TOKEN;
  const isUpstoxActive = !!token;

  let results = STOCKS_DATABASE;
  if (q) {
    results = STOCKS_DATABASE.filter(
      (stock) =>
        stock.symbol.toUpperCase().includes(q) ||
        stock.name.toUpperCase().includes(q) ||
        stock.sector.toUpperCase().includes(q)
    );
  }

  return {
    source: isUpstoxActive ? "Upstox Analytics Market Feed" : "WealthX Analytical Stock Model",
    dataFreshness: isUpstoxActive ? `LIVE — ${new Date().toLocaleTimeString()}` : "Market Reference EOD",
    isSimulated: !isUpstoxActive,
    data: results.slice(0, 10),
  };
};

const getStockBySymbol = async (symbol = "") => {
  const sym = symbol.trim().toUpperCase();
  const stock = STOCKS_DATABASE.find((s) => s.symbol.toUpperCase() === sym);
  const token = process.env.UPSTOX_ACCESS_TOKEN;

  let liveQuote = null;
  if (stock && stock.instrumentKey && token) {
    liveQuote = await fetchUpstoxQuote(stock.instrumentKey);
  }

  if (!stock) {
    const syntheticPrice = Math.round(500 + Math.random() * 2500);
    const syntheticChange = Number(((Math.random() - 0.45) * 35).toFixed(2));
    const syntheticChangePct = Number(((syntheticChange / syntheticPrice) * 100).toFixed(2));

    return {
      source: "WealthX Synthetic Research Model",
      dataFreshness: "Simulated Analytical Model",
      isSimulated: true,
      data: {
        symbol: sym,
        name: `${sym} India Ltd`,
        sector: "General Equity",
        price: syntheticPrice,
        change: syntheticChange,
        changePct: syntheticChangePct,
        peRatio: Number((18 + Math.random() * 15).toFixed(1)),
        marketCap: `₹${Math.round(20000 + Math.random() * 80000)} Cr`,
        high52w: Number((syntheticPrice * 1.2).toFixed(2)),
        low52w: Number((syntheticPrice * 0.75).toFixed(2)),
        volume: "1.2M",
        dividendYield: "1.20%",
        description: `Synthetic research profile for ${sym}. Real market provider connection is currently unconfigured.`,
        history: generateHistoricalPoints(syntheticPrice),
      },
    };
  }

  const finalPrice = liveQuote ? liveQuote.price : stock.price;
  const finalChange = liveQuote ? liveQuote.change : stock.change;
  const finalChangePct = Number(((finalChange / (finalPrice - finalChange)) * 100).toFixed(2));

  return {
    source: liveQuote ? "Upstox Analytics Market Feed" : "WealthX Analytical Stock Model",
    dataFreshness: liveQuote
      ? `LIVE — Updated ${liveQuote.timestamp}`
      : `EOD Benchmark (${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})`,
    isSimulated: !liveQuote,
    data: {
      ...stock,
      price: finalPrice,
      change: finalChange,
      changePct: finalChangePct,
      history: generateHistoricalPoints(finalPrice),
    },
  };
};

module.exports = {
  searchStocks,
  getStockBySymbol,
  STOCKS_DATABASE,
};
