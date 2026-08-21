import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Disclaimer from "../components/common/Disclaimer";
import background from "../assets/images/Gemini_Generated_Image_e60xnhe60xnhe60x.png";
import "./Home.css";

function Home() {
  const { isAuthenticated, isOnboarded } = useAuth();

  return (
    <div
      className="home"
      style={{
        backgroundImage: `url(${background})`,
        backgroundColor: "#070b14",
        position: "relative",
        minHeight: "100vh",
      }}
    >
      <Navbar />

      <div className="overlay" style={{ pointerEvents: "none" }}></div>

      <div className="hero-wealthx" style={{ position: "relative", zIndex: 2 }}>
        <div className="hero-badge">
          <span>🚀 VisionX Intelligence Platform</span>
        </div>

        <h1 className="hero-title">
          Intelligence for Every <br />
          <span className="hero-gradient-text">Financial Decision</span>
        </h1>

        <p className="hero-subtitle">
          Diagnose where you stand with <strong>Financial X-Ray</strong>, track where your money compounds in <strong>Wealth Vault</strong>, and simulate your next moves with the <strong>AI Decision Lab</strong>.
        </p>

        <div className="hero-buttons">
          {isAuthenticated ? (
            <Link to={isOnboarded ? "/dashboard" : "/onboarding"} className="btn-hero-primary">
              Enter Command Center →
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn-hero-primary">
                Get Started Free →
              </Link>
              <Link to="/login" className="btn-hero-secondary">
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="hero-pillars-grid">
          <div className="pillar-card glass-panel">
            <span className="pillar-icon">🔬</span>
            <h3>Financial X-Ray</h3>
            <p>Calculate emergency runway, debt burden (DTI), and financial resilience.</p>
          </div>

          <div className="pillar-card glass-panel">
            <span className="pillar-icon">🏦</span>
            <h3>Wealth Vault</h3>
            <p>Unified tracking for Indian Stocks, Mutual Funds, SIPs, Gold, and FDs.</p>
          </div>

          <div className="pillar-card glass-panel">
            <span className="pillar-icon">🤖</span>
            <h3>AI Decision Lab</h3>
            <p>Simulate financial trade-offs with structured risk analysis & guardrails.</p>
          </div>

          <div className="pillar-card glass-panel">
            <span className="pillar-icon">🏛️</span>
            <h3>Govt Schemes</h3>
            <p>Instant eligibility discovery across central & state welfare policies.</p>
          </div>
        </div>

        <div style={{ maxWidth: "800px", margin: "40px auto 0" }}>
          <Disclaimer variant="general" />
        </div>
      </div>
    </div>
  );
}

export default Home;