"use client";

import Link from "next/link";
import { useRef } from "react";

export default function ForgotPasswordVerifyPage() {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const current = inputRefs.current[index];
    if (current) {
      current.value = nextValue;
    }
    if (nextValue && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      const current = inputRefs.current[index];
      if (current && current.value === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

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
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-400/40 text-orange-400/60">
            3
          </span>
        </div>

        <div className="mt-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#562F00]">
            Email Verification
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Enter the 4 digit code we sent to your email address.
          </p>
        </div>

        <form className="mt-8 flex w-full max-w-md flex-col items-center gap-6">
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <input
                key={`code-${index}`}
                inputMode="numeric"
                maxLength={1}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="h-14 w-14 rounded-xl border border-zinc-200 bg-white text-center text-lg font-semibold text-zinc-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              />
            ))}
          </div>

          <p className="text-xs text-zinc-500">
            Didn&apos;t receive code?{" "}
            <button
              type="button"
              className="font-semibold text-[#562F00] transition hover:text-orange-500"
            >
              Resend
            </button>
          </p>

          <div className="flex w-full justify-center">
            <Link
              href="/forgot-password/reset"
              className="rounded-full bg-orange-400 px-10 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Verify
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
