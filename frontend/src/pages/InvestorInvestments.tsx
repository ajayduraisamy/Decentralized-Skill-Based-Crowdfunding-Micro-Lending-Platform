import * as React from "react";
import { useEffect, useState } from "react";
import type { UserType } from "../types";
import { FaEthereum, FaChartLine } from "react-icons/fa";

interface Project {
  id: number;
  name: string;
  borrower_name: string;
  total_funded: number;
  current_milestone: number;
  funded_amount: number; // Amount invested by this investor
}

interface InvestmentsProps {
  user?: UserType | null;
}

const InvestorInvestments: React.FC<InvestmentsProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchInvestments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/investor_investments/${user.id}`);
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Failed to fetch investments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">My Investments</h1>
      {user && <p className="text-lg mb-8">Projects you have funded, {user.name}</p>}

      {loading ? (
        <p>Loading investments...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-600">No investments yet. Browse projects to start funding!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              className={`p-5 rounded-2xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl ${
                ["bg-blue-50", "bg-green-50", "bg-yellow-50", "bg-purple-50"][idx % 4]
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <FaEthereum className="text-gray-600" size={25} />
                <h3 className="text-xl font-bold">{project.name}</h3>
              </div>
              <p>Borrower: <span className="font-semibold">{project.borrower_name}</span></p>
              <p>Total Funded: <span className="font-semibold">{project.total_funded} ETH</span></p>
              <p>Current Milestone: <span className="font-semibold">{project.current_milestone}</span></p>
              <p>Your Contribution: <span className="font-semibold">{project.funded_amount} ETH</span></p>
              <div className="mt-3">
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-2"
                    style={{ width: `${(project.funded_amount / project.total_funded) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1 text-gray-600">
                  {((project.funded_amount / project.total_funded) * 100).toFixed(1)}% funded by you
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorInvestments;
