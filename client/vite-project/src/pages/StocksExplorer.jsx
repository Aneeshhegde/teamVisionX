import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { LoadingState, ErrorState } from "../components/common/StateViews";
import api from "../utils/apiClient";
import "./StocksExplorer.css";

const POPULAR_TICKERS = [
  "RELIANCE",
  "TCS",
  "HDFCBANK",
  "INFY",
  "TATAMOTORS",
  "VEDL",
  "ZOMATO",
  "SWIGGY",
  "HAL",
  "WAAREEENER",
  "PREMIERENE",
  "CDSL",
  "SUZLON",
  "IREDA",
  "TITAN",
  "BAJFINANCE",
];

export const StocksExplorer = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);

  // Load detailed stock quote for a valid stock
  const loadStockDetails = useCallback(async (symbol) => {
    if (!symbol) return;
    setLoadingDetails(true);
    setError(null);
    try {
      const res = await api.get(`/api/investments/stocks/${symbol}`);
      if (res && res.data) {
        setSelectedStock(res.data);
        if (res.meta?.isSimulated !== undefined) {
          setIsSimulated(res.meta.isSimulated);
        }
      } else {
        throw new Error(`No valid stock details found for '${symbol}'.`);
      }
    } catch (err) {
      setError(err.message || `Unable to fetch stock details for '${symbol}'.`);
      setSelectedStock(null);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // Search stocks debounced
  const performSearch = useCallback(
    async (searchTerm) => {
      setLoadingSearch(true);
      try {
        const res = await api.get(
          `/api/investments/stocks/search?q=${encodeURIComponent(searchTerm)}`
        );
        if (res && res.data) {
          setResults(res.data);
          if (res.meta?.isSimulated !== undefined) {
            setIsSimulated(res.meta.isSimulated);
          }

          // If user searched for a specific term and we got matches, auto-load first match
          if (searchTerm.trim() && res.data.length > 0) {
            loadStockDetails(res.data[0].symbol);
          }
        }
      } catch (err) {
        console.error("Stock search error:", err);
      } finally {
        setLoadingSearch(false);
      }
    },
    [loadStockDetails]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Initial load default stock (RELIANCE)
  useEffect(() => {
    loadStockDetails("RELIANCE");
  }, [loadStockDetails]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  // Render SVG Chart for historical points
  const renderSparkline = (history) => {
    if (!history || history.length < 2) return null;

    const width = 600;
    const height = 180;
    const padding = 20;

    const prices = history.map((h) => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const points = history.map((item, idx) => {
      const x = padding + (idx / (history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((item.price - minPrice) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    });

    const isPositive = prices[prices.length - 1] >= prices[0];
    const strokeColor = isPositive ? "#10b981" : "#f43f5e";
    const gradientId = `gradient-${isPositive ? "green" : "rose"}`;

    const pathD = `M ${points.join(" L ")}`;
    const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

    return (
      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="stock-svg-chart">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradientId})`} />
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" />
        </svg>
        <div className="chart-axis-labels">
          <span>{history[0].date}</span>
          <span className="currency font-bold text-muted">30-Day Valuation Trend</span>
          <span>{history[history.length - 1].date}</span>
        </div>
      </div>
    );
  };

  const handleSelectStock = (sym) => {
    loadStockDetails(sym);
  };

  return (
    <AppLayout disclaimerVariant="investment">
      <div className="stocks-explorer-view">
        {/* Header */}
        <div className="stocks-header-row">
          <div>
            <div className="breadcrumb-pill">
              <span className="live-dot"></span>
              <span>INDIAN EQUITIES EXPLORER (NSE / BSE)</span>
            </div>
            <h1 className="stocks-title">Stocks Explorer</h1>
            <p className="stocks-sub">
              Search any Indian stock ticker or company name. Evaluate real-time valuation metrics (P/E, Market Cap, 52W High/Low), inspect 30-day performance trends, and track holdings directly into your Wealth Vault.
            </p>
          </div>
          <div className="data-source-pill">
            <span className="data-badge-indicator"></span>
            <span>{isSimulated ? "CERTIFIED MARKET CATALOG" : "LIVE NSE/BSE & GROWW FEED"}</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="stocks-search-section glass-panel">
          <form onSubmit={handleSearchSubmit} className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="stocks-search-input"
              placeholder="Search ANY Indian stock name or ticker (e.g. Vedanta, Tata Motors, Waaree, Premier Energies, Zomato, Swiggy, IREDA, CDSL)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setQuery("");
                  performSearch("");
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
            <button type="submit" className="search-submit-btn">
              Search
            </button>
            {loadingSearch && <span className="search-spinner">⏳</span>}
          </form>

          {/* Popular Ticker Quick-Select Chips */}
          <div className="popular-tickers-row">
            <span className="popular-label">Popular Equities:</span>
            {POPULAR_TICKERS.map((sym) => (
              <button
                key={sym}
                type="button"
                className={`ticker-chip ${selectedStock?.symbol === sym ? "active" : ""}`}
                onClick={() => {
                  setQuery(sym);
                  handleSelectStock(sym);
                }}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Search Results & Stock Detail */}
        <div className="stocks-layout-grid">
          {/* Left Column: Search Results List */}
          <div className="stocks-results-card glass-panel">
            <div className="section-card-header">
              <h3>
                {query.trim() ? `Search Results for "${query}"` : "Indian Equities"} ({results.length})
              </h3>
            </div>

            {results.length === 0 ? (
              <div className="no-stocks-found-box">
                <div className="no-stocks-icon">🔎</div>
                <h4>No Stock Found</h4>
                <p>
                  No stock found matching <strong>"{query}"</strong>. Please check your spelling or search by an authentic Indian company name or NSE ticker.
                </p>
                <div className="suggestions-prompt">
                  <span>Try searching for:</span>
                  <div className="suggested-chips-wrap">
                    {["VEDL", "WAAREEENER", "PREMIERENE", "CDSL", "TATAMOTORS", "ZOMATO"].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        className="ticker-chip"
                        onClick={() => {
                          setQuery(sym);
                          handleSelectStock(sym);
                        }}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="results-list">
                {results.map((stock) => {
                  const isSelected = selectedStock?.symbol === stock.symbol;
                  const isPositive = (stock.change || 0) >= 0;

                  return (
                    <div
                      key={stock.symbol}
                      className={`result-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectStock(stock.symbol)}
                    >
                      <div className="result-left">
                        <span className="result-sym">{stock.symbol}</span>
                        <span className="result-name">{stock.name}</span>
                        <span className="result-sector-tag">{stock.sector}</span>
                      </div>
                      <div className="result-right">
                        <span className="currency result-price">
                          {stock.price > 0
                            ? `₹${Number(stock.price).toLocaleString("en-IN")}`
                            : "Live Quote"}
                        </span>
                        {stock.price > 0 ? (
                          <span
                            className={`change-tag ${
                              isPositive ? "text-teal" : "text-rose"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {stock.changePct}%
                          </span>
                        ) : (
                          <span className="change-tag text-teal">NSE / BSE</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Stock Deep-Dive */}
          <div className="stocks-detail-column">
            {loadingDetails ? (
              <div className="glass-panel" style={{ padding: "40px" }}>
                <LoadingState message="Fetching live valuation metrics and 30-day price trendline..." />
              </div>
            ) : error ? (
              <div className="glass-panel error-view-box">
                <ErrorState
                  title="Stock Details Unavailable"
                  message={error}
                  onRetry={() => handleSelectStock("RELIANCE")}
                />
              </div>
            ) : selectedStock ? (
              <div className="stock-detail-card glass-panel">
                {/* Header Info */}
                <div className="detail-header">
                  <div>
                    <div className="detail-symbol-row">
                      <h2 className="detail-symbol">{selectedStock.symbol}</h2>
                      <span className="badge badge-blue">{selectedStock.sector}</span>
                      <span className="badge badge-amber">NSE / BSE</span>
                      <span className="badge badge-green">Live Exchange</span>
                    </div>
                    <p className="detail-company-name">{selectedStock.name}</p>
                  </div>

                  <div className="detail-price-box">
                    <div className="detail-price currency">
                      ₹{Number(selectedStock.price).toLocaleString("en-IN")}
                    </div>
                    <div
                      className={`detail-change ${
                        (selectedStock.change || 0) >= 0 ? "text-teal" : "text-rose"
                      }`}
                    >
                      {(selectedStock.change || 0) >= 0 ? "▲ +" : "▼ "}
                      ₹{Math.abs(selectedStock.change || 0)} ({selectedStock.changePct}%)
                    </div>
                  </div>
                </div>

                {/* 30-Day Trend Chart */}
                <div className="detail-chart-box">
                  <div className="chart-header">
                    <h4>📊 30-Day Price Trend Analysis</h4>
                    <span className="badge badge-blue">Historical Trend</span>
                  </div>
                  {renderSparkline(selectedStock.history)}
                </div>

                {/* Financial Key Metrics Grid */}
                <div className="stock-metrics-grid">
                  <div className="stat-box">
                    <span className="stat-label">P/E Ratio</span>
                    <span className="stat-val font-bold">{selectedStock.peRatio || "—"}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Market Capitalization</span>
                    <span className="stat-val font-bold">{selectedStock.marketCap || "—"}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">52-Week High</span>
                    <span className="stat-val currency text-teal">
                      ₹{Number(selectedStock.high52w || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">52-Week Low</span>
                    <span className="stat-val currency text-rose">
                      ₹{Number(selectedStock.low52w || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Daily Volume</span>
                    <span className="stat-val font-bold">{selectedStock.volume || "—"}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Dividend Yield</span>
                    <span className="stat-val font-bold">{selectedStock.dividendYield || "—"}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="stock-description-box">
                  <h4>Business Overview</h4>
                  <p>{selectedStock.description}</p>
                </div>

                {/* Quick Action Footer */}
                <div className="stock-action-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate("/wealth-vault")}
                  >
                    + Track {selectedStock.symbol} in Wealth Vault &rarr;
                  </button>
                  <Link to="/investments" className="btn btn-secondary">
                    Back to Investment Hub
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StocksExplorer;
