import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { LoadingState, ErrorState, EmptyState } from "../components/common/StateViews";
import api from "../utils/apiClient";
import "./ActionPlan.css";

export const ActionPlan = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActionPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/action-plan");
      if (res && res.data) {
        setItems(res.data);
      } else {
        throw new Error(res.message || "Failed to load action plan.");
      }
    } catch (err) {
      setError(err.message || "Error connecting to Action Plan generator.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActionPlan();
  }, [fetchActionPlan]);

  const highPriorityItems = items.filter((i) => i.priority === "high");
  const mediumPriorityItems = items.filter((i) => i.priority === "medium");
  const lowPriorityItems = items.filter((i) => i.priority === "low");

  return (
    <AppLayout disclaimerVariant="general">
      <div className="action-plan-view">
        {/* Header */}
        <div className="action-plan-header-row">
          <div>
            <div className="breadcrumb-pill">
              <span className="live-dot"></span>
              <span>SYNTHESIS & RECOMMENDATIONS</span>
            </div>
            <h1 className="action-plan-title">Strategic Action Plan</h1>
            <p className="action-plan-sub">
              Algorithmic prioritization of actionable financial optimizations derived from your cashflow, emergency runway, asset allocation, and milestone pacing.
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Synthesizing financial profile and prioritizing strategic action items..." />
        ) : error ? (
          <ErrorState
            title="Action Plan Unavailable"
            message={error}
            onRetry={fetchActionPlan}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Action Plan Ready to Generate"
            description="Complete your 2-minute financial profile to unlock personalized priority action items."
            actionText="Start Profile Calibration →"
            onAction={() => (window.location.href = "/onboarding")}
          />
        ) : (
          <div className="action-groups-container">
            {/* High Priority Group */}
            {highPriorityItems.length > 0 && (
              <div className="priority-group-section">
                <div className="group-header group-header-high">
                  <div className="group-badge-icon">🔥</div>
                  <div>
                    <h3 className="group-title">Immediate Attention Required</h3>
                    <p className="group-sub">
                      Critical vulnerabilities impacting emergency solvency or monthly cashflow sustainability.
                    </p>
                  </div>
                </div>

                <div className="action-cards-list">
                  {highPriorityItems.map((item) => (
                    <div key={item.id} className="action-item-card glass-panel border-high glow-hover">
                      <div className="item-body">
                        <div className="item-top">
                          <span className="badge badge-rose">High Priority</span>
                          <h4 className="item-title">{item.title}</h4>
                        </div>
                        <p className="item-explanation">{item.explanation}</p>
                      </div>
                      <div className="item-action-box">
                        <Link to={item.actionRoute} className="btn btn-primary btn-action-cta">
                          {item.actionText || "Take Action →"}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medium Priority Group */}
            {mediumPriorityItems.length > 0 && (
              <div className="priority-group-section">
                <div className="group-header group-header-medium">
                  <div className="group-badge-icon">⚖️</div>
                  <div>
                    <h3 className="group-title">Milestone & Foundation Optimizations</h3>
                    <p className="group-sub">
                      Key enhancements to improve milestone pacing and asset tracking visibility.
                    </p>
                  </div>
                </div>

                <div className="action-cards-list">
                  {mediumPriorityItems.map((item) => (
                    <div key={item.id} className="action-item-card glass-panel border-medium glow-hover">
                      <div className="item-body">
                        <div className="item-top">
                          <span className="badge badge-blue">Medium Priority</span>
                          <h4 className="item-title">{item.title}</h4>
                        </div>
                        <p className="item-explanation">{item.explanation}</p>
                      </div>
                      <div className="item-action-box">
                        <Link to={item.actionRoute} className="btn btn-secondary btn-action-cta">
                          {item.actionText || "Review →"}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Priority Group */}
            {lowPriorityItems.length > 0 && (
              <div className="priority-group-section">
                <div className="group-header group-header-low">
                  <div className="group-badge-icon">🌱</div>
                  <div>
                    <h3 className="group-title">Growth & Diversification Opportunities</h3>
                    <p className="group-sub">
                      Long-term wealth compounding and risk diversification recommendations.
                    </p>
                  </div>
                </div>

                <div className="action-cards-list">
                  {lowPriorityItems.map((item) => (
                    <div key={item.id} className="action-item-card glass-panel border-low glow-hover">
                      <div className="item-body">
                        <div className="item-top">
                          <span className="badge badge-green">Growth Suggestion</span>
                          <h4 className="item-title">{item.title}</h4>
                        </div>
                        <p className="item-explanation">{item.explanation}</p>
                      </div>
                      <div className="item-action-box">
                        <Link to={item.actionRoute} className="btn btn-secondary btn-action-cta">
                          {item.actionText || "Explore →"}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ActionPlan;
