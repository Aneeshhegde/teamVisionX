import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { LoadingState, ErrorState } from "../components/common/StateViews";
import api from "../utils/apiClient";
import "./InvestmentEduPage.css";

const CATEGORY_TABS = [
  { key: "sip", label: "🌱 SIP & Mutual Funds", path: "/investments/sip" },
  { key: "gold", label: "🥇 Digital Gold & SGB", path: "/investments/gold" },
  { key: "fd", label: "🔒 Fixed Deposits", path: "/investments/fd" },
  { key: "bonds", label: "🏛️ Govt Bonds", path: "/investments/bonds" },
  { key: "etfs", label: "🌐 Index & ETFs", path: "/investments/etfs" },
  { key: "stocks", label: "⚡ Stocks Explorer", path: "/investments/stocks" },
];

export const InvestmentEduPage = ({ defaultCategory }) => {
  const params = useParams();
  const categoryKey = defaultCategory || params.category || "sip";

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/investments/educational/${categoryKey}`);
      if (res && res.data) {
        setContent(res.data);
      } else {
        throw new Error(res.message || "Failed to load educational module.");
      }
    } catch (err) {
      setError(err.message || "Error connecting to investment knowledge engine.");
    } finally {
      setLoading(false);
    }
  }, [categoryKey]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <AppLayout disclaimerVariant="investment">
      <div className="edu-page-view">
        {/* Navigation Sub-bar */}
        <div className="edu-nav-tabs">
          {CATEGORY_TABS.map((tab) => (
            <Link
              key={tab.key}
              to={tab.path}
              className={`edu-tab-link ${categoryKey === tab.key ? "active" : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {loading ? (
          <LoadingState message="Loading asset class mechanics and risk-return profile..." />
        ) : error ? (
          <ErrorState
            title="Educational Guide Offline"
            message={error}
            onRetry={fetchContent}
          />
        ) : content ? (
          <div className="edu-content-container">
            {/* Header Banner */}
            <div className="edu-header-banner glass-panel">
              <div>
                <span className="welcome-tag">Asset Class Blueprint</span>
                <h1 className="edu-title">{content.title}</h1>
                <p className="edu-tagline">{content.tagline}</p>
              </div>
              <div className="edu-header-actions">
                <Link to="/wealth-vault" className="btn btn-primary">
                  + Add to Wealth Vault
                </Link>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="edu-metrics-bar">
              <div className="edu-stat-pill glass-panel">
                <span className="stat-pill-label">Risk Profile</span>
                <span className="stat-pill-val font-bold text-amber">
                  {content.riskLevel}
                </span>
              </div>
              <div className="edu-stat-pill glass-panel">
                <span className="stat-pill-label">Liquidity Window</span>
                <span className="stat-pill-val font-bold text-teal">
                  {content.liquidity}
                </span>
              </div>
              <div className="edu-stat-pill glass-panel">
                <span className="stat-pill-label">Typical Horizon</span>
                <span className="stat-pill-val font-bold text-cyan">
                  {content.typicalHorizon}
                </span>
              </div>
            </div>

            {/* What is it section */}
            <div className="section-card glass-panel">
              <div className="section-card-header">
                <h3>📖 Fundamental Concept: What is it?</h3>
              </div>
              <p className="edu-body-text">{content.whatIsIt}</p>
            </div>

            {/* Two-column Advantages & Risks */}
            <div className="edu-two-column">
              {/* Advantages */}
              <div className="section-card glass-panel">
                <div className="section-card-header">
                  <h3 className="text-teal">✅ Strategic Advantages</h3>
                </div>
                <div className="benefits-list">
                  {content.advantages?.map((adv, idx) => (
                    <div key={idx} className="benefit-item benefit-positive">
                      <span className="item-bullet">✦</span>
                      <p>{adv}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks & Drawbacks */}
              <div className="section-card glass-panel">
                <div className="section-card-header">
                  <h3 className="text-rose">⚠️ Risks & Constraints</h3>
                </div>
                <div className="benefits-list">
                  {content.risks?.map((risk, idx) => (
                    <div key={idx} className="benefit-item benefit-negative">
                      <span className="item-bullet">✦</span>
                      <p>{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Important Factors to Consider */}
            <div className="section-card glass-panel">
              <div className="section-card-header">
                <h3>🎯 Important Factors to Consider</h3>
                <span className="badge badge-blue">WealthX Rule of Thumb</span>
              </div>
              <div className="factors-list">
                {content.importantFactors?.map((factor, idx) => (
                  <div key={idx} className="factor-item">
                    <span className="factor-number">0{idx + 1}</span>
                    <p className="factor-text">{factor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default InvestmentEduPage;
