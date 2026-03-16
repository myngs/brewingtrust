"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ForgotPasswordResponse = {
  message: string;
  resetToken?: string;
  error?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as ForgotPasswordResponse;
      setMessage(data.message || "Check your email for the reset code.");

      if (data.resetToken) {
        sessionStorage.setItem("passwordResetToken", data.resetToken);
      }

      if (res.ok) {
        await new Promise((r) => setTimeout(r, 200));
        router.push("/forgot-password/verify");
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
        <h1 className="text-2xl font-bold tracking-tight text-[#562F00]">Forgot Password</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Enter your email and we&apos;ll send you a verification code.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Sending..." : "Send code"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-xs text-zinc-600">{message}</p>}

        <div className="mt-6 text-center text-xs text-zinc-500">
          <Link href="/" className="text-[#562F00] hover:underline">
            Back to login
          </Link>
        </div>
      </main>
    </div>
  );
}

