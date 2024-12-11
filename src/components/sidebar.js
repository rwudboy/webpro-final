import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, DollarSign, PieChart, Settings } from 'react-feather';

const Sidebar = () => {
  return (
    <aside className="bg-white w-64 min-h-screen p-4">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link to="/" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-md p-2">
              <BarChart2 className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/set-limit" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-md p-2">
              <Settings className="w-5 h-5" />
              <span>Set Limit</span>
            </Link>
          </li>
          <li>
            <Link to="/log-expense" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-md p-2">
              <DollarSign className="w-5 h-5" />
              <span>Log Expense</span>
            </Link>
          </li>
          <li>
            <Link to="/report" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-md p-2">
              <PieChart className="w-5 h-5" />
              <span>Report</span>
            </Link>
          </li>
          <li>
            <Link to="/summary" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-md p-2">
              <BarChart2 className="w-5 h-5" />
              <span>Summary</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

