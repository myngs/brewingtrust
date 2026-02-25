"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const employees: any[] = [
  // Data will be fetched from API
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Format users for display
        const formattedEmployees = data.users.map((user: any) => ({
          id: user._id.slice(-9), // Show last 9 chars of ID
          name: user.username,
          email: user.email,
          role: user.role,
          supervisor: "N/A", // Could be added to user model later
          status: user.walletAddress ? "Active" : "Inactive" // Simple status based on wallet
        }));
        setEmployees(formattedEmployees);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };
  const statusOptions = ["All", "Active", "Inactive", "Suspended"];
  const roleOptions = ["Manager", "Staff", "Admin"];
  const supervisorOptions = ["Lisa M.", "Carl G.", "John P."];

  const handleAction = (empId: string, action: string) => {
    if (action === "Edit Role") {
      alert(`Navigate to Edit Role page for ${empId}`);
    } else if (action === "Deactivate") {
      alert(`Employee ${empId} will be deactivated`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="text-sm font-semibold text-[#8b5a2b] mb-2">Brewing Trust Admin</div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#8b5a2b] rounded-full flex items-center justify-center">
              <Image src="/icons/employee.png" alt="Employee icon" width={16} height={16} className="filter brightness-0 invert" />
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900">Employee List</h1>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="bg-[#8b5a2b] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#7a4a1b] transition">
            + Add Employee
          </button>
          <button className="bg-white text-[#8b5a2b] border border-[#8b5a2b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.10)] mb-8">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search by name, ID or email"
            className="flex-1 min-w-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5a2b] focus:border-transparent"
          />

          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5a2b] focus:border-transparent">
            <option>Status</option>
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>

          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5a2b] focus:border-transparent">
            <option>Role</option>
            {roleOptions.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>

          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5a2b] focus:border-transparent">
            <option>Supervisor</option>
            {supervisorOptions.map((sup) => (
              <option key={sup}>{sup}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6 font-semibold text-zinc-900">Employee ID</th>
              <th className="text-left py-4 px-6 font-semibold text-zinc-900">Name</th>
              <th className="text-left py-4 px-6 font-semibold text-zinc-900">Email</th>
              <th className="text-left py-4 px-6 font-semibold text-zinc-900">Role</th>
              <th className="text-left py-4 px-6 font-semibold text-zinc-900">Supervisor</th>
              <th className="text-left py-4 px-6 font-semibold text-zinc-900">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-zinc-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? employees.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-6 text-zinc-700">{emp.id}</td>
                <td className="py-4 px-6 text-zinc-700">{emp.name}</td>
                <td className="py-4 px-6 text-zinc-500">{emp.email}</td>
                <td className="py-4 px-6 text-zinc-700">{emp.role}</td>
                <td className="py-4 px-6 text-zinc-700">{emp.supervisor}</td>
                <td className="py-4 px-6">
                  <span
                    className={`font-medium ${
                      emp.status === "Active"
                        ? "text-green-600"
                        : emp.status === "Inactive"
                        ? "text-red-600"
                        : "text-orange-600"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5a2b] focus:border-transparent"
                    onChange={(e) => handleAction(emp.id, e.target.value)}
                  >
                    <option>View</option>
                    <option>Edit Role</option>
                    <option>Deactivate</option>
                  </select>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="py-8 px-6 text-center text-zinc-500">No employees found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
