"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import loginImage from "../public/login-image.jpg";

interface LoginResponse {
  message: string;
  token?: string;
  requiresOTP?: boolean;
  user?: {
    id: string;
    role: "admin" | "employee";
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

    // Give React a tick to show loading
    await new Promise((r) => setTimeout(r, 200));

    // OTP required
    if (data.requiresOTP && data.user?.id) {
      localStorage.setItem("tempUserId", data.user.id);
      await router.push("/otp");
      return;
    }

    // Successful login
    if (data.token && data.user) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      if (data.user.role === "admin") {
        await router.push("/admin");
      } else {
        await router.push("/blockchain");
      }
      return;
    }

    // Otherwise, keep showing the message
    setLoading(false);
  } catch (err) {
    setMessage("Server error");
    setLoading(false);
  }
};


  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-zinc-900">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] md:grid md:grid-cols-2">
        <div className="px-10 py-12">
          <div className="text-sm font-semibold text-[#8b5a2b]">Brewing Trust</div>

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-[#ff8a2a]">
            Welcome Back!
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="juandelacruz@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-[#ff8a2a] focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-zinc-700"
              >
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 pr-11 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-[#ff8a2a] focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-zinc-400 hover:text-zinc-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.477 10.47a3 3 0 0 0 4.242 4.243"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.88 5.1A10.94 10.94 0 0 1 12 4c6 0 10 8 10 8a19.14 19.14 0 0 1-4.3 5.2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.61 6.61A19.14 19.14 0 0 0 2 12s4 8 10 8c1.47 0 2.86-.3 4.13-.83"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 2l20 20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="mt-2 flex justify-end">
                <Link href="#" className="text-[11px] text-zinc-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full rounded-full py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                loading
                  ? "cursor-not-allowed bg-orange-300"
                  : "bg-[#ff8a2a] hover:bg-[#f57f1f]"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-sm font-medium text-zinc-600">
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-xs text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-zinc-900 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="relative hidden md:block">
          <Image
            src={loginImage}
            alt="Coffee being poured into a cup"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
