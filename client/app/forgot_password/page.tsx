"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
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
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-400 text-orange-400">
            2
          </span>
          <span className="h-[2px] w-20 rounded-full bg-orange-400/30" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-400/40 text-orange-400/60">
            3
          </span>
        </div>

        <div className="mt-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#562F00]">
            Forgot Password?
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Enter the email address associated with your account to receive a
            verification code.
          </p>
        </div>

        <form className="mt-8 flex w-full max-w-md flex-col gap-6">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-0 transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 placeholder:text-zinc-400"
          />

          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="rounded-full border border-orange-300 px-8 py-3 text-sm font-semibold text-orange-500 transition hover:border-orange-400 hover:text-orange-600"
            >
              Cancel
            </Link>
            <Link
              href="/forgot-password/verify"
              className="rounded-full bg-orange-400 px-10 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Send
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}