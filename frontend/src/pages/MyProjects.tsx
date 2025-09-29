import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import type { UserType } from "../types";

interface Project {
  id: number;
  name: string;
  total_funded: number;
  current_milestone: number;
}

interface MyProjectsProps {
  user?: UserType | null;
}

const MyProjects: React.FC<MyProjectsProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:5000/my_projects/${user.id}`);
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

  if (!user) {
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">
        You must be logged in to view your projects.
      </p>
    );
  }

  const gradientColors = [
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-green-400 via-teal-400 to-cyan-500",
    "from-yellow-400 via-orange-400 to-red-400",
    "from-pink-400 via-purple-400 to-indigo-500",
  ];

  return (
    <div className="max-w-6xl mx-auto mt-12 space-y-8 px-4">
      <h1 className="text-4xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        My Projects
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-gray-400">
          No projects found. Start by creating a new project!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <Card
              key={project.id}
              className="transform transition-transform hover:-translate-y-2 hover:shadow-2xl rounded-3xl shadow-md border border-gray-200 overflow-hidden"
            >
              <CardContent
                className={`p-6 space-y-3 bg-gradient-to-r ${gradientColors[idx % gradientColors.length]} text-white`}
              >
                <h2 className="text-2xl font-bold text-center text-black">{project.name}</h2>
                <p className="font-medium">
                  Total Funded: <strong>{project.total_funded} ETH</strong>
                </p>
                <p className="font-medium">
                  Current Milestone: <strong>{project.current_milestone}</strong>
                </p>
                <div className="flex gap-2 mt-4">
                 
                  <Button
                    onClick={() => navigate(`/borrower/add-milestone`)}
                    className="bg-dark text-black font-semibold hover:bg-gray-100 w-full transition-all duration-300"
                  >
                    Add Milestone
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;
