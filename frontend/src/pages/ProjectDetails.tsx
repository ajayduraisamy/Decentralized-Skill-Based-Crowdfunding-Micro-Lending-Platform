import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import type { UserType } from "../types";

interface Milestone {
  id: number;
  description: string;
  fund_amount: number;
  approved: boolean;
}

interface Project {
  id: number;
  name: string;
  borrower_id: number;
  total_funded: number;
  current_milestone: number;
  milestones?: Milestone[];
}

// Declare props
interface ProjectDetailsProps {
  user: UserType | null;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ user }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/recommend_projects/0`);
        const found = res.data.recommendations.find(
          (p: Project) => p.id === Number(projectId)
        );
        if (found) setProject(found);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleFund = async () => {
    if (!project) return;

    // Use user prop instead of localStorage
    if (!user) {
      setMessage("You must be logged in to fund a project.");
      return;
    }

    const investor_address = user.blockchain_address;

    try {
      const res = await axios.post("http://localhost:5000/fund_project", {
        project_id: project.id,
        investor_address,
        amount,
      });
      if (res.data.on_chain) {
        setMessage("Funding successful!");
      } else {
        setMessage("Funding simulated off-chain.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to fund project.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {project ? (
        <>
          <h2 className="text-3xl font-bold mb-4">{project.name}</h2>
          <p>Borrower ID: {project.borrower_id}</p>
          <p>Total Funded: {project.total_funded} ETH</p>
          <p>Current Milestone: {project.current_milestone}</p>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Fund this project</h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="border px-3 py-2 mr-2 rounded"
            />
            <button
              onClick={handleFund}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Fund
            </button>
          </div>

          {message && <p className="mt-4 text-blue-600">{message}</p>}

          {project.milestones && project.milestones.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Milestones</h3>
              <ul>
                {project.milestones.map((m) => (
                  <li
                    key={m.id}
                    className={`border p-3 rounded mb-2 ${
                      m.approved ? "bg-green-100" : "bg-yellow-100"
                    }`}
                  >
                    {m.description} — {m.fund_amount} ETH —{" "}
                    {m.approved ? "Approved" : "Pending"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p>Loading project...</p>
      )}
    </div>
  );
};

export default ProjectDetails;
