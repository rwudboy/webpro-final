import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, DollarSign, LogOut, PieChart, Settings, User } from 'react-feather';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                WiseSpend
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

