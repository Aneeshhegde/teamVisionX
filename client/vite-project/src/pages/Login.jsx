import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

import "./Login.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [resetData, setResetData] = useState({ email: "", otp: "", password: "" });
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name === "loginEmail" ? "email" : name === "loginPassword" ? "password" : name;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    const fieldName =
      name === "resetEmail" || name === "verifyEmail" || name === "resetEmailFinal"
        ? "email"
        : name;
    setResetData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(formData.email, formData.password);
      if (data.user && data.user.isOnboarded) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setOtpVerified(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP");
      }

      setMessage(data.message || "OTP sent to email");
      setMode("verify");
    } catch (err) {
      setError(err.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetData.email,
          otp: resetData.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setOtpVerified(true);
      setMessage(data.message || "OTP verified");
      setMode("reset");
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetData.email,
          otp: resetData.otp,
          password: resetData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      setMessage(data.message || "Password updated successfully");
      setMode("login");
      setFormData({ email: resetData.email, password: "" });
      setResetData({ email: "", otp: "", password: "" });
      setOtpVerified(false);
    } catch (err) {
      setError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="login-page">
        <div className="card">
          {mode === "login" ? (
            <>
              <h2>Sign In</h2>

              <form onSubmit={handleSubmit} autoComplete="off">
                <input
                  type="email"
                  name="loginEmail"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  spellCheck={false}
                  required
                />

                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="loginPassword"
                    placeholder="Password"
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
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>

                <button type="button" className="link-button" onClick={() => setMode("forgot")}>
                  Forgot Password?
                </button>

                {error ? <p className="status error">{error}</p> : null}
                {message ? <p className="status success">{message}</p> : null}

                <button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <div style={{ marginTop: "18px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                  Don't have an account?{" "}
                  <Link to="/signup" style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                    Create Account &rarr;
                  </Link>
                </div>
              </form>
            </>
          ) : null}

          {mode === "forgot" ? (
            <>
              <h2>Forgot Password</h2>

              <form onSubmit={handleForgotPassword} autoComplete="off">
                <input
                  type="email"
                  name="resetEmail"
                  placeholder="Enter your email"
                  value={resetData.email}
                  onChange={handleResetChange}
                  autoComplete="off"
                  spellCheck={false}
                  required
                />

                {error ? <p className="status error">{error}</p> : null}
                {message ? <p className="status success">{message}</p> : null}

                <button type="submit" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>

                <button type="button" className="link-button" onClick={() => setMode("login")}>
                  Back to Login
                </button>
              </form>
            </>
          ) : null}

          {mode === "verify" ? (
            <>
              <h2>Verify OTP</h2>

              <form onSubmit={handleVerifyOtp} autoComplete="off">
                <input
                  type="email"
                  name="verifyEmail"
                  placeholder="Email"
                  value={resetData.email}
                  onChange={handleResetChange}
                  autoComplete="off"
                  spellCheck={false}
                  required
                />

                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={resetData.otp}
                  onChange={handleResetChange}
                  autoComplete="off"
                  inputMode="numeric"
                  required
                />

                {error ? <p className="status error">{error}</p> : null}
                {message ? <p className="status success">{message}</p> : null}

                <button type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button type="button" className="link-button" onClick={() => setMode("forgot")}>
                  Change Email
                </button>
              </form>
            </>
          ) : null}

          {mode === "reset" ? (
            <>
              <h2>Reset Password</h2>

              <form onSubmit={handleResetPassword} autoComplete="off">
                <input
                  type="email"
                  name="resetEmailFinal"
                  placeholder="Email"
                  value={resetData.email}
                  onChange={handleResetChange}
                  autoComplete="off"
                  spellCheck={false}
                  required
                />

                <input
                  type="text"
                  name="otp"
                  placeholder="OTP"
                  value={resetData.otp}
                  onChange={handleResetChange}
                  autoComplete="off"
                  inputMode="numeric"
                  required
                />

                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="New Password"
                    value={resetData.password}
                    onChange={handleResetChange}
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
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>

                {error ? <p className="status error">{error}</p> : null}
                {message ? <p className="status success">{message}</p> : null}

                <button type="submit" disabled={loading || !otpVerified}>
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default Login;