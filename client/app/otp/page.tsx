"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OTP() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // prevent double click
    setLoading(true);
    setMessage("");

    const userId = localStorage.getItem("tempUserId");

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();
      setMessage(data.message);

      // ✅ Show loading for at least a short tick
      await new Promise((r) => setTimeout(r, 200));

      if (data.token) {
        localStorage.removeItem("tempUserId");
        localStorage.setItem("token", data.token);
        router.push("/blockchain");
      }
    } catch {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-zinc-200 text-zinc-900">
        <h2 className="mb-2 text-center text-3xl font-bold text-orange-500">
          Verify OTP
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-700">
          Enter the code sent to your email
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 font-semibold text-white transition ${
              loading
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-zinc-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
