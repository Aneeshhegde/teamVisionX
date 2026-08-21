/**
 * Market Data Service Abstraction Layer
 * Provides stock quotes, search results, and historical simulated or real market data.
 */

const STOCKS_DATABASE = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    sector: "Energy & Conglomerate",
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
 * Generate realistic historical trendline points for a stock
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
  // Guarantee final point matches basePrice
  points[points.length - 1].price = basePrice;
  return points;
};

const searchStocks = async (query = "") => {
  const q = query.trim().toUpperCase();
  if (!q) {
    return {
      isSimulated: true,
      provider: "WealthX Synthetic Engine",
      data: STOCKS_DATABASE.slice(0, 6),
    };
  }

  const results = STOCKS_DATABASE.filter(
    (stock) =>
      stock.symbol.toUpperCase().includes(q) ||
      stock.name.toUpperCase().includes(q) ||
      stock.sector.toUpperCase().includes(q)
  );

  return {
    isSimulated: true,
    provider: "WealthX Synthetic Engine",
    data: results,
  };
};

const getStockBySymbol = async (symbol = "") => {
  const sym = symbol.trim().toUpperCase();
  const stock = STOCKS_DATABASE.find((s) => s.symbol.toUpperCase() === sym);

  if (!stock) {
    // Generate synthetic quote for any unknown valid symbol
    const syntheticPrice = Math.round(500 + Math.random() * 2500);
    const syntheticChange = Number(((Math.random() - 0.45) * 35).toFixed(2));
    const syntheticChangePct = Number(((syntheticChange / syntheticPrice) * 100).toFixed(2));

    return {
      isSimulated: true,
      provider: "WealthX Synthetic Engine",
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
        description: `Synthetic profile for ${sym}. Real market provider connection is currently unconfigured.`,
        history: generateHistoricalPoints(syntheticPrice),
      },
    };
  }

  return {
    isSimulated: true,
    provider: "WealthX Synthetic Engine",
    data: {
      ...stock,
      history: generateHistoricalPoints(stock.price),
    },
  };
};

module.exports = {
  searchStocks,
  getStockBySymbol,
};
