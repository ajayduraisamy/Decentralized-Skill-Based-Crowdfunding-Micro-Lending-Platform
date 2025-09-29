import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-10">
      <div className="container mx-auto text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Block Chain Based Crowdfund  MicroLending Platform. All rights reserved.</p>
        <p className="text-xs mt-1">
          Built with React, TailwindCSS & Solidity
        </p>
      </div>
    </footer>
  );
};

export default Footer;
