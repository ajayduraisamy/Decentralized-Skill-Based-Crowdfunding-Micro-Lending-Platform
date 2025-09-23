// src/pages/CreateProject.tsx
import React, { useState } from "react";
import axios from "axios";
import type { UserType } from "../types";

// Declare props
interface CreateProjectProps {
  user: UserType | null;
}

const CreateProject: React.FC<CreateProjectProps> = ({ user }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setMessage("You must be logged in to create a project.");
      return;
    }

    const borrower_id = user.id;

    try {
      const res = await axios.post("http://localhost:5000/create_project", {
        name,
        borrower_id,
      });
      if (res.data.project_id) {
        setMessage(`Project created successfully! ID: ${res.data.project_id}`);
        setName("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to create project.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded mt-6">
      <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Create Project
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
};

export default CreateProject;
