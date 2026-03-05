"use client";

import Image from "next/image";
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
        localStorage.setItem("role", data.role);
        
        if (data.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/blockchain");
        }
      }
    } catch {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-8"
      style={{ fontFamily: "\"Museo Sans\", \"Museo Sans 700\", sans-serif" }}
    >
      <div className="w-full max-w-[460px] rounded-2xl border border-zinc-200 bg-white px-4 py-5 text-zinc-900 shadow-[0_10px_22px_rgba(0,0,0,0.08)] sm:px-5 sm:py-6">
        <div className="mx-auto max-w-[340px]">
          <div className="mb-2 flex justify-center">
            <Image
              src="/emailicon.svg"
              alt="Email icon"
              width={140}
              height={140}
              priority
              className="h-[34px] w-[34px] sm:h-[40px] sm:w-[40px]"
            />
          </div>

          <h2 className="text-center text-xl font-bold text-black sm:text-2xl">
            Enter OTP Code
          </h2>
          <p className="mx-auto mt-1.5 max-w-[320px] text-center text-xs text-zinc-800 sm:text-sm sm:leading-snug">
            Please enter the 6-digit code sent to your registered email to
            complete your verification.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 sm:mt-5">
            <input
              type="text"
              placeholder="OTP Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="h-10 w-full rounded-lg border border-zinc-500 bg-white px-3 text-sm tracking-[0.14em] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#562F00] focus:ring-2 focus:ring-[#562F00]/20"
            />

            <button
              type="submit"
              disabled={loading}
              className={`h-11 w-full rounded-full text-lg font-bold text-white transition ${
                loading
                  ? "cursor-not-allowed bg-[#8b5f2f]"
                  : "bg-[#562F00] hover:bg-[#6a3a05]"
              }`}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          {message && (
            <p className="mt-5 text-center text-base font-medium text-zinc-800">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}