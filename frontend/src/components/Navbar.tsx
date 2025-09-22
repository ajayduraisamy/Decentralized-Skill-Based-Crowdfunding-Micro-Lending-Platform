// src/components/Navbar.tsx
import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link to="/">Crowdfund</Link>
        </div>
        <div className="space-x-4">
          <Link className="hover:text-gray-200" to="/">Home</Link>
          <Link className="hover:text-gray-200" to="/register">Register</Link>
          <Link className="hover:text-gray-200" to="/login">Login</Link>
          <Link className="hover:text-gray-200" to="/dashboard">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
