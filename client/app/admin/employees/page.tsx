"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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
        // Filter out users with role "admin" and format for display
        const formattedEmployees = data.users
          .filter((user: any) => user.role !== "admin")
          .map((user: any) => ({
            _id: user._id,
            id: user.employeeId || user._id.slice(-9),
            name: user.fullName || user.username,
            email: user.email,
            role: user.role,
            supervisor: "N/A",
            status: user.walletAddress ? "Active" : "Inactive"
          }));
        setEmployees(formattedEmployees);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

const supervisorOptions = ["Lisa M.", "Carl G.", "John P."];

  const handleDeactivate = async (realId: string) => {
    if (!confirm("Are you sure you want to permanently delete this employee and their attendance records?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/auth/users/${realId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        alert("Employee deactivated successfully!");
        fetchEmployees(); // Refresh list
      } else {
        const error = await response.json();
        alert("Error: " + error.message);
      }
    } catch (err) {
      alert("Failed to deactivate employee");
      console.error(err);
    }
  };

  const escapeCsvValue = (value: unknown) => {
    const stringValue = String(value ?? "");
    const escaped = stringValue.replace(/"/g, "\"\"");
    return `"${escaped}"`;
  };

  const handleExportCsv = () => {
    if (!employees.length || exporting) return;

    setExporting(true);
    try {
      const headers = ["Employee ID", "Name", "Email", "Role", "Supervisor", "Status"];
      const rows = employees.map((emp) => [
        emp.id,
        emp.name,
        emp.email,
        emp.role,
        emp.supervisor,
        emp.status
      ]);

      const csv = [
        headers.map(escapeCsvValue).join(","),
        ...rows.map((row) => row.map(escapeCsvValue).join(","))
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.setAttribute("download", `employees-${date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
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
          <button
            onClick={handleExportCsv}
            disabled={!employees.length || exporting}
            className="bg-white text-[#8b5a2b] border border-[#8b5a2b] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? "Exporting..." : "Export CSV"}
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
                  <button
                    onClick={() => handleDeactivate(emp._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    Deactivate
                  </button>
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

