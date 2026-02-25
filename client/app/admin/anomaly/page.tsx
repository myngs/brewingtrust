"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function AnomalyPage() {
  const [flagged, setFlagged] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlaggedRecords();
  }, []);

  const fetchFlaggedRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/attendance/all", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter for anomalous records
        const anomalousRecords = data.records
          .filter((record: any) =>
            !record.clockOut || // No clock out
            record.totalHours > 12 || // Overtime
            record.totalHours < 0 || // Invalid hours
            (record.clockIn && !record.clockOut && (Date.now() / 1000 - record.clockIn) > 12 * 3600) // Clocked in > 12 hours ago without clocking out
          )
          .slice(0, 10) // Show recent 10
          .map((record: any) => ({
            id: record.userId.username,
            date: record.date,
            reason: !record.clockOut ? "No clock out" :
                   record.totalHours > 12 ? "Excessive hours" :
                   record.totalHours < 0 ? "Invalid hours" :
                   "Long session without clock out"
          }));
        setFlagged(anomalousRecords);
      }
    } catch (err) {
      console.error("Error fetching flagged records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (empId: string) => {
    alert(`Attendance for ${empId} has been approved.`);
    // You can replace alert with API call or state update
  };

  const handleReject = (empId: string) => {
    alert(`Attendance for ${empId} has been rejected.`);
    // You can replace alert with API call or state update
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm font-semibold text-[#8b5a2b] mb-2">Brewing Trust Admin</div>
        <h1 className="text-3xl font-extrabold text-zinc-900">Anomaly Detection: Review Required</h1>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-[#8b5a2b] rounded-full flex items-center justify-center">
            <Image src="/icons/anomaly.png" alt="Anomaly icon" width={16} height={16} className="filter brightness-0 invert" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">Flagged Attendance Records</h3>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Employee ID</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Time & Date</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Flagged Reason</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {flagged.length > 0 ? flagged.map((a, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-4 px-4 text-zinc-700">{a.id}</td>
                <td className="py-4 px-4 text-zinc-700">{a.date}</td>
                <td className="py-4 px-4 text-zinc-700">{a.reason}</td>
                <td className="py-4 px-4">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600 font-medium"
                    onClick={() => handleApprove(a.id)}
                  >
                    ✔
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-medium"
                    onClick={() => handleReject(a.id)}
                  >
                    ✖
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-8 px-4 text-center text-zinc-500">No flagged records to review</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
