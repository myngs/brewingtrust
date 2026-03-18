"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type Stats = {
  totalStaff: number;
  activeToday: number;
};

type FlaggedRow = {
  employee: string;
  date: string;
  reason: string;
};

type AttendanceRow = {
  employee: string;
  date: string;
  clockIn: number | null;
  clockOut: number | null;
  status: string;
};

type ApiUser = {
  role?: string;
};

type AttendanceRecord = {
  date?: string;
  status?: string;
  totalHours?: number;
  clockIn?: number | null;
  clockOut?: number | null;
  recordHash?: string;
  blockchainTxHash?: string;
  userId?: {
    _id?: string;
    username?: string;
    fullName?: string;
    employeeId?: string;
  };
};

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats>({ totalStaff: 0, activeToday: 0 });
  const [anomalies, setAnomalies] = useState<FlaggedRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [usersResponse, attendanceResponse] = await Promise.all([
        fetch(`${API_BASE}/api/auth/users`, { headers }),
        fetch(`${API_BASE}/api/attendance/all`, { headers })
      ]);

      const usersPayload = (usersResponse.ok ? await usersResponse.json() : { users: [] }) as { users?: ApiUser[] };
      const attendancePayload = (attendanceResponse.ok ? await attendanceResponse.json() : { records: [] }) as { records?: AttendanceRecord[] };

      const users = usersPayload.users || [];
      const records = attendancePayload.records || [];

      // Today in YYYYMMDD format to match attendance JSON (e.g., "20260318")
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const today = `${yyyy}${mm}${dd}`;

      // Count all non-admin accounts as staff (includes employees, supervisors, etc.)
      const totalStaff = users.filter((u) => u.role !== "admin").length;

      // Active Today: employees who have actually clocked in today
      const activeTodayEmployees = new Set(
        records
          .filter((r) => r.date === today && typeof r.clockIn === "number")
          .map((r) => r.userId?._id || r.userId?.employeeId || r.userId?.username)
          .filter(Boolean)
      );
      const activeToday = activeTodayEmployees.size;

      setStats({ totalStaff, activeToday });

      const flagged = records
        .filter((record) => !record.clockOut || (record.totalHours ?? 0) > 12 || (record.totalHours ?? 0) < 0)
        .slice(0, 5)
        .map((record) => ({
          employee: record.userId?.fullName || record.userId?.employeeId || record.userId?.username || record.userId?._id || "Unknown",
          date: record.date || "—",
          reason: !record.clockOut ? "No clock out" : (record.totalHours ?? 0) > 12 ? "Overtime" : "Invalid hours"
        }));
      setAnomalies(flagged);

      const todayRecords = records
        .filter((r) => r.date === today)
        .slice(0, 10)
        .map((record) => ({
          employee: record.userId?.fullName || record.userId?.employeeId || record.userId?.username || "Unknown",
          date: record.date || "—",
          clockIn: record.clockIn ?? null,
          clockOut: record.clockOut ?? null,
          status: record.status || "—"
        }));
      setAttendance(todayRecords);
    } catch (err) {
      console.error("Error fetching overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="text-sm font-semibold text-[#F89040] mb-2">Brewing Trust</div>
        <h1 className="text-3xl font-extrabold text-zinc-900">Overview Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#F89040] rounded-full flex items-center justify-center">
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

      <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)] mb-8">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">Anomaly Detection Feed</h3>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Employee</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Flagged Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="py-8 px-4 text-center text-zinc-500">Loading...</td>
              </tr>
            ) : anomalies.length > 0 ? (
              anomalies.map((a, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4 px-4 text-zinc-700">{a.employee}</td>
                  <td className="py-4 px-4 text-zinc-700">{a.date}</td>
                  <td className="py-4 px-4 text-orange-600 font-medium">{a.reason}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-8 px-4 text-center text-zinc-500">No anomalies detected</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Attendance Feed removed as requested */}
    </div>
  );
}
