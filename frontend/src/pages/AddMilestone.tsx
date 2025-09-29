import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaProjectDiagram } from "react-icons/fa";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { UserType } from "../types";

interface Project {
  id: number;
  name: string;
}
interface AddMilestoneProps {
  user?: UserType | null;
}

const AddMilestone: React.FC<AddMilestoneProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/recommend_projects/" + user.id);
        const data = await res.json();
        setProjects(data.recommendations || []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjects();
  }, [user]);

  const handleAddMilestone = async () => {
    if (!selectedProjectId || !description || !fundAmount) {
      setMessage("Please fill all fields.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      const res = await fetch("http://localhost:5000/add_milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProjectId,
          description,
          fund_amount: parseFloat(fundAmount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Milestone added! Block hash: ${data.block_hash}`);
        setMessageType("success");
        setDescription("");
        setFundAmount("");
      } else {
        setMessage(`Error: ${data.message || "Something went wrong"}`);
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Failed to connect to backend.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const messageIcon = () => {
    if (messageType === "success") return <FaCheckCircle className="inline mr-2 text-green-400 animate-bounce" />;
    if (messageType === "error") return <FaTimesCircle className="inline mr-2 text-red-400 animate-shake" />;
    return <FaProjectDiagram className="inline mr-2 text-yellow-300 animate-pulse" />;
  };

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <Card className="rounded-3xl shadow-2xl border border-gray-300 transform hover:-translate-y-3 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600">
        <CardContent className="space-y-6 p-8">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg text-center">Add Milestone</h1>
          <p className="text-gray-200 text-lg text-center">Add a new milestone to your project with style.</p>

          <div className="space-y-4">
            <label className="font-bold text-yellow-300 text-lg">Select Project:</label>
            <select
              className="w-full px-5 py-3 rounded-2xl border-2 border-purple-400 bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200 text-gray-900 focus:ring-4 focus:ring-purple-500 transition-all"
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            >
              <option value="">-- Select Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <Input
              type="text"
              placeholder="Milestone Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-2xl bg-gradient-to-r from-blue-200 to-blue-100 text-gray-900 focus:ring-4 focus:ring-blue-400 transition-all"
            />

            <Input
              type="number"
              placeholder="Fund Amount (ETH)"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="rounded-2xl bg-gradient-to-r from-green-200 to-green-100 text-gray-900 focus:ring-4 focus:ring-green-400 transition-all"
            />
          </div>

          <Button
            onClick={handleAddMilestone}
            disabled={loading || !selectedProjectId}
            className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:from-orange-500 hover:to-pink-500 text-white font-bold py-3 rounded-2xl shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
          >
            {loading ? "Adding..." : "Add Milestone"}
          </Button>

          {message && (
            <p
              className={`mt-4 text-xl font-bold flex items-center ${
                messageType === "success" ? "text-green-200" :
                messageType === "error" ? "text-red-200" :
                "text-yellow-200"
              }`}
            >
              {messageIcon()} {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMilestone;
