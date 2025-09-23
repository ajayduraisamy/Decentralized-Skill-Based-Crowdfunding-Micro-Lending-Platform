import React from "react";
import { Link } from "react-router-dom";
import type { UserType } from "../types";

interface NavbarProps {
  user?: UserType | null; // allow null
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold tracking-wide">
          <Link to="/">Crowdfund</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link className="hover:text-gray-200 transition-colors" to="/">Home</Link>

          {!user && (
            <>
              <Link className="hover:text-gray-200 transition-colors" to="/register">Register</Link>
              <Link className="hover:text-gray-200 transition-colors" to="/login">Login</Link>
            </>
          )}

          {user && user.role === "borrower" && (
            <Link className="hover:text-gray-200 transition-colors" to="/dashboard-borrower">Dashboard</Link>
          )}

          {user && user.role === "investor" && (
            <Link className="hover:text-gray-200 transition-colors" to="/dashboard-investor">Dashboard</Link>
          )}

          {user && (
            <div className="ml-4 flex items-center space-x-2">
              <span className="px-2 py-1 bg-white text-blue-700 rounded-full text-sm font-semibold">
                {user.name}
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
