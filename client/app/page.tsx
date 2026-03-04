"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    <div
      className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 md:px-6"
      style={{ fontFamily: "\"Museo Sans\", \"Museo Sans 700\", sans-serif", fontWeight: 700 }}
    >
      <main className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-100/70 bg-white/95 backdrop-blur-sm md:h-[520px] md:flex-row">
        <section className="flex w-full flex-col justify-between px-8 py-9 md:w-1/2 md:px-12 md:py-12">
          <div>
            <p className="text-sm tracking-wide text-[#562F00]">Brewing Trust</p>

            <div className="mt-9">
              <h1 className="text-3xl tracking-tight text-[#562F00] md:text-[2.1rem]">
                Welcome Back!
              </h1>
              <p className="mt-2 text-sm text-zinc-500">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-normal text-zinc-900 outline-none ring-0 transition placeholder:font-normal placeholder:text-zinc-400 hover:border-[#562F00] hover:shadow-[0_0_0_3px_rgba(86,47,0,0.16)] focus:border-[#562F00] focus:bg-white focus:ring-2 focus:ring-[#562F00]/30"
                  />
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 pr-10 text-sm font-normal text-zinc-900 outline-none ring-0 transition placeholder:font-normal placeholder:text-zinc-400 hover:border-[#562F00] hover:shadow-[0_0_0_3px_rgba(86,47,0,0.16)] focus:border-[#562F00] focus:bg-white focus:ring-2 focus:ring-[#562F00]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-zinc-400 transition hover:text-zinc-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        {showPassword ? (
                          <>
                            <path
                              d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </>
                        ) : (
                          <>
                            <path
                              d="M3 3l18 18"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10.58 10.58A3 3 0 0 0 13.42 13.4M9.88 5.51A9.53 9.53 0 0 1 12 5c5 0 9 4 9 7-0.3 1.14-1.01 2.4-2.02 3.49M6.61 6.61C4.08 7.76 2.5 9.89 2 12c0 3 4 7 10 7 1.26 0 2.46-.24 3.55-.68"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  <div className="mt-1 flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-zinc-400 transition hover:text-[#562F00]"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-5 flex w-full items-center justify-center rounded-full px-4 py-3.5 text-sm text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  loading
                    ? "cursor-not-allowed bg-[#562F00]/60"
                    : "bg-[#562F00] hover:bg-[#562F00] focus-visible:ring-[#562F00]"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>

          {message && <p className="mt-5 text-center text-xs text-red-500">{message}</p>}
          <p className="mt-5 text-center text-xs text-zinc-500">
            <span className="font-normal">Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="text-[#562F00] transition hover:text-[#562F00] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </section>

        <section className="relative hidden w-1/2 md:block">
          <Image
            src="/loginkopi.svg"
            alt="Coffee being poured into a glass over ice on a wooden counter."
            fill
            className="object-cover"
            priority
          />
        </section>
      </main>
    </div>
  );
}


