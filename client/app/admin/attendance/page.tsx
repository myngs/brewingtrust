"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function AttendancePage() {
  const stats = {
    totalStaff: 124,
    activeToday: 35,
  };
  const [verified, setVerified] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifiedRecords();
  }, []);

  const fetchVerifiedRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/attendance/all", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter for completed records and format for display
        const verifiedRecords = data.records
          .filter((record: any) => record.status === "completed")
          .slice(0, 10) // Show recent 10 records
          .map((record: any) => ({
            hash: record.blockchainTxHash ? `${record.blockchainTxHash.slice(0, 10)}...` : "N/A",
            block: record.date,
            totalhours: record.totalHours ? `${record.totalHours.toFixed(2)}h` : "0.00h",
            status: "● Verified",
            employeeId: record.userId.username,
            date: record.date
          }));
        setVerified(verifiedRecords);
      }
    } catch (err) {
      console.error("Error fetching verified records:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm font-semibold text-[#8b5a2b] mb-2">Brewing Trust Admin</div>
        <h1 className="text-3xl font-extrabold text-zinc-900">Attendance & Payroll</h1>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#8b5a2b] rounded-full flex items-center justify-center">
              <Image src="/icons/employee.png" alt="Employee icon" width={20} height={20} className="filter brightness-0 invert" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-500">Total Staff</p>
              <h2 className="text-4xl font-extrabold text-zinc-900">{stats.totalStaff}</h2>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Image src="/icons/attendance.png" alt="Attendance icon" width={20} height={20} className="filter brightness-0 invert" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-500">Active Today</p>
              <h2 className="text-4xl font-extrabold text-zinc-900">{stats.activeToday}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Records */}
      <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)] mb-8">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">Verified Attendance Record</h3>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Employee ID</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Clock Input</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Total Hours</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {verified.length > 0 ? verified.map((a, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-4 px-4 text-zinc-700">{a.id}</td>
                <td className="py-4 px-4 text-zinc-700">{a.date}</td>
                <td className="py-4 px-4 text-zinc-700">{a.input}</td>
                <td className="py-4 px-4 text-zinc-700">{a.totalhours}</td>
                <td className="py-4 px-4 text-green-600 font-medium">● Verified</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-zinc-500">No verified records available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Flagged Records */}
        <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <h3 className="text-xl font-bold text-zinc-900 mb-6">Flagged Records - Review Required</h3>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Employee ID</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Flagged Reason</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 text-zinc-700">EMP-102</td>
                <td className="py-4 px-4 text-zinc-700">2-3-26</td>
                <td className="py-4 px-4 text-zinc-700">Late Clock-In</td>
                <td className="py-4 px-4 text-zinc-500 text-xl">›</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-zinc-700">EMP-117</td>
                <td className="py-4 px-4 text-zinc-700">2-3-26</td>
                <td className="py-4 px-4 text-zinc-700">Missing Logout</td>
                <td className="py-4 px-4 text-zinc-500 text-xl">›</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Blockchain Activity Feed */}
        <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#8b5a2b] rounded-full flex items-center justify-center">
              <Image src="/icons/ledger.png" alt="Blockchain icon" width={16} height={16} className="filter brightness-0 invert" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Blockchain Activity Feed</h3>
          </div>

          <div className="flex items-end justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-zinc-900">₱40,000.00</h2>
            <button className="bg-[#8b5a2b] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#7a4a1b] transition">
              Execute Smart Contract
            </button>
          </div>

          <div>
            <p className="font-semibold text-zinc-900 mb-2">Transaction Hashes</p>
            <p className="text-zinc-500 mb-4">0x7d8a9b12e456...</p>

            <p className="font-semibold text-zinc-900 mb-2">Blockchain Hashes</p>
            <p className="text-zinc-500">0xa4c78d8b9023...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
