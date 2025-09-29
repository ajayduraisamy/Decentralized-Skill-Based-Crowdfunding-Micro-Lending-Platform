import React, { useEffect, useState } from "react";
import type { UserType } from "../types";
import { Card, CardContent } from "../components/ui/Card";

interface Project {
  id: number;
  name: string;
  borrower_name: string;
  total_funded: number;
  current_milestone: number;
}

interface InvestorProjectsProps {
  user?: UserType | null;
}

const InvestorProjects: React.FC<InvestorProjectsProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:5000/investor/projects`);
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  if (!user)
    return (
      <p className="text-center mt-10 text-red-600">
        Please log in first
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-8">
      <h1 className="text-4xl font-extrabold text-center text-gradient bg-gradient-to-r from-green-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent mb-6">
        Available Projects
      </h1>

      {loading ? (
        <p className="text-center text-gray-400 text-lg">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">
          No projects available for investment yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-5 rounded-3xl shadow-xl hover:shadow-2xl transition-transform transform hover:-translate-y-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 cursor-pointer"
            >
              <CardContent className="space-y-3">
                <h2 className="text-xl font-bold text-white">{project.name}</h2>
                <p className="text-gray-300">
                  Borrower: <span className="font-semibold">{project.borrower_name}</span>
                </p>
                <p className="text-gray-300">
                  Total Funded: <span className="font-semibold">{project.total_funded} ETH</span>
                </p>
                <p className="text-gray-300">
                  Current Milestone: <span className="font-semibold">{project.current_milestone}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorProjects;
