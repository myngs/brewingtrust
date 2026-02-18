'use client';

import { useEffect, useState } from "react";

type AttendanceEntry = {
  date: string;
  clockIn: string;
  clockOut: string;
  hours: string;
  status: "Present" | "Late" | "Absent";
};

const mockEntries: AttendanceEntry[] = [
  { date: "01/30/26", clockIn: "8:05 AM", clockOut: "5:05 PM", hours: "8h", status: "Present" },
  { date: "02/01/26", clockIn: "8:00 AM", clockOut: "5:00 PM", hours: "8h", status: "Present" },
  { date: "02/02/26", clockIn: "9:10 AM", clockOut: "4:59 PM", hours: "7h", status: "Late" },
  { date: "02/03/26", clockIn: "8:08 AM", clockOut: "5:05 PM", hours: "8h", status: "Present" },
  { date: "02/04/26", clockIn: "7:55 AM", clockOut: "-", hours: "-", status: "Absent" },
];

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function UserPage() {
  const now = useNow();

  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const [timeValue, timeMeridiem] = time.split(" ");

  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#f4f2ee] px-10 py-8 text-zinc-900">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-[#8b5a2b]">Brewing Trust</div>
            <h1 className="mt-2 text-3xl font-extrabold">Hello, [User]!</h1>
          </div>

          <button
            type="button"
            className="mt-2 rounded-md p-2 text-[#e54b3c] hover:bg-white/60"
            aria-label="Logout"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 17l5-5-5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12H3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 3v18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            </svg>
          </button>
        </header>

        <section className="mt-10 grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-10 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
            <div className="flex items-end gap-3">
              <div className="text-[64px] font-extrabold leading-none tracking-tight">
                {timeValue}
              </div>
              <div className="pb-1">
                <div className="text-sm font-bold leading-none">{timeMeridiem}</div>
                <div className="mt-1 text-[10px] font-semibold tracking-wide text-zinc-500">
                  PST
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm text-zinc-500">{date}</div>
          </div>

          <div className="rounded-2xl bg-white p-10 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-sm text-sm text-zinc-700">
                <div className="text-xs font-bold text-zinc-800">Status:</div>
                <div className="mt-1 text-xs text-zinc-600">
                  You are clocked in since <span className="font-semibold">8:05 AM</span>.
                </div>
              </div>

              <div className="flex flex-col gap-4 md:items-end">
                <button className="w-full rounded-xl bg-[#7bbf6a] px-10 py-4 text-xl font-semibold text-white shadow-sm transition-colors hover:bg-[#6aae5c] md:w-56">
                  Clock-In
                </button>
                <button className="w-full rounded-xl bg-[#e43d2f] px-10 py-4 text-xl font-semibold text-white shadow-sm transition-colors hover:bg-[#d33629] md:w-56">
                  Clock-Out
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-center text-sm">
              <thead>
                <tr className="bg-[#5b3a1c] text-white">
                  <th className="px-6 py-4 text-xs font-semibold">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold">Clock-In</th>
                  <th className="px-6 py-4 text-xs font-semibold">Clock-Out</th>
                  <th className="px-6 py-4 text-xs font-semibold">Hours Worked</th>
                  <th className="px-6 py-4 text-xs font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockEntries.map((row, idx) => (
                  <tr
                    key={row.date + idx}
                    className={`border-t border-zinc-200 ${idx % 2 === 0 ? "bg-white" : "bg-[#fbfaf8]"}`}
                  >
                    <td className="px-6 py-3 font-semibold text-zinc-700">{row.date}</td>
                    <td className="px-6 py-3 text-zinc-700">{row.clockIn}</td>
                    <td className="px-6 py-3 text-zinc-700">{row.clockOut}</td>
                    <td className="px-6 py-3 text-zinc-700">{row.hours}</td>
                    <td className="px-6 py-3 text-zinc-700">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
