"use client";

import { useState } from "react";

export default function ForgotPasswordResetPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="px-6 pt-8 text-sm font-semibold tracking-wide text-[#562F00] md:px-12">
        Brewing Trust
      </header>
      <main className="flex w-full flex-col items-center px-6 pb-10 pt-12 md:px-12 md:pt-16">

        <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-orange-400">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-400 text-white">
            1
          </span>
          <span className="h-[2px] w-20 rounded-full bg-orange-400/70" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-400 text-white">
            2
          </span>
          <span className="h-[2px] w-20 rounded-full bg-orange-400/70" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-400 text-white">
            3
          </span>
        </div>

        <div className="mt-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#562F00]">
            Reset Password
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Your new password must be different from your previous password.
          </p>
        </div>

        <form className="mt-8 flex w-full max-w-md flex-col gap-6">
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-sm text-zinc-900 outline-none ring-0 transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 placeholder:text-zinc-400"
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

          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-sm text-zinc-900 outline-none ring-0 transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 placeholder:text-zinc-400"
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

          <button
            type="submit"
            className="mt-2 rounded-full bg-orange-400 px-10 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Change Password
          </button>
        </form>
      </main>
    </div>
  );
}
