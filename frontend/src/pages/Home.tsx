// src/pages/Home.tsx
import React from "react";
import { motion } from "framer-motion";
import { FaRocket, FaProjectDiagram, FaUsers } from "react-icons/fa";

const Home: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 text-center px-6">
      {/* Hero Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 mb-6"
      >
        Welcome to Crowdfund Platform
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-gray-700 text-lg md:text-xl max-w-2xl mb-10"
      >
        Explore projects, create your own, and track milestones seamlessly.  
        Empower ideas with the support of a thriving community.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="flex gap-4"
      >
        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition">
          Start a Project
        </button>
        <button className="px-6 py-3 border border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition">
          Explore Projects
        </button>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl"
      >
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
          <FaProjectDiagram className="text-blue-600 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Innovative Ideas</h3>
          <p className="text-gray-600 text-sm">
            Share your groundbreaking ideas and turn them into reality with the right support.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
          <FaRocket className="text-indigo-500 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Seamless Launch</h3>
          <p className="text-gray-600 text-sm">
            Create campaigns effortlessly and launch your projects with ease.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
          <FaUsers className="text-green-500 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Strong Community</h3>
          <p className="text-gray-600 text-sm">
            Connect with a supportive community of backers and innovators.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
