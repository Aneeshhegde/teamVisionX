import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, isAdmin } = useAuth();
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (groupKey) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const navSections = [
    {
      key: "command",
      title: "Command Center",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: "📊" },
      ],
    },
    {
      key: "understand",
      title: "Understand",
      items: [
        { label: "Financial X-Ray", path: "/financial-xray", icon: "🔬" },
        { label: "Wealth Vault", path: "/wealth-vault", icon: "🏦" },
        { label: "Goals", path: "/goals", icon: "🎯" },
        { label: "Action Plan", path: "/action-plan", icon: "📋" },
      ],
    },
    {
      key: "invest",
      title: "Invest & Save",
      items: [
        { label: "Investment Hub", path: "/investments", icon: "📈" },
        { label: "Stocks Explorer", path: "/investments/stocks", icon: "⚡" },
        { label: "SIP & Mutual Funds", path: "/investments/sip", icon: "🌱" },
        { label: "Digital Gold", path: "/investments/gold", icon: "🥇" },
        { label: "Fixed Deposits", path: "/investments/fd", icon: "📜" },
        { label: "Govt Bonds", path: "/investments/bonds", icon: "🏛️" },
        { label: "Index & ETFs", path: "/investments/etfs", icon: "🌐" },
      ],
    },
    {
      key: "calculators",
      title: "Plan & Calculate",
      items: [
        { label: "Calculators Suite", path: "/calculators", icon: "🧮" },
        { label: "SIP Calculator", path: "/calculators/sip", icon: "📈" },
        { label: "Step-Up SIP", path: "/calculators/step-up-sip", icon: "🚀" },
        { label: "Loan EMI", path: "/calculators/emi", icon: "💳" },
        { label: "FD Growth", path: "/calculators/fd", icon: "🔒" },
        { label: "Goal Target", path: "/calculators/goal", icon: "🎯" },
      ],
    },
    {
      key: "loans",
      title: "Loans & Debt",
      items: [
        { label: "Loans Overview", path: "/loans", icon: "📑" },
        { label: "Loan Finder", path: "/loans/finder", icon: "🔍" },
        { label: "Compare Loans", path: "/loans/compare", icon: "⚖️" },
        { label: "Debt Health (DTI)", path: "/loans/debt-health", icon: "🩺" },
        { label: "Repayment Planner", path: "/loans/repayment", icon: "⚡" },
      ],
    },
    {
      key: "decide",
      title: "Decide Smarter",
      items: [
        { label: "AI Decision Lab", path: "/ai-decision-lab", icon: "🤖" },
        { label: "My Next ₹10,000", path: "/my-next-money", icon: "💡" },
        { label: "Future You Simulator", path: "/future-you", icon: "⏳" },
        { label: "Hype Check", path: "/hype-check", icon: "🛡️" },
        { label: "Government Schemes", path: "/schemes", icon: "🇮🇳" },
      ],
    },
    {
      key: "system",
      title: "System",
      items: [
        { label: "Audit & History", path: "/history", icon: "🕰️" },
        { label: "Settings & Profile", path: "/settings", icon: "⚙️" },
        ...(isAdmin
          ? [{ label: "Admin Portal", path: "/admin", icon: "👑", badge: "Admin" }]
          : []),
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}

      <aside className={`app-sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">WX</div>
            <div className="brand-text">
              <span className="brand-title">WealthX</span>
              <span className="brand-subtitle">by VisionX</span>
            </div>
          </div>
          {isMobileOpen && (
            <button type="button" className="mobile-close-btn" onClick={onCloseMobile}>
              ✕
            </button>
          )}
        </div>

        <div className="sidebar-nav-container">
          {navSections.map((section) => (
            <div key={section.key} className="nav-section">
              <div
                className="nav-section-title"
                onClick={() => toggleGroup(section.key)}
              >
                <span>{section.title}</span>
                <span className="section-chevron">
                  {collapsedGroups[section.key] ? "▸" : "▾"}
                </span>
              </div>

              {!collapsedGroups[section.key] && (
                <div className="nav-items-list">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/dashboard" || item.path === "/calculators" || item.path === "/investments" || item.path === "/loans" || item.path === "/ai-decision-lab" || item.path === "/admin"}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      onClick={() => {
                        if (isMobileOpen && onCloseMobile) onCloseMobile();
                      }}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="user-avatar">{user?.name ? user.name[0].toUpperCase() : "U"}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || "WealthX User"}</span>
              <span className="user-role">{user?.role === "admin" ? "Administrator" : "Standard Plan"}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
