"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Strong password validator
  const validatePassword = (password: string) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}\-_=+]).{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // prevent double click

    // ✅ Validations
    if (!validatePassword(formData.password)) {
      setMessage(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 md:px-6"
      style={{ fontFamily: "\"Museo Sans\", \"Museo Sans 700\", sans-serif", fontWeight: 700 }}
    >
      <main className="flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-zinc-100/70 bg-white/95 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:flex-row md:items-stretch lg:max-w-5xl lg:h-[560px]">
        <section className="flex w-full flex-col justify-between px-6 py-6 sm:px-8 sm:py-8 md:w-[58%] md:px-9 md:py-8 lg:px-11 lg:py-10">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#562F00]">
              Brewing Trust
            </p>

            <div className="mt-3 sm:mt-4">
              <h1 className="text-2xl font-semibold tracking-tight text-[#562F00] md:text-[1.7rem]">
                Create account
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
              <div className="space-y-2.5 sm:space-y-3">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="mt-1.5 h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 text-sm font-normal text-zinc-900 outline-none ring-0 transition placeholder:font-normal placeholder:text-zinc-400 hover:border-[#562F00] hover:shadow-[0_0_0_3px_rgba(86,47,0,0.16)] focus:border-[#562F00] focus:bg-white focus:ring-2 focus:ring-[#562F00]/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1.5 h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 text-sm font-normal text-zinc-900 outline-none ring-0 transition placeholder:font-normal placeholder:text-zinc-400 hover:border-[#562F00] hover:shadow-[0_0_0_3px_rgba(86,47,0,0.16)] focus:border-[#562F00] focus:bg-white focus:ring-2 focus:ring-[#562F00]/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 pr-10 text-sm font-normal text-zinc-900 outline-none ring-0 transition placeholder:font-normal placeholder:text-zinc-400 hover:border-[#562F00] hover:shadow-[0_0_0_3px_rgba(86,47,0,0.16)] focus:border-[#562F00] focus:bg-white focus:ring-2 focus:ring-[#562F00]/30"
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
                        className="h-3.5 w-3.5"
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
                </div>

                <p className="text-[10px] text-zinc-500 -mt-1">
                  Must be 8+ characters, include uppercase, lowercase, number,
                  and special character.
                </p>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Re-type password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-type password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 pr-10 text-sm font-normal text-zinc-900 outline-none ring-0 transition placeholder:font-normal placeholder:text-zinc-400 hover:border-[#562F00] hover:shadow-[0_0_0_3px_rgba(86,47,0,0.16)] focus:border-[#562F00] focus:bg-white focus:ring-2 focus:ring-[#562F00]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-zinc-400 transition hover:text-zinc-600"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password confirmation"
                          : "Show password confirmation"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        {showConfirmPassword ? (
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
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-3 flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  loading
                    ? "cursor-not-allowed bg-[#562F00]/60"
                    : "bg-[#562F00] hover:bg-[#562F00] focus-visible:ring-[#562F00]"
                }`}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>
          </div>

          {message && (
            <p className="mt-3 text-center text-xs font-medium text-zinc-700">
              {message}
            </p>
          )}

          <p className="mt-4 text-center text-xs text-zinc-500 sm:text-[13px]">
            <span className="font-normal">Already have an account? </span>
            <Link
              href="/"
              className="font-extrabold text-[#562F00] transition hover:text-[#3d2100] hover:underline"
            >
              Log in
            </Link>
          </p>
        </section>

        <section className="relative hidden md:block md:w-[42%]">
          <Image
            src="/beans.svg"
            alt="Coffee beans."
            fill
            className="object-cover"
            priority
          />
        </section>
      </main>
    </div>
  );
}
