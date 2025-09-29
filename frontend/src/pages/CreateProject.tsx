import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

import type { UserType } from "../types";

interface CreateProjectProps {
  user?: UserType | null;
}

const CreateProject: React.FC<CreateProjectProps> = ({ user }) => {
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const handleCreateProject = async () => {
    if (!user) {
      setMessage("You must be logged in as a borrower.");
      setMessageType("error");
      return;
    }
    if (!projectName) {
      setMessage("Please enter a project name.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      const res = await fetch("http://localhost:5000/create_project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          borrower_id: user.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        let msg = `Project "${projectName}" created! ID: ${data.project_id}`;
        if (data.on_chain && data.tx_hash) {
          msg += ` | Transaction: ${data.tx_hash}`;
        }
        setMessage(msg);
        setMessageType("success");
        setProjectName("");
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

  return (
    <div className="max-w-2xl mx-auto mt-16 px-4">
      <Card className="p-8 shadow-2xl rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-gray-200 transform transition-transform hover:-translate-y-2 hover:shadow-3xl">
        <CardContent className="space-y-6">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            Create New Project
          </h1>
          <p className="text-gray-700 font-medium">
            Enter a name for your project to start crowdfunding.
          </p>

          <Input
            type="text"
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition-all duration-300 font-semibold text-gray-800"
          />

          <Button
            onClick={handleCreateProject}
            disabled={loading || !projectName}
            className="w-full py-3 font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 transform transition-transform hover:scale-105 shadow-lg rounded-xl"
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>

          {message && (
            <p
              className={`mt-2 text-sm font-medium ${
                messageType === "success"
                  ? "text-green-600"
                  : messageType === "error"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProject;
