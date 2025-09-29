import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import type { UserType } from "../types";

interface Milestone {
  id: number;
  project_id: number;
  description: string;
  fund_amount: number;
  approved: boolean;
}

interface InvestorApproveMilestonesProps {
  user?: UserType | null;
}

const InvestorApproveMilestones: React.FC<InvestorApproveMilestonesProps> = ({ user }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchPendingMilestones = async () => {
      try {
        const res = await fetch("http://localhost:5000/get_pending_milestones");
        const data = await res.json();
        setMilestones(data.milestones || []);
      } catch (err) {
        console.error("Failed to fetch milestones", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingMilestones();
  }, [user]);

  const handleApprove = async (milestoneId: number) => {
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/approve_milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestone_id: milestoneId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(` Milestone  ${milestoneId} approved on chain!: ${data.block_hash}`);
        //setMessage(`Milestone ${milestoneId} approved on chain!` =${data.block_hash});
        setMilestones((prev) =>
          prev.map((m) => (m.id === milestoneId ? { ...m, approved: true } : m))
        );
      } else {
        setMessage(`Error: ${data.message || "Something went wrong"}`);
      }
    } catch (err) {
      setMessage("Failed to connect to backend.");
    }
  };

  if (!user) {
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">
        You must be logged in to approve milestones.
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 px-4">
      <h1 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
        Pending Milestones
      </h1>

      {message && (
        <p
          className={`mb-4 text-center font-medium ${
            message.includes("approved") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading milestones...</p>
      ) : milestones.length === 0 ? (
        <p className="text-center text-gray-400">No pending milestones.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((milestone) => (
            <Card
              key={milestone.id}
              className="transition-transform transform hover:scale-105 hover:shadow-2xl rounded-2xl border border-gray-200 shadow-md overflow-hidden"
            >
              <CardContent className="space-y-3 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Project ID: {milestone.project_id}
                  </h2>
                  {milestone.approved ? (
                    <FaCheckCircle className="text-green-500 text-xl" />
                  ) : (
                    <FaHourglassHalf className="text-yellow-500 text-xl animate-pulse" />
                  )}
                </div>

                <p className="text-gray-600">{milestone.description}</p>
                <p className="font-medium text-gray-800">
                  Fund Amount: {milestone.fund_amount} ETH
                </p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span className={milestone.approved ? "text-green-600" : "text-yellow-600"}>
                    {milestone.approved ? "Approved" : "Pending"}
                  </span>
                </p>

                {!milestone.approved && (
                  <Button
                    onClick={() => handleApprove(milestone.id)}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2 rounded-xl shadow-md transition-all duration-300"
                  >
                    Approve Milestone
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorApproveMilestones;
