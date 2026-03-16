"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ResetResponse = {
  message: string;
  error?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function ForgotPasswordResetPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const grant = sessionStorage.getItem("passwordResetGrantToken");
    if (!grant) router.replace("/forgot-password");
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const resetGrantToken = sessionStorage.getItem("passwordResetGrantToken");
    if (!resetGrantToken) {
      router.replace("/forgot-password");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetGrantToken, password, confirmPassword }),
      });

      const data = (await res.json()) as ResetResponse;
      setMessage(data.message || (res.ok ? "Password reset successful." : "Unable to reset password"));

      if (res.ok) {
        sessionStorage.removeItem("passwordResetToken");
        sessionStorage.removeItem("passwordResetGrantToken");
        await new Promise((r) => setTimeout(r, 400));
        router.push("/");
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
        <h1 className="text-2xl font-bold tracking-tight text-[#562F00]">Reset Password</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Create a new password (8+ chars, uppercase, lowercase, number, special).
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 pr-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-[#562F00] focus:border-[#562F00] focus:bg-white focus:ring-2 focus:ring-[#562F00]/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-400 transition hover:text-zinc-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <span className="text-xs">{showPassword ? "Hide" : "Show"}</span>
            </button>
          </div>

          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Resetting..." : "Reset password"}
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

