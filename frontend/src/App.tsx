import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

// Pages
import AddMilestone from "./pages/AddMilestone";
import CreateProject from "./pages/CreateProject";
import DashboardBorrower from "./pages/DashboardBorrower";
import DashboardInvestor from "./pages/DashboardInvestor";
import InvestorApproveMilestones from "./pages/InvestorApproveMilestones"
import InvestorProjects from "./pages/InvestorProjects";
import InvestorInvestments from "./pages/InvestorInvestments"
import CreateLoan from "./pages/CreateLoan";
import Home from "./pages/Home";
import Loans from "./pages/Loans";
import Login from "./pages/Login";
import MyProjects from "./pages/MyProjects";
import ProjectDetails from "./pages/ProjectDetails";
import Register from "./pages/Register";

import type { UserType } from "./types";

// -------------------------------
// Router-aware component
// -------------------------------
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="flex-grow p-4">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Borrower Dashboard + Functions */}
          <Route path="/dashboard-borrower" element={<DashboardBorrower user={user} />} />
          <Route path="/borrower/create-project" element={<CreateProject user={user} />} />
          <Route path="/borrower/add-milestone" element={<AddMilestone user={user} />} />
          <Route path="/borrower/my-projects" element={<MyProjects user={user} />} />
          <Route path="/borrower/loans" element={<Loans user={user} />} />

          {/* Investor Dashboard */}
          <Route path="/dashboard-investor" element={<DashboardInvestor user={user} />} />
          <Route path="/investor/create-loan" element={<CreateLoan user={user} />} />
          <Route path="/investor/projects" element={<InvestorProjects user={user} />} />
          <Route path="/investor/investments" element={<InvestorInvestments user={user} />} />
          
         <Route path="/investor/approve-milestone" element={<InvestorApproveMilestones user={user} />} />
          {/* Shared */}
          <Route path="/project/:id" element={<ProjectDetails user={user} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// -------------------------------
// Main App
// -------------------------------
const App: React.FC = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
