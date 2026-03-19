"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

const PAY_RATE_PER_HOUR = 50; // PHP 50 per hour
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type VerifiedRow = {
  employeeId: string;
  date: string;
  clockIn: number;
  totalhours: string;
};

type PayrollRow = {
  employee: string;
  hoursWorked: number;
  ratePerHour: number;
  payroll: number;
};

type FlaggedRow = {
  employeeId: string;
  date: string;
  reason: string;
};

type AttendanceRecord = {
  date?: string;
  status?: string;
  totalHours?: number | null;
  clockIn?: number | null;
  clockOut?: number | null;
  recordHash?: string | null;
  blockchainTxHash?: string | null;
  userId?: {
    username?: string | null;
    fullName?: string | null;
    employeeId?: string | null;
  } | null;
};

type ApiUser = {
  role?: string;
};

export default function AttendancePage() {

  const [verified, setVerified] = useState<VerifiedRow[]>([]);
  const [payrollRows, setPayrollRows] = useState<PayrollRow[]>([]);
  const [flaggedRows, setFlaggedRows] = useState<FlaggedRow[]>([]);
  const [blockchainActivity, setBlockchainActivity] = useState<{ txHashes: string[]; recordHashes: string[] }>({
    txHashes: [],
    recordHashes: []
  });
  const [loading, setLoading] = useState(true);

  const totalPayroll = useMemo(() => payrollRows.reduce((sum, row) => sum + (row.payroll || 0), 0), [payrollRows]);

  useEffect(() => {
    fetchVerifiedRecords();
  }, []);

  const fetchVerifiedRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const attendanceResponse = await fetch(`${API_BASE}/api/attendance/all`, { headers });

      if (attendanceResponse.ok) {
        const data = (await attendanceResponse.json()) as { records?: AttendanceRecord[] };
        const records = data.records || [];

        const verifiedRecords = records
          .filter((record) => record.status === "completed")
          .slice(0, 10)
          .map((record) => ({
            employeeId: record.userId?.fullName || record.userId?.employeeId || record.userId?.username || "Unknown",
            date: record.date || "—",
            clockIn: record.clockIn || 0,
            totalhours: record.totalHours ? `${record.totalHours.toFixed(2)}h` : "0.00h",
          }));
        setVerified(verifiedRecords);

        const payrollByEmployee = records.reduce((acc: Record<string, number>, record) => {
          const employee = record.userId?.fullName || record.userId?.employeeId || record.userId?.username || "Unknown";
          const hours = record.status === "completed" ? Math.max(0, Number(record.totalHours || 0)) : 0;
          acc[employee] = (acc[employee] || 0) + hours;
          return acc;
        }, {});

        const payrollData = Object.entries(payrollByEmployee)
          .map(([employee, hoursWorked]) => ({
            employee,
            hoursWorked,
            ratePerHour: PAY_RATE_PER_HOUR,
            payroll: hoursWorked * PAY_RATE_PER_HOUR,
          }))
          .sort((a, b) => b.payroll - a.payroll);

        setPayrollRows(payrollData);

        const flagged = records
          .filter((record) => !record.clockOut || (record.totalHours ?? 0) > 12 || (record.totalHours ?? 0) < 0)
          .slice(0, 5)
          .map((record) => ({
            employeeId: record.userId?.fullName || record.userId?.employeeId || record.userId?.username || "Unknown",
            date: record.date || "—",
            reason: !record.clockOut ? "Missing clock out" : (record.totalHours ?? 0) > 12 ? "Overtime" : "Invalid hours"
          }));
        setFlaggedRows(flagged);

        const txHashes = records
          .filter((record) => record.status === "completed" && record.blockchainTxHash)
          .slice(0, 5)
          .map((record) => record.blockchainTxHash as string);
        const recordHashes = records
          .filter((record) => record.recordHash)
          .slice(0, 5)
          .map((record) => record.recordHash as string);
        setBlockchainActivity({ txHashes, recordHashes });
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
        <div className="text-sm font-semibold text-[#F89040] mb-2">Brewing Trust</div>
        <h1 className="text-3xl font-extrabold text-zinc-900">Attendance & Payroll</h1>
      </div>



      {/* Verified Records */}
      <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)] mb-8">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">Verified Attendance Record</h3>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Employee</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Clock Input</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Total Hours</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {verified.length > 0 ? (
              verified.map((a, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4 px-4 text-zinc-700">{a.employeeId}</td>
                  <td className="py-4 px-4 text-zinc-700">{a.date}</td>
                  <td className="py-4 px-4 text-zinc-700">
                    {a.clockIn ? new Date(a.clockIn * 1000).toLocaleTimeString() : "N/A"}
                  </td>
                  <td className="py-4 px-4 text-zinc-700">{a.totalhours}</td>
                  <td className="py-4 px-4 text-green-600 font-medium">Verified</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-zinc-500">
                  {loading ? "Loading records..." : "No verified records available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payroll Table */}
      <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)] mb-8">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">Employee Payroll (Based on Hours Worked)</h3>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Employee</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Hours Worked</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Rate / Hour</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Payroll</th>
            </tr>
          </thead>
          <tbody>
            {payrollRows.length > 0 ? (
              payrollRows.map((row, i) => (
                <tr key={`${row.employee}-${i}`} className="border-b border-gray-100">
                  <td className="py-4 px-4 text-zinc-700">{row.employee}</td>
                  <td className="py-4 px-4 text-zinc-700">{row.hoursWorked.toFixed(2)}</td>
                  <td className="py-4 px-4 text-zinc-700">PHP {row.ratePerHour.toLocaleString()}</td>
                  <td className="py-4 px-4 text-zinc-900 font-semibold">PHP {row.payroll.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 px-4 text-center text-zinc-500">
                  {loading ? "Loading payroll..." : "No payroll data available"}
                </td>
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
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Employee</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Flagged Reason</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Action</th>
              </tr>
            </thead>
          <tbody>
              {flaggedRows.length > 0 ? (
                flaggedRows.map((row, i) => (
                  <tr key={`${row.employeeId}-${row.date}-${i}`} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-zinc-700">{row.employeeId}</td>
                    <td className="py-4 px-4 text-zinc-700">{row.date}</td>
                    <td className="py-4 px-4 text-zinc-700">{row.reason}</td>
                    <td className="py-4 px-4 text-zinc-500 text-xl">&gt;</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-zinc-500">
                    {loading ? "Loading flagged records..." : "No flagged records found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Blockchain Activity Feed */}
        <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#F89040] rounded-full flex items-center justify-center">
              <Image src="/icons/ledger.png" alt="Blockchain icon" width={16} height={16} className="filter brightness-0 invert" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Blockchain Activity Feed</h3>
          </div>

          <div className="flex items-end justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-zinc-900">PHP {totalPayroll.toLocaleString()}</h2>
            <button className="bg-[#F89040] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#E07F33] transition">
              Execute Smart Contract
            </button>
          </div>

          <div>
            <p className="font-semibold text-zinc-900 mb-2">Transaction Hashes</p>
            {blockchainActivity.txHashes.length > 0 ? (
              <ul className="text-zinc-500 mb-4 space-y-1">
                {blockchainActivity.txHashes.map((hash, i) => (
                  <li key={`${hash}-${i}`}>{`${hash.slice(0, 10)}...${hash.slice(-6)}`}</li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 mb-4">{loading ? "Loading..." : "—"}</p>
            )}

            <p className="font-semibold text-zinc-900 mb-2">Blockchain Hashes</p>
            {blockchainActivity.recordHashes.length > 0 ? (
              <ul className="text-zinc-500 space-y-1">
                {blockchainActivity.recordHashes.map((hash, i) => (
                  <li key={`${hash}-${i}`}>{`${hash.slice(0, 10)}...${hash.slice(-6)}`}</li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500">{loading ? "Loading..." : "—"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
