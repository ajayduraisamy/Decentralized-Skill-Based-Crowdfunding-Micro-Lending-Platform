// src/components/ProjectCard.tsx
import React from "react";

interface Project {
  id: number;
  name: string;
  borrower_id: number;
  total_funded: number;
  current_milestone: number;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-bold mb-2">{project.name}</h3>
      <p>Borrower ID: {project.borrower_id}</p>
      <p>Total Funded: {project.total_funded} ETH</p>
      <p>Current Milestone: {project.current_milestone}</p>
      <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
        View Details
      </button>
    </div>
  );
};

export default ProjectCard;
