"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function LedgerPage() {
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
        // Filter for completed records with blockchain transactions
        const verifiedRecords = data.records
          .filter((record: any) => record.status === "completed" && record.blockchainTxHash)
          .slice(0, 10) // Show recent 10 records
          .map((record: any) => ({
            hash: `${record.blockchainTxHash.slice(0, 10)}...${record.blockchainTxHash.slice(-4)}`,
            block: record.date,
            totalhours: "● Verified",
            status: "● Verified"
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#8b5a2b] rounded-full flex items-center justify-center">
            <Image src="/icons/ledger.png" alt="Ledger icon" width={16} height={16} className="filter brightness-0 invert" />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900">Blockchain Ledger</h1>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-[#8b5a2b] rounded-full flex items-center justify-center">
            <Image src="/icons/ledger.png" alt="Ledger icon" width={16} height={16} className="filter brightness-0 invert" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">Verified Attendance Record</h3>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Transaction Hash</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Block Number</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Total Hours</th>
              <th className="text-left py-3 px-4 font-semibold text-zinc-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {verified.length > 0 ? verified.map((a, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-4 px-4 text-zinc-700">{a.hash}</td>
                <td className="py-4 px-4 text-zinc-700">{a.block}</td>
                <td className="py-4 px-4 text-green-600 font-medium">{a.totalhours}</td>
                <td className="py-4 px-4 text-green-600 font-medium">{a.status}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-8 px-4 text-center text-zinc-500">No verified records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
