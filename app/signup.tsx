"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 font-sans md:px-6">
      <main className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] md:flex-row">
        {/* Left column – form */}
        <section className="flex w-full flex-col justify-between px-8 py-8 md:w-[58%] md:px-12 md:py-10">
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#562F00]">
              Brewing Trust
            </p>

            <div className="mt-7">
              <h1 className="text-3xl font-semibold tracking-tight text-[#FF9644] md:text-[2.1rem]">
                Create account
              </h1>
            </div>

            <form className="mt-6 space-y-5">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs font-medium text-zinc-700"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Juan"
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none ring-0 transition focus:border-[#FF9644] focus:ring-2 focus:ring-[#FF9644]/25 placeholder:text-zinc-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs font-medium text-zinc-700"
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Dela Cruz"
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none ring-0 transition focus:border-[#FF9644] focus:ring-2 focus:ring-[#FF9644]/25 placeholder:text-zinc-400"
                    />
                  </div>
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
                    placeholder="juandelacruz@email.com"
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none ring-0 transition focus:border-[#FF9644] focus:ring-2 focus:ring-[#FF9644]/25 placeholder:text-zinc-400"
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
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm text-zinc-900 outline-none ring-0 transition focus:border-[#FF9644] focus:ring-2 focus:ring-[#FF9644]/25 placeholder:text-zinc-400"
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
                </div>

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
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm text-zinc-900 outline-none ring-0 transition focus:border-[#FF9644] focus:ring-2 focus:ring-[#FF9644]/25 placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
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
                        className="h-4 w-4"
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
                className="mt-5 flex w-full items-center justify-center rounded-full bg-[#FF9644] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#e88538] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9644] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Sign in
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/"
              className="font-semibold text-[#562F00] transition hover:text-[#3d2100] hover:underline"
            >
              Log in
            </Link>
          </p>
        </section>

        {/* Right column – image */}
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

