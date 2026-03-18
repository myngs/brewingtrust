"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type AttendanceRecord = {
  date?: string;
  status?: string;
  totalHours?: number | null;
  recordHash?: string | null;
  blockchainTxHash?: string | null;
  userId?: {
    username?: string | null;
    fullName?: string | null;
    employeeId?: string | null;
  } | null;
};

type LedgerRow = {
  employee: string;
  date: string;
  txHash: string;
  recordHash: string;
  totalHours: string;
  status: string;
};

const shortenHash = (hash: string) => {
  if (!hash) return "—";
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
};

export default function LedgerPage() {
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const totalOnChain = useMemo(() => rows.length, [rows]);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/attendance/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) return;

      const data = (await response.json()) as { records?: AttendanceRecord[] };
      const records = data.records || [];

      const ledgerRows = records
        .filter((record) => record.blockchainTxHash)
        .slice(0, 25)
        .map((record) => ({
          employee: record.userId?.fullName || record.userId?.employeeId || record.userId?.username || "Unknown",
          date: record.date || "—",
          txHash: shortenHash(String(record.blockchainTxHash || "")),
          recordHash: shortenHash(String(record.recordHash || "")),
          totalHours: typeof record.totalHours === "number" ? `${record.totalHours.toFixed(2)}h` : "—",
          status: record.status || "—"
        }));

      setRows(ledgerRows);
    } catch (err) {
      console.error("Error fetching ledger records:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="text-sm font-semibold text-[#F89040] mb-2">Brewing Trust</div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F89040] rounded-full flex items-center justify-center">
            <Image src="/icons/ledger.png" alt="Ledger icon" width={16} height={16} className="filter brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900">Blockchain Ledger</h1>
            <div className="text-sm text-zinc-600 mt-1">{totalOnChain} on-chain entries</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F89040] rounded-full flex items-center justify-center">
              <Image src="/icons/ledger.png" alt="Ledger icon" width={16} height={16} className="filter brightness-0 invert" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Attendance Hash Ledger</h3>
          </div>

          <button
            className="px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-medium disabled:opacity-50"
            onClick={fetchLedger}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Employee</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Transaction Hash</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Record Hash</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Total Hours</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, i) => (
                <tr key={`${row.txHash}-${i}`} className="border-b border-gray-100">
                  <td className="py-4 px-4 text-zinc-700">{row.employee}</td>
                  <td className="py-4 px-4 text-zinc-700">{row.date}</td>
                  <td className="py-4 px-4 text-zinc-700 font-mono text-xs">{row.txHash}</td>
                  <td className="py-4 px-4 text-zinc-700 font-mono text-xs">{row.recordHash}</td>
                  <td className="py-4 px-4 text-zinc-700">{row.totalHours}</td>
                  <td className="py-4 px-4 text-zinc-700">{row.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-zinc-500">
                  {loading ? "Loading ledger..." : "No on-chain records found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
