"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type AnomalyRow = {
  employee_id: string;
  clock_in_time: string;
  clock_out_time: string;
  clock_in_hour: number;
  clock_out_hour: number;
  shift_length: number;
  anomaly_flag: number;
};

// Derive a human-readable explanation of why a shift is anomalous
const describeAnomaly = (row: AnomalyRow): string => {
  const reasons: string[] = [];

  if (row.clock_in_hour < 5) {
    reasons.push("Very early clock-in time");
  } else if (row.clock_in_hour > 11) {
    reasons.push("Unusually late clock-in time");
  }

  if (row.clock_out_hour < 10) {
    reasons.push("Unusually early clock-out time");
  } else if (row.clock_out_hour > 21) {
    reasons.push("Very late clock-out time");
  }

  if (row.shift_length > 10) {
    reasons.push("Long shift (possible overtime)");
  } else if (row.shift_length < 3) {
    reasons.push("Very short shift");
  }

  if (!reasons.length) {
    reasons.push("Unusual pattern compared to normal shifts");
  }

  return reasons.join("; ");
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Helper function to format date as M-D-YYYY (e.g., "3-18-2026")
const formatDate = (dateString: string): string => {
  if (!dateString) return "—";

  // If backend ever sends YYYYMMDD (e.g., "20260318"), handle it explicitly
  if (/^\d{8}$/.test(dateString)) {
    const year = Number(dateString.slice(0, 4));
    const month = Number(dateString.slice(4, 6));
    const day = Number(dateString.slice(6, 8));
    return `${month}-${day}-${year}`;
  }

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  } catch {
    return dateString;
  }
};

// Helper function to capitalize first letter of each word
const capitalizeNames = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function AnomalyPage() {
  const [results, setResults] = useState<AnomalyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

const anomalies = useMemo(
    () => results.filter((r) => r.anomaly_flag === -1),
    [results]
  );

  useEffect(() => {
    fetchLatest();
  }, []);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`
    };
  };

  const fetchLatest = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/anomaly/latest`, {
        headers: authHeaders()
      });

      if (!response.ok) {
        // 404 is expected if no scan has run yet.
        setResults([]);
        return;
      }

      const data = await response.json();
      setResults((data.results || []) as AnomalyRow[]);
    } catch (err: any) {
      console.error("Error fetching latest anomaly results:", err);
      setError("Failed to load anomaly results.");
    } finally {
      setLoading(false);
    }
  };

  const runScanNow = async () => {
    setRunning(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/anomaly/run`, {
        headers: authHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "AI scan failed.");
        return;
      }

      setResults((data.results || []) as AnomalyRow[]);
    } catch (err: any) {
      console.error("Error running anomaly scan:", err);
      setError("Failed to run anomaly scan.");
    } finally {
      setRunning(false);
    }
  };

  // Note: We intentionally do not provide approve/reject actions here.
  // The AI's role is to detect and describe anomalies; final decisions
  // are left to the human admin based on the explanation.

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm font-semibold text-[#F89040] mb-2">Brewing Trust</div>
        <h1 className="text-3xl font-extrabold text-zinc-900">AI Anomaly Detection</h1>
        <div className="text-sm text-zinc-600 mt-2">
          Runs Isolation Forest on clock-in/out patterns and flags unusual shifts.
        </div>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F89040] rounded-full flex items-center justify-center">
              <Image
                src="/icons/anomaly.png"
                alt="Anomaly icon"
                width={16}
                height={16}
                className="filter brightness-0 invert"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Flagged Shifts</h3>
              <div className="text-sm text-zinc-600">{anomalies.length} anomalies flagged</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-medium"
              onClick={fetchLatest}
              disabled={loading || running}
            >
              Refresh
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-[#F89040] hover:bg-[#E07F33] text-white font-semibold"
              onClick={runScanNow}
              disabled={running}
            >
              {running ? "Running AI..." : "Run AI Scan"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-zinc-500">Loading...</div>
        ) : anomalies.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            No anomalies flagged. Click "Run AI Scan" to analyze recent attendance logs.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Employee</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Clock In</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Clock Out</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Shift (hrs)</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900">Why flagged?</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4 px-4 text-zinc-700 font-medium">{a.employee_id}</td>
                  <td className="py-4 px-4 text-zinc-700">{formatDate(a.clock_in_time)}</td>
                  <td className="py-4 px-4 text-zinc-700">{formatDate(a.clock_out_time)}</td>
                  <td className="py-4 px-4 text-zinc-700">{a.shift_length?.toFixed?.(2) ?? a.shift_length}</td>
                  <td className="py-4 px-4 text-zinc-700 text-sm">{describeAnomaly(a)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-6 text-xs text-zinc-500">
          Tip: Set `PYTHON_BIN` in `server/.env` if your Python executable isn\'t on PATH.
        </div>
      </div>
    </div>
  );
}
