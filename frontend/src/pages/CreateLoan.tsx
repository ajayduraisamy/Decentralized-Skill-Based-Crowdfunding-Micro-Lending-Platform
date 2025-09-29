import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import type { UserType } from "../types";

interface Project {
  id: number;
  name: string;
  total_funded: number;
  current_milestone: number;
  borrower_id: number;
}

interface InvestorLoansProps {
  user?: UserType | null; // investor
}

const CreateLoan: React.FC<InvestorLoansProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:5000/recommend_projects/${user.id}`);
        const data = await res.json();
        setProjects(data.recommendations || []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };

    fetchProjects();
  }, [user]);

  const handleCreateLoan = async () => {
    if (!selectedProjectId || !amount) {
      setMessage("Select a project and enter loan amount.");
      return;
    }
    if (!user) {
      setMessage("You must be logged in as an investor.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/create_loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrower_id: projects.find(p => p.id === selectedProjectId)?.borrower_id,
          lender_id: user.id,
          project_id: selectedProjectId,
          amount: parseFloat(amount)
        }),
      });

      const data = await res.json();

    if (res.ok) {
  setMessage(`Loan created! Loan ID: ${data.loan_id} && TX: ${data.tx_hash || "N/A"}`);
  setAmount("");
  setSelectedProjectId(null);
} else {
  setMessage(`Error: ${data.message || "Something went wrong"}`);
}

    } catch (err) {
      setMessage("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card className="p-6 shadow-xl rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="space-y-6">
          <h1 className="text-3xl font-bold text-center">Create Loan</h1>
          <p className="text-gray-700 text-center">Fund a project by creating a loan.</p>

          <div className="space-y-4">
            <div>
              <label className="font-semibold">Select Project:</label>
              <select
                className="w-full px-4 py-2 border rounded-lg mt-1 focus:ring-2 focus:ring-indigo-300"
                value={selectedProjectId || ""}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Funded: {p.total_funded} ETH)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold">Loan Amount (ETH):</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full px-4 py-2 border rounded-lg mt-1 focus:ring-2 focus:ring-indigo-300"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCreateLoan}
              disabled={loading || !selectedProjectId || !amount}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold"
            >
              {loading ? "Creating..." : "Create Loan"}
            </Button>

            {message && (
              <p className="mt-4 text-center flex items-center justify-center gap-2 text-lg font-medium">
                {message.startsWith("Loan created") ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaTimesCircle className="text-red-600" />
                )}
                <span className={message.startsWith("Loan created") ? "text-green-600" : "text-red-600"}>
                  {message}
                </span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLoan;
