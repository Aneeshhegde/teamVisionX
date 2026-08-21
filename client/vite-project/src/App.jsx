import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import WealthVault from "./pages/WealthVault";
import Goals from "./pages/Goals";
import FinancialXRay from "./pages/FinancialXRay";
import ActionPlan from "./pages/ActionPlan";
import InvestmentHub from "./pages/InvestmentHub";
import StocksExplorer from "./pages/StocksExplorer";
import InvestmentEduPage from "./pages/InvestmentEduPage";
import IntroVideo from "./components/IntroVideo";

import "./App.css";

function App() {
  const [showVideo, setShowVideo] = useState(() => {
    return localStorage.getItem("introVideoSeen") !== "true";
  });

  const handleFinishIntro = () => {
    localStorage.setItem("introVideoSeen", "true");
    setShowVideo(false);
  };

  if (showVideo) {
    return <IntroVideo onFinish={handleFinishIntro} />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wealth-vault"
            element={
              <ProtectedRoute>
                <WealthVault />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial-xray"
            element={
              <ProtectedRoute>
                <FinancialXRay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/action-plan"
            element={
              <ProtectedRoute>
                <ActionPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments"
            element={
              <ProtectedRoute>
                <InvestmentHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/stocks"
            element={
              <ProtectedRoute>
                <StocksExplorer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/sip"
            element={
              <ProtectedRoute>
                <InvestmentEduPage defaultCategory="sip" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/gold"
            element={
              <ProtectedRoute>
                <InvestmentEduPage defaultCategory="gold" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/fd"
            element={
              <ProtectedRoute>
                <InvestmentEduPage defaultCategory="fd" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/bonds"
            element={
              <ProtectedRoute>
                <InvestmentEduPage defaultCategory="bonds" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/etfs"
            element={
              <ProtectedRoute>
                <InvestmentEduPage defaultCategory="etfs" />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;