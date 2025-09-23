import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import CreateProject from "./pages/CreateProject";
import DashboardBorrower from "./pages/DashboardBorrower";
import DashboardInvestor from "./pages/DashboardInvestor";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProjectDetails from "./pages/ProjectDetails";
import Register from "./pages/Register";
import type { UserType } from "./types";

// Wrap your App in a Router-aware component for useNavigate
const AppRoutes: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogin = (loggedInUser: UserType) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login"); 
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/dashboard-borrower" element={<DashboardBorrower user={user} />} />
          <Route path="/dashboard-investor" element={<DashboardInvestor user={user} />} />
          <Route path="/create-project" element={<CreateProject user={user} />} />
          <Route path="/project/:id" element={<ProjectDetails user={user} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// Main App wrapped in Router
const App: React.FC = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
