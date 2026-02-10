"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 font-sans md:px-6">
      <main className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-100/70 bg-white/95 backdrop-blur-sm md:h-[520px] md:flex-row">
        {/* Left column – form */}
        <section className="flex w-full flex-col justify-between px-8 py-9 md:w-1/2 md:px-12 md:py-12">
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#562F00]">
              Brewing Trust
            </p>

            <div className="mt-9">
              <h1 className="text-3xl font-semibold tracking-tight text-orange-500 md:text-[2.1rem]">
                Welcome Back!
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Sign in to your account
              </p>
            </div>

            <form method="POST" action="/" className="mt-8 space-y-6">
              <div className="space-y-5">
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
                    placeholder="juanedelacruz@email.com"
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none ring-0 transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-200 placeholder:text-zinc-400"
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
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 pr-10 text-sm text-zinc-900 outline-none ring-0 transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-200 placeholder:text-zinc-400"
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
                      className="text-[11px] font-medium text-zinc-400 transition hover:text-orange-500"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-5 flex w-full items-center justify-center rounded-full bg-orange-400 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Login
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-orange-500 transition hover:text-orange-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </section>

        {/* Right column – image */}
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
