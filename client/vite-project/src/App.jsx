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
            path="/dashboard"
            element={
              <ProtectedRoute requireOnboarded={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wealth-vault"
            element={
              <ProtectedRoute requireOnboarded={true}>
                <WealthVault />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute requireOnboarded={true}>
                <Goals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial-xray"
            element={
              <ProtectedRoute requireOnboarded={true}>
                <FinancialXRay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/action-plan"
            element={
              <ProtectedRoute requireOnboarded={true}>
                <ActionPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments"
            element={
              <ProtectedRoute requireOnboarded={true}>
                <InvestmentHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/stocks"
            element={
              <ProtectedRoute requireOnboarded={true}>
                <StocksExplorer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/sip"
            element={
              <ProtectedRoute requireOnboarded={true}>
                <InvestmentEduPage defaultCategory="sip" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/gold"
            element={
              <ProtectedRoute requireOnboarded={true}>
                <InvestmentEduPage defaultCategory="gold" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/fd"
            element={
              <ProtectedRoute requireOnboarded={true}>
                <InvestmentEduPage defaultCategory="fd" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/bonds"
            element={
              <ProtectedRoute requireOnboarded={true}>
                <InvestmentEduPage defaultCategory="bonds" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/etfs"
            element={
              <ProtectedRoute requireOnboarded={true}>
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