import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FaProjectDiagram, FaCheckCircle, FaHandHoldingUsd, FaWallet } from "react-icons/fa";
import type { UserType } from "../types";

interface DashboardInvestorProps {
  user?: UserType | null;
}

const DashboardInvestor: React.FC<DashboardInvestorProps> = ({ user }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Available Projects",
      desc: "Browse projects to invest in and earn returns.",
      icon: <FaProjectDiagram size={40} />,
      color: "bg-blue-100 text-blue-600",
      hover: "hover:shadow-2xl",
      navigateTo: "/investor/projects",
    },
    {
      title: "Approve Milestones",
      desc: "Approve milestone completion to release funds.",
      icon: <FaCheckCircle size={40} />,
      color: "bg-green-100 text-green-600",
      hover: "hover:shadow-2xl",
      navigateTo: "/investor/approve-milestone",
    },
    {
      title: "Create Loan",
      desc: "Provide peer-to-peer loans to borrowers.",
      icon: <FaHandHoldingUsd size={40} />,
      color: "bg-yellow-100 text-yellow-600",
      hover: "hover:shadow-2xl",
      navigateTo: "/investor/create-loan",
    },
    {
      title: "Wallet & Investments",
      desc: "Track your funded projects and returns.",
      icon: <FaWallet size={40} />,
      color: "bg-purple-100 text-purple-600",
      hover: "hover:shadow-2xl",
      navigateTo: "/investor/investments",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Investor Dashboard</h1>
      {user && (
        <p className="text-lg mb-8 text-center">
          Welcome, <span className="font-semibold">{user.name}</span>
        </p>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl shadow-lg cursor-pointer flex flex-col items-center justify-center space-y-3 transition ${card.color} ${card.hover}`}
            onClick={() => navigate(card.navigateTo)}
          >
            {React.cloneElement(card.icon, { className: `${card.color.split(" ")[1]}` })}
            <h2 className="text-xl font-bold text-center">{card.title}</h2>
            <p className="text-sm text-gray-700 text-center">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardInvestor;
