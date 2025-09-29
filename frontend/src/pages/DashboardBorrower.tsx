import React from "react";
import type { UserType } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

interface DashboardBorrowerProps {
  user?: UserType | null;
}

const DashboardBorrower: React.FC<DashboardBorrowerProps> = ({ user }) => {
  const features = [
    {
      title: "Create Project",
      description: "Start a new crowdfunding project and raise funds.",
      url: "/borrower/create-project",
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
    },
    {
      title: "Add Milestone",
      description: "Define milestones for your projects to unlock funds.",
      url: "/borrower/add-milestone",
      gradient: "from-green-400 via-teal-400 to-cyan-500",
    },
    {
      title: "My Projects",
      description: "View and manage all your active and past projects.",
      url: "/borrower/my-projects",
      gradient: "from-yellow-400 via-orange-400 to-red-400",
    },
    {
      title: "Loans",
      description: "Track your loans and repayment status.",
      url: "/borrower/loans",
      gradient: "from-pink-400 via-purple-400 to-indigo-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-12 px-4 space-y-8">
      <h1 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        Borrower Dashboard
      </h1>

      {user ? (
        <>
          <p className="text-lg text-center text-gray-700">
            Welcome, <span className="font-semibold">{user.name}</span>
          </p>
          <p className="text-center text-gray-600 font-medium">
            Trust Score: {user.trust_score ?? "Not calculated yet"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className={`transform transition-transform hover:-translate-y-2 hover:shadow-2xl rounded-3xl shadow-md overflow-hidden border border-gray-200`}
              >
                <CardContent
                  className={`space-y-4 p-6 bg-gradient-to-r ${feature.gradient} text-white`}
                >
                  <h2 className="text-2xl font-bold">{feature.title}</h2>
                  <p className="text-sm font-medium opacity-90">{feature.description}</p>
                  <Link to={feature.url}>
                    <Button className="mt-4 w-full bg-dark text-blue-800 font-semibold hover:bg-orange transition-all duration-300">
                      Go
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">Loading user...</p>
      )}
    </div>
  );
};

export default DashboardBorrower;
