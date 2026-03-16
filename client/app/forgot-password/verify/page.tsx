"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type VerifyResponse = {
  message: string;
  resetGrantToken?: string;
  error?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function ForgotPasswordVerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("passwordResetToken");
    if (!token) router.replace("/forgot-password");
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const resetToken = sessionStorage.getItem("passwordResetToken");
    if (!resetToken) {
      router.replace("/forgot-password");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, otp }),
      });

      const data = (await res.json()) as VerifyResponse;
      setMessage(data.message || (res.ok ? "Verified." : "Invalid or expired code"));

      if (res.ok && data.resetGrantToken) {
        sessionStorage.setItem("passwordResetGrantToken", data.resetGrantToken);
        await new Promise((r) => setTimeout(r, 200));
        router.push("/forgot-password/reset");
      }
    } catch {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <main className="w-full max-w-md rounded-3xl border border-zinc-100/70 bg-white/95 p-8 backdrop-blur-sm">
        <h1 className="text-2xl font-bold tracking-tight text-[#562F00]">Verify Code</h1>
        <p className="mt-2 text-sm text-zinc-500">Enter the 6-digit code sent to your email.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-[#562F00] focus:border-[#562F00] focus:bg-white focus:ring-2 focus:ring-[#562F00]/30"
          />

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center rounded-full px-4 py-3 text-sm text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              loading ? "cursor-not-allowed bg-[#562F00]/60" : "bg-[#562F00] hover:bg-[#562F00]"
            }`}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-xs text-zinc-600">{message}</p>}

        <div className="mt-6 flex justify-center gap-4 text-xs text-zinc-500">
          <Link href="/forgot-password" className="text-[#562F00] hover:underline">
            Resend code
          </Link>
          <Link href="/" className="text-[#562F00] hover:underline">
            Back to login
          </Link>
        </div>
      </main>
    </div>
  );
}

