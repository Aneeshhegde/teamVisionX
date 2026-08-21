import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signup(formData.name, formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="signup-page">
        <div className="card">
          <h2>Create Account</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", textAlign: "center" }}>
            Choose your preferred credentials to enter WealthX Command Center
          </p>

          <form onSubmit={handleSubmit} autoComplete="off">
            <input
              type="text"
              name="name"
              placeholder="Full Name (e.g. Manoj Hegde)"
              value={formData.name}
              onChange={handleChange}
              autoComplete="off"
              spellCheck={false}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email address (e.g. you@example.com)"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              spellCheck={false}
              required
            />

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (choose any password you want)"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                spellCheck={false}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            {error ? <p style={{ color: "#f43f5e", marginTop: "10px", fontSize: "13px", textAlign: "center" }}>{error}</p> : null}

            <button type="submit" disabled={loading} style={{ marginTop: "12px" }}>
              {loading ? "Creating Account..." : "Create Account & Enter →"}
            </button>

            <div style={{ marginTop: "18px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                Sign In &rarr;
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Signup;