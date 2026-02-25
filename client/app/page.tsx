"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoginResponse {
  message: string;
  token?: string;
  requiresOTP?: boolean;
  locked?: boolean;
  attemptsRemaining?: number;
  user?: {
    id: string;
    role?: "admin" | "employee";
  };
}

export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await res.json();
      setMessage(data.message);

      await new Promise((r) => setTimeout(r, 200));

      if (data.requiresOTP && data.user?.id) {
        localStorage.setItem("tempUserId", data.user.id);
        await router.push("/otp");
        return;
      }

      if (data.token && data.user?.role) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);

        if (data.user.role === "admin") {
          await router.push("/admin");
        } else {
          await router.push("/blockchain");
        }
        return;
      }

      // Show attempts remaining if available
      if (data.attemptsRemaining !== undefined) {
        setMessage(`${data.message} (${data.attemptsRemaining} attempts remaining)`);
      }

      setLoading(false);
    } catch (err) {
      setMessage("Server error");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-zinc-200">
        <h2 className="mb-2 text-center text-3xl font-bold text-orange-500">
          Welcome Back
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-700">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 pr-12 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 font-semibold text-white transition ${
              loading
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-red-500">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-700">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-orange-500 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
