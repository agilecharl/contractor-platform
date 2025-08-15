import React from 'react';

// Example data
const projects = [
  { id: 1, name: 'Website Redesign', status: 'In Progress' },
  { id: 2, name: 'Mobile App Development', status: 'Pending' },
  { id: 3, name: 'Marketing Campaign', status: 'Completed' },
];

const invoices = [
  { id: 1, amount: 2500, status: 'Paid' },
  { id: 2, amount: 1800, status: 'Pending' },
  { id: 3, amount: 3200, status: 'Overdue' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
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

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
            <p className="text-3xl font-bold">5</p>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Project Name</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-t">
                  <td className="p-3">{project.name}</td>
                  <td className="p-3">{project.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoices Table */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Invoices</h2>
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t">
                  <td className="p-3">${invoice.amount}</td>
                  <td className="p-3">{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
