import React from "react";
import type { UserType } from "../types";

interface DashboardInvestorProps {
  user?: UserType | null;
}

const DashboardInvestor: React.FC<DashboardInvestorProps> = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4">Investor Dashboard</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}</p>
        </div>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};

export default DashboardInvestor;
