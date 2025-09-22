// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProjectCard from "../components/ProjectCard";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  trust_score: number;
}

interface Project {
  id: number;
  name: string;
  borrower_id: number;
  total_funded: number;
  current_milestone: number;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchRecommendations(JSON.parse(storedUser).id);
    }
  }, []);

  const fetchRecommendations = async (userId: number) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/recommend_projects/${userId}`
      );
      setProjects(res.data.recommendations);
    } catch (err) {
      console.error("Failed to fetch project recommendations", err);
    }
  };

  return (
    <div className="p-6">
      {user && (
        <div className="mb-6 p-4 bg-blue-100 rounded-lg">
          <h2 className="text-2xl font-bold">Welcome, {user.name}!</h2>
          <p>Role: {user.role}</p>
          <p>Trust Score: {user.trust_score}</p>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-4">Recommended Projects</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <p>No project recommendations available.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
