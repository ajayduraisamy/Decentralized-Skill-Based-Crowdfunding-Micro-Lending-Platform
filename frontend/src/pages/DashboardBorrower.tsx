import React from "react";
import type { UserType } from "../types";

interface DashboardBorrowerProps {
  user?: UserType | null;
}

const DashboardBorrower: React.FC<DashboardBorrowerProps> = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4">Borrower Dashboard</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}</p>
          <p>Trust Score: {user.trust_score ?? "Not calculated yet"}</p>
        </div>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};

export default DashboardBorrower;
