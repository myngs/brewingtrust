"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function OverviewPage() {
  const stats = {
    totalStaff: 124,
    activeToday: 35,
  };

  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch recent attendance records for anomalies (flagged records)
      const anomaliesResponse = await fetch("http://localhost:5000/api/attendance/all", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (anomaliesResponse.ok) {
        const data = await anomaliesResponse.json();
        // Filter for records that might be anomalies (e.g., no clock out, unusual hours)
        const flaggedRecords = data.records
          .filter((record: any) => !record.clockOut || record.totalHours > 12 || record.totalHours < 0)
          .slice(0, 5) // Show only recent 5
          .map((record: any) => ({
            id: record.userId._id,
            time: record.date,
            reason: !record.clockOut ? "No clock out" : record.totalHours > 12 ? "Overtime" : "Invalid hours"
          }));
        setAnomalies(flaggedRecords);
      }

      // Fetch today's attendance records
      const today = new Date();
      const dateStr = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

      const attendanceResponse = await fetch(`http://localhost:5000/api/attendance/today/${dateStr}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (attendanceResponse.ok) {
        const data = await attendanceResponse.json();
        // This would need to be modified to get all users' records for today
        // For now, showing sample data structure
        setAttendance([
          { date: dateStr, work: true, paid: true, verified: true },
          { date: dateStr, work: true, paid: false, verified: false },
          { date: dateStr, work: false, paid: false, verified: false }
        ]);
      }

    } catch (err) {
      console.error("Error fetching overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm font-semibold text-[#8b5a2b] mb-2">Brewing Trust Admin</div>
        <h1 className="text-3xl font-extrabold text-zinc-900">Overview Dashboard</h1>
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

      {/* Anomaly Table */}
      <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)] mb-8">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">Anomaly Detection Feed</h3>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Employee ID</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Time Plan ID</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Flagged Reason</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.length > 0 ? anomalies.map((a, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-4 px-4 text-zinc-700">{a.id}</td>
                <td className="py-4 px-4 text-zinc-700">{a.time}</td>
                <td className="py-4 px-4 text-orange-600 font-medium">{a.reason}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="py-8 px-4 text-center text-zinc-500">No anomalies detected</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Attendance Table */}
      <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">Attendance Feed</h3>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Work/Study</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Last Paid</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Verified</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length > 0 ? attendance.map((a, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-4 px-4 text-zinc-700">{a.date}</td>
                <td className="py-4 px-4">
                  <span className={a.work ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {a.work ? "✔" : "—"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={a.paid ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {a.paid ? "✔" : "—"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={a.verified ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {a.verified ? "Verified" : "—"}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-8 px-4 text-center text-zinc-500">No attendance records available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}