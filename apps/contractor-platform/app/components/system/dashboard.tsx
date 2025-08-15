import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Example Data
const projects = [
  { id: 1, name: 'Website Redesign', status: 'In Progress', progress: 60 },
  { id: 2, name: 'Mobile App Development', status: 'Pending', progress: 0 },
  { id: 3, name: 'Marketing Campaign', status: 'Completed', progress: 100 },
];

const invoices = [
  { id: 1, amount: 2500, status: 'Paid' },
  { id: 2, amount: 1800, status: 'Pending' },
  { id: 3, amount: 3200, status: 'Overdue' },
];

const notifications = [
  'New project assigned: Website Redesign',
  'Invoice #102 is overdue',
  'Client feedback received on Mobile App',
  'System maintenance scheduled for Friday',
  'New message from John Doe',
];

const Dashboard: React.FC = () => {
  // Line Chart (Revenue Trend)
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [2500, 3200, 2800, 3500, 4000, 4500],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        tension: 0.3,
      },
    ],
  };

  // Doughnut Chart (Project Status)
  const statusData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [
          projects.filter((p) => p.status === 'Completed').length,
          projects.filter((p) => p.status === 'In Progress').length,
          projects.filter((p) => p.status === 'Pending').length,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:block">
        <div className="p-6 text-2xl font-bold border-b">
          Contractor Platform
        </div>
        <nav className="mt-6">
          <ul>
            <li className="p-4 hover:bg-gray-200 cursor-pointer">Dashboard</li>
            <li className="p-4 hover:bg-gray-200 cursor-pointer">Projects</li>
            <li className="p-4 hover:bg-gray-200 cursor-pointer">Invoices</li>
            <li className="p-4 hover:bg-gray-200 cursor-pointer">Messages</li>
            <li className="p-4 hover:bg-gray-200 cursor-pointer">Settings</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-lg font-medium">Active Projects</h2>
            <p className="text-3xl font-bold">{projects.length}</p>
          </div>
          <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-lg font-medium">Pending Invoices</h2>
            <p className="text-3xl font-bold">
              {invoices.filter((i) => i.status === 'Pending').length}
            </p>
          </div>
          <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-lg font-medium">Notifications</h2>
            <p className="text-3xl font-bold">{notifications.length}</p>
          </div>
          <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-lg font-medium">Monthly Revenue</h2>
            <p className="text-3xl font-bold">$4,500</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
            <Line data={revenueData} />
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Project Status</h2>
            <Doughnut data={statusData} />
          </div>
        </div>

        {/* Task Progress Tracker */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Progress</h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-4">
              <p className="font-medium">{project.name}</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                <div
                  className={`h-3 rounded-full ${
                    project.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Notifications Panel */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
          <ul className="list-disc pl-5">
            {notifications.map((note, index) => (
              <li key={index} className="mb-2">
                {note}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
