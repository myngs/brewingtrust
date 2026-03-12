'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode, type JwtPayload } from "jwt-decode";

type DecodedToken = JwtPayload & {
  username?: string;
  email?: string;
  role?: string;
};

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function UserPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [todayRecord, setTodayRecord] = useState<{clockIn: number | null, clockOut: number | null}>({clockIn: null, clockOut: null});
  const [isClient, setIsClient] = useState(false);
  const [username, setUsername] = useState<string>("");
  
  const [allRecords, setAllRecords] = useState<Array<{
    date: string;
    clockIn: number | null;
    clockOut: number | null;
    totalHours: number | null;
    status: string;
  }>>([]);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(false);
  
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const now = useNow();

  useEffect(() => {
    setIsClient(true);
    fetchRecordForDate();
    fetchAllRecords();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (typeof decoded.username === "string" && decoded.username) {
        setUsername(decoded.username);
      } else if (typeof decoded.email === "string" && decoded.email) {
        setUsername(decoded.email.split("@")[0]);
      }

      if (decoded.role !== "employee") {
        router.push("/login");
        return;
      }

      if (typeof decoded.exp !== "number") {
        logout();
        return;
      }

      const expiryTime = decoded.exp * 1000;
      const timeLeft = expiryTime - Date.now();
      if (timeLeft <= 0) {
        logout();
        return;
      }

      const timeout = setTimeout(() => {
        alert("Session expired.");
        logout();
      }, timeLeft);

      return () => clearTimeout(timeout);
    } catch {
      logout();
    }
  }, [router]);

  const clockIn = async () => {
    if (todayRecord.clockIn && todayRecord.clockIn > 0) {
      setStatus("Already clocked in for today");
      return;
    }

    setLoading(true);
    setStatus("Processing clock-in...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("Authentication error");
        setLoading(false);
        return;
      }

      const today = new Date();
      const dateValue = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

      const response = await fetch('http://localhost:5000/api/attendance/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: String(dateValue) })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("Clocked In (Hash stored on blockchain)");
        await fetchAllRecords();
        fetchRecordForDate();
        setTimeout(() => fetchRecordForDate(), 2000);
      } else {
        setStatus(data.message || "Clock In Failed");
      }

    } catch (err) {
      console.error("Clock in error:", err);
      setStatus("Clock In Failed");
    } finally {
      setLoading(false);
    }
  };

  const clockOut = async () => {
    if (!todayRecord.clockIn || todayRecord.clockIn === 0) {
      setStatus("Must clock in first before clocking out");
      return;
    }
    if (todayRecord.clockOut && todayRecord.clockOut > 0) {
      setStatus("Already clocked out for today");
      return;
    }

    setLoading(true);
    setStatus("Processing clock-out...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("Authentication error");
        setLoading(false);
        return;
      }

      const today = new Date();
      const dateValue = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

      const response = await fetch('http://localhost:5000/api/attendance/clock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: String(dateValue) })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("Clocked Out (Hash stored on blockchain)");
        await fetchAllRecords();
        fetchRecordForDate();
        setTimeout(() => fetchRecordForDate(), 2000);
      } else {
        setStatus(data.message || "Clock Out Failed");
      }

    } catch (err) {
      console.error("Clock out error:", err);
      setStatus("Clock Out Failed");
    } finally {
      setLoading(false);
    }
  };

  const loadFromDatabase = async (dateValue: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const dateString = String(dateValue);
      const response = await fetch(`http://localhost:5000/api/attendance/today/${dateString}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.error("Error loading from database:", err);
    }
    return null;
  };

  const fetchAllRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingRecords(true);
      const response = await fetch('http://localhost:5000/api/attendance/my-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAllRecords(data.records || []);
      }
    } catch (err) {
      console.error("Error fetching all records:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const fetchRecordForDate = async () => {
    try {
      const dateParts = selectedDate.split('-');
      const dateValue = parseInt(dateParts[0]) * 10000 + parseInt(dateParts[1]) * 100 + parseInt(dateParts[2]);

      const dbRecord = await loadFromDatabase(dateValue);
      if (dbRecord) {
        setTodayRecord({ clockIn: dbRecord.clockIn, clockOut: dbRecord.clockOut });
      } else {
        setTodayRecord({ clockIn: null, clockOut: null });
      }
    } catch (err) {
      console.error("Error fetching record for date:", err);
      setTodayRecord({ clockIn: null, clockOut: null });
    }
  };

  useEffect(() => {
    fetchRecordForDate();
  }, [selectedDate]);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

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

  const formatDate = (dateStr: string) => {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-[#f4f2ee] px-10 py-8 text-zinc-900">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-[#8b5a2b]">Brewing Trust</div>
            <h1 className="mt-2 text-3xl font-extrabold">Hello, {username || "User"}!</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-2 rounded-md p-2 text-[#e54b3c] hover:bg-white/60"
            aria-label="Logout"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            </svg>
          </button>
        </header>

        <section className="mt-10 grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-10 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
            <div className="flex items-end gap-3">
              <div className="text-[64px] font-extrabold leading-none tracking-tight">
                {isClient ? timeValue : "00:00"}
              </div>
              <div className="pb-1">
                <div className="text-sm font-bold leading-none">{isClient ? timeMeridiem : "AM"}</div>
                <div className="mt-1 text-[10px] font-semibold tracking-wide text-zinc-500">PST</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-zinc-500">{isClient ? date : "Loading..."}</div>
          </div>

          <div className="rounded-2xl bg-white p-10 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-sm text-sm text-zinc-700">
                <div className="text-xs font-bold text-zinc-800">Status:</div>
                <div className="mt-1 text-xs text-zinc-600">
                  {isToday ? (
                    todayRecord.clockIn ? (
                      todayRecord.clockOut ? (
                        `Clocked out at ${new Date(todayRecord.clockOut * 1000).toLocaleTimeString()}`
                      ) : (
                        `Clocked in since ${new Date(todayRecord.clockIn * 1000).toLocaleTimeString()}`
                      )
                    ) : "Not clocked in today"
                  ) : (
                    todayRecord.clockIn ? (
                      todayRecord.clockOut ? (
                        `Clocked in at ${new Date(todayRecord.clockIn * 1000).toLocaleTimeString()}, out at ${new Date(todayRecord.clockOut * 1000).toLocaleTimeString()}`
                      ) : `Clocked in at ${new Date(todayRecord.clockIn * 1000).toLocaleTimeString()}`
                    ) : "No record for this date"
                  )}
                </div>
                {status && <div className="mt-2 text-xs font-semibold text-green-600">{status}</div>}
              </div>

              <div className="flex flex-col gap-4 md:items-end">
                <button
                  onClick={() => clockIn()}
                  disabled={loading || (todayRecord.clockIn && todayRecord.clockIn > 0) || !isToday}
                  className="w-full rounded-xl bg-[#7bbf6a] px-10 py-4 text-xl font-semibold text-white shadow-sm transition-colors hover:bg-[#6aae5c] disabled:opacity-50 md:w-56"
                >
                  {loading ? "Processing..." : "Clock-In"}
                </button>
                <button
                  onClick={() => clockOut()}
                  disabled={loading || !todayRecord.clockIn || todayRecord.clockIn === 0 || (todayRecord.clockOut && todayRecord.clockOut > 0) || !isToday}
                  className="w-full rounded-xl bg-[#e43d2f] px-10 py-4 text-xl font-semibold text-white shadow-sm transition-colors hover:bg-[#d33629] disabled:opacity-50 md:w-56"
                >
                  {loading ? "Processing..." : "Clock-Out"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold text-zinc-700">View Attendance Records</div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label htmlFor="datePicker" className="text-sm text-zinc-600">Select Date:</label>
              <input
                type="date"
                id="datePicker"
                value={selectedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              {selectedDate !== new Date().toISOString().split('T')[0] && (
                <button
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  Go to Today
                </button>
              )}
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
                <tr className="border-t border-zinc-200 bg-white">
                  <td className="px-6 py-3 font-semibold text-zinc-700">{new Date(selectedDate).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-zinc-700">{todayRecord?.clockIn ? new Date(todayRecord.clockIn * 1000).toLocaleTimeString() : "-"}</td>
                  <td className="px-6 py-3 text-zinc-700">{todayRecord?.clockOut ? new Date(todayRecord.clockOut * 1000).toLocaleTimeString() : "-"}</td>
                  <td className="px-6 py-3 text-zinc-700">{todayRecord?.clockIn && todayRecord?.clockOut ? `${((todayRecord.clockOut - todayRecord.clockIn) / 3600).toFixed(1)}h` : "-"}</td>
                  <td className="px-6 py-3 text-zinc-700">{todayRecord?.clockIn ? (todayRecord.clockOut ? "Present" : "Clocked In") : "Not Clocked"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-800">Attendance History</h2>
            <button onClick={fetchAllRecords} disabled={loadingRecords} className="rounded-lg bg-[#5b3a1c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a2f17] disabled:opacity-50">
              {loadingRecords ? "Loading..." : "Refresh"}
            </button>
          </div>
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
                {loadingRecords ? (
                  <tr className="border-t border-zinc-200">
                    <td colSpan={5} className="px-6 py-8 text-zinc-500">Loading records...</td>
                  </tr>
                ) : allRecords.length === 0 ? (
                  <tr className="border-t border-zinc-200">
                    <td colSpan={5} className="px-6 py-8 text-zinc-500">No attendance records found</td>
                  </tr>
                ) : (
                  allRecords.map((record, index) => (
                    <tr key={index} className="border-t border-zinc-200 bg-white">
                      <td className="px-6 py-3 font-semibold text-zinc-700">{formatDate(record.date)}</td>
                      <td className="px-6 py-3 text-zinc-700">{record.clockIn ? new Date(record.clockIn * 1000).toLocaleTimeString() : "-"}</td>
                      <td className="px-6 py-3 text-zinc-700">{record.clockOut ? new Date(record.clockOut * 1000).toLocaleTimeString() : "-"}</td>
                      <td className="px-6 py-3 text-zinc-700">{record.totalHours && record.totalHours > 0 ? `${record.totalHours.toFixed(1)}h` : "-"}</td>
                      <td className="px-6 py-3 text-zinc-700">
                        {record.status === "completed" ? "Completed" : 
                         record.status === "clocked-in" ? "Clocked In" : 
                         record.status === "clocked-out" ? "Clocked Out" : 
                         record.status === "pending" ? "Pending" : "Not Started"}
                      </td>
                    </tr>
                  ))
)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
