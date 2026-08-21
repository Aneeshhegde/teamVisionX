import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "../components/layout/AppLayout";
import ProgressRing from "../components/charts/ProgressRing";
import { LoadingState, ErrorState } from "../components/common/StateViews";
import api from "../utils/apiClient";
import "./HypeCheck.css";

export const HypeCheck = () => {
  const [query, setQuery] = useState("nifty50");
  const [trending, setTrending] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await api.get("/api/hype-check/trending");
      if (res && res.data) {
        setTrending(res.data);
      }
    } catch (err) {
      console.error("Failed to load trending hype topics:", err);
    }
  }, []);

  const analyzeAsset = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/hype-check/analyze", { query: q });
      if (res && res.data) {
        setResult(res.data);
      } else {
        throw new Error(res.message || "Failed to analyze hype score.");
      }
    } catch (err) {
      setError(err.message || "Hype evaluation engine offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
    analyzeAsset("nifty50");
  }, []);

  const handleSelectTrending = (key) => {
    setQuery(key);
    analyzeAsset(key);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    analyzeAsset(query);
  };

  const getHypeColor = (score) => {
    if (score > 65) return "#f43f5e"; // Red (High Hype)
    if (score > 30) return "#f59e0b"; // Amber (Caution)
    return "#10b981"; // Green (Evidence-backed)
  };

  const scoreColor = result ? getHypeColor(result.hypeScore) : "#10b981";

  return (
    <AppLayout disclaimerVariant="general">
      <div className="hype-check-view">
        {/* Header */}
        <div className="hype-header">
          <div className="breadcrumb-pill">
            <span className="live-dot"></span>
            <span>SOCIAL MEDIA FOMO & SPECULATION FILTER</span>
          </div>
          <h1 className="hype-title">Investment Hype Check</h1>
          <p className="hype-sub">
            Filter out social-media euphoria, unverified telegram tips, and meme momentum by evaluating underlying cashflows, valuation reality, and structural drawdown risks.
          </p>
        </div>

        {/* Search & Trending Bar */}
        <div className="hype-search-card glass-panel">
          <form onSubmit={handleSearchSubmit} className="hype-search-form">
            <div className="hype-input-wrapper">
              <span className="search-icon">🔎</span>
              <input
                type="text"
                placeholder="Search any stock, crypto, ETF, or asset topic (e.g. Dogecoin, Options Trading, Nifty 50, Tata Motors)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="hype-input-field"
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "8px 20px", fontSize: "13px" }}>
                Run Hype Audit &rarr;
              </button>
            </div>
          </form>

          {/* Quick Trending Chips */}
          <div className="trending-chips-row">
            <span className="trending-label">Trending Asset Audits:</span>
            {trending.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`trending-chip ${query.toLowerCase() === t.key ? "active" : ""}`}
                onClick={() => handleSelectTrending(t.key)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Box */}
        {loading ? (
          <LoadingState message="Auditing cash flows, valuation multiples, retail frenzy, and historical drawdowns..." />
        ) : error ? (
          <ErrorState title="Hype Check Engine Offline" message={error} onRetry={() => analyzeAsset(query)} />
        ) : result ? (
          <div className="hype-results-box">
            {/* Status Hero Card */}
            <div className="hype-hero-card glass-panel glow-hover" style={{ borderLeft: `4px solid ${scoreColor}` }}>
              <div className="hype-hero-left">
                <ProgressRing
                  score={result.hypeScore}
                  size={120}
                  strokeWidth={9}
                  color={scoreColor}
                  label="/ 100 Hype"
                />
                <div className="hype-hero-title-box">
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span className="welcome-tag" style={{ color: scoreColor }}>
                      {result.category}
                    </span>
                    <span className="badge badge-amber" style={{ fontSize: "10px" }}>
                      {result.engineTag || "SIMULATED ANALYTICAL ENGINE"}
                    </span>
                  </div>
                  <h2 className="hype-asset-name">{result.name}</h2>
                  <div className="hype-status-pill" style={{ color: scoreColor }}>
                    {result.statusLabel}
                  </div>
                  <p className="hype-summary-text">{result.summary}</p>
                </div>
              </div>
            </div>

            {/* 6 Structural Dimension Cards */}
            <div className="dimensions-section">
              <h3 className="section-title">🔬 Structural Evaluation Dimensions</h3>
              <div className="dimensions-grid">
                {Object.entries(result.metrics || {}).map(([key, m]) => (
                  <div key={key} className="dimension-card glass-panel">
                    <div className="dimension-header">
                      <span className="dimension-title">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </span>
                      <span className="font-bold font-mono" style={{ fontSize: "13px", color: m.score > 60 ? "#f43f5e" : "#10b981" }}>
                        {m.label}
                      </span>
                    </div>
                    <p className="dimension-detail">{m.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Takeaway Recommendation */}
            <div className="hype-takeaway-card glass-panel">
              <span className="welcome-tag text-teal">WealthX Verdict</span>
              <h4 className="takeaway-text">{result.recommendation}</h4>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default HypeCheck;
