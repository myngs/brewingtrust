'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { jwtDecode } from "jwt-decode";
import { contractAddress, contractABI } from "./contract";

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
  const [wallet, setWallet] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [todayRecord, setTodayRecord] = useState<{clockIn: number, clockOut: number}>({clockIn: 0, clockOut: 0});
  const [isClient, setIsClient] = useState(false);
  
  // Historical records from MongoDB
  const [allRecords, setAllRecords] = useState<Array<{
    date: string;
    clockIn: number;
    clockOut: number;
    totalHours: number;
    status: string;
  }>>([]);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(false);
  
  // Date picker state - defaults to today
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const now = useNow();

  // Mark as client-side after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  // Override console.error immediately to suppress ethers RPC errors
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Only suppress the specific ethers errors we want to hide
      const firstArg = args[0];
      if (firstArg && typeof firstArg === 'string' &&
          (firstArg.includes("could not coalesce error") ||
           firstArg.includes("RPC endpoint returned too many errors") ||
           firstArg.includes("retrying in") ||
           firstArg.includes("missing revert data") ||
           firstArg.includes("could not decode result data"))) {
        return; // Suppress RPC-related errors and contract reverts
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Check token and session expiration
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);

      // Only allow employees here
      if (decoded.role !== "employee") {
        router.push("/login");
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



  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to interact with the blockchain");
        return;
      }

      setStatus("Connecting to MetaMask...");

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) {
        setStatus("No wallet accounts found");
        return;
      }

      // Create provider with retry configuration
      const provider = new ethers.BrowserProvider(window.ethereum, undefined, {
        cacheTimeout: 30000, // Cache for 30 seconds
        pollingInterval: 4000, // Poll every 4 seconds
      });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWallet(address);
      setStatus("Wallet connected ✅");
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setStatus("Failed to connect wallet ❌");
    }
  };

  // Get contract instance
  const getContract = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to interact with the blockchain");
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum, undefined, {
        cacheTimeout: 30000, // Cache for 30 seconds
        pollingInterval: 4000, // Poll every 4 seconds
      });
      const signer = await provider.getSigner();
      return new ethers.Contract(contractAddress, contractABI, signer);
    } catch (err: any) {
      console.error("Contract error:", err);
      setStatus("Failed to get contract");
      return null;
    }
  };

  // Save attendance to database for persistence
  const saveToDatabase = async (dateValue: number, type: 'clockIn' | 'clockOut') => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return false;
      }

      // Convert date to string as the model expects
      const dateString = String(dateValue);

      const endpoint = type === 'clockIn' ? '/api/attendance/clock-in' : '/api/attendance/clock-out';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: dateString })
      });

      if (response.ok) {
        console.log(`${type} saved to database successfully`);
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("Database save error:", errorData.message);
        return false;
      }
    } catch (err) {
      console.error("Database save error:", err);
      return false;
    }
  };

  // Load record from database for a specific date
  const loadFromDatabase = async (dateValue: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      // Convert date to string as the route expects
      const dateString = String(dateValue);

      const response = await fetch(`http://localhost:5000/api/attendance/today/${dateString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Database record loaded:", data);
        return data;
      }
    } catch (err) {
      console.error("Error loading from database:", err);
    }
    return null;
  };

  // Fetch all attendance records from MongoDB
  const fetchAllRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingRecords(true);
      const response = await fetch('http://localhost:5000/api/attendance/my-records', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("All records loaded from MongoDB:", data);
        setAllRecords(data.records || []);
      } else {
        console.error("Failed to fetch records:", response.status);
      }
    } catch (err) {
      console.error("Error fetching all records:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Clock in - always uses today's date
  const clockIn = async () => {
    if (!wallet) return alert("Connect your wallet first");

    // Check if already clocked in
    if (todayRecord.clockIn > 0) {
      setStatus("Already clocked in for today");
      return;
    }

    setLoading(true);
    setStatus("Confirming transaction in MetaMask...");

    try {
      const contract = await getContract();
      if (!contract) {
        setLoading(false);
        setStatus("Failed to connect to contract");
        return;
      }

      const today = new Date();
      const date = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

      console.log("Attempting clock-in for date:", date);

      // Execute blockchain transaction
      const tx = await contract.clockIn(date);
      console.log("Transaction submitted:", tx.hash);
      setStatus("Transaction submitted, waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      setStatus("Clocked In ✅");
      
      // Save to database for persistence
      await saveToDatabase(date, 'clockIn');
      
      // Refresh all records and today's record
      await fetchAllRecords();
      fetchRecordForDate();
      
      // Small delay to allow blockchain to update
      setTimeout(() => {
        fetchRecordForDate();
      }, 2000);

    } catch (err: any) {
      console.error("Clock in error:", err);
      // Check for specific error messages
      const errorMessage = err.message || "";
      if (errorMessage.includes("Already clocked in") || err.code === 'CALL_EXCEPTION') {
        setStatus("Already clocked in for today");
      } else if (errorMessage.includes("user rejected")) {
        setStatus("Transaction rejected by user");
      } else {
        setStatus("Clock In Failed ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  // Clock out - always uses today's date
  const clockOut = async () => {
    if (!wallet) return alert("Connect your wallet first");

    // Check if not clocked in or already clocked out
    if (todayRecord.clockIn === 0) {
      setStatus("Must clock in first before clocking out");
      return;
    }
    if (todayRecord.clockOut > 0) {
      setStatus("Already clocked out for today");
      return;
    }

    setLoading(true);
    setStatus("Confirming transaction in MetaMask...");

    try {
      const contract = await getContract();
      if (!contract) {
        setLoading(false);
        setStatus("Failed to connect to contract");
        return;
      }

      const today = new Date();
      const dateValue = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

      console.log("Attempting clock-out for date:", dateValue);

      // Execute blockchain transaction
      const tx = await contract.clockOut(dateValue);
      console.log("Transaction submitted:", tx.hash);
      setStatus("Transaction submitted, waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      setStatus("Clocked Out ✅");
      
      // Save to database for persistence
      await saveToDatabase(dateValue, 'clockOut');
      
      // Refresh all records and today's record
      await fetchAllRecords();
      fetchRecordForDate();
      
      // Small delay to allow blockchain to update
      setTimeout(() => {
        fetchRecordForDate();
      }, 2000);

    } catch (err: any) {
      console.error("Clock out error:", err);
      // Check for specific error messages
      const errorMessage = err.message || "";
      if (errorMessage.includes("Not clocked in") || err.code === 'CALL_EXCEPTION') {
        if (todayRecord.clockIn === 0) {
          setStatus("Must clock in first before clocking out");
        } else if (todayRecord.clockOut > 0) {
          setStatus("Already clocked out for today");
        } else {
          setStatus("Clock Out Failed ❌");
        }
      } else if (errorMessage.includes("user rejected")) {
        setStatus("Transaction rejected by user");
      } else {
        setStatus("Clock Out Failed ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch record from blockchain for a specific date
  const fetchFromBlockchain = async (dateValue: number) => {
    if (!wallet) return;

    try {
      const contract = await getContract();
      if (!contract) return;

      console.log("Fetching blockchain record for wallet:", wallet, "date:", dateValue);
      
      let record;
      try {
        record = await contract.getRecord(wallet, dateValue);
        console.log("Blockchain record received:", record);
      } catch (callErr: any) {
        // Handle BAD_DATA error when no record exists - treat as no clock-in/clock-out
        // This is expected behavior when no attendance records exist yet, don't log as error
        if (callErr.code === 'BAD_DATA' || callErr.message?.includes('could not decode result data')) {
          return { clockIn: 0, clockOut: 0 };
        }
        // Log other unexpected errors but don't throw - keep existing data
        console.error("Blockchain call error:", callErr);
        return null;
      }

      // Return the record if we got valid data
      if (record && record[0] !== undefined) {
        const clockInTime = Number(record[0]);
        const clockOutTime = Number(record[1]);
        console.log("Parsed times - clockIn:", clockInTime, "clockOut:", clockOutTime);
        return { clockIn: clockInTime, clockOut: clockOutTime };
      } else {
        // Empty record - no clock-in yet
        return { clockIn: 0, clockOut: 0 };
      }
    } catch (err: any) {
      console.error("Error fetching from blockchain:", err);
      return null;
    }
  };

  // Fetch record for the selected date - try database first for persistence, then blockchain
  const fetchRecordForDate = async () => {
    if (!wallet) return;

    try {
      // Convert selected date string to dateValue format (YYYYMMDD)
      const dateParts = selectedDate.split('-');
      const dateValue = parseInt(dateParts[0]) * 10000 + parseInt(dateParts[1]) * 100 + parseInt(dateParts[2]);

      // First, try to load from database for persistence
      const dbRecord = await loadFromDatabase(dateValue);
      if (dbRecord && (dbRecord.clockIn > 0 || dbRecord.clockOut > 0)) {
        console.log("Loaded from database:", dbRecord);
        setTodayRecord({ clockIn: dbRecord.clockIn, clockOut: dbRecord.clockOut });
        return;
      }

      // If no database record, try blockchain
      const blockchainRecord = await fetchFromBlockchain(dateValue);
      if (blockchainRecord) {
        setTodayRecord(blockchainRecord);
      } else {
        setTodayRecord({ clockIn: 0, clockOut: 0 });
      }
    } catch (err: any) {
      console.error("Error fetching record for date:", err);
      setTodayRecord({ clockIn: 0, clockOut: 0 });
    }
  };

  // Fetch record on wallet connect and when selected date changes
  useEffect(() => {
    if (wallet) {
      fetchRecordForDate();
      fetchAllRecords();
    }
  }, [wallet, selectedDate]);

  // Check if selected date is today
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

  // Format date string for display
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
            <h1 className="mt-2 text-3xl font-extrabold">Hello, [User]!</h1>
          </div>

          <button
            type="button"
            onClick={logout}
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
                {isClient ? timeValue : "00:00"}
              </div>
              <div className="pb-1">
                <div className="text-sm font-bold leading-none">{isClient ? timeMeridiem : "AM"}</div>
                <div className="mt-1 text-[10px] font-semibold tracking-wide text-zinc-500">
                  PST
                </div>
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
                    ) : (
                      "Not clocked in today"
                    )
                  ) : (
                    // Show status for selected past date
                    todayRecord.clockIn ? (
                      todayRecord.clockOut ? (
                        `Clocked in at ${new Date(todayRecord.clockIn * 1000).toLocaleTimeString()}, out at ${new Date(todayRecord.clockOut * 1000).toLocaleTimeString()}`
                      ) : (
                        `Clocked in at ${new Date(todayRecord.clockIn * 1000).toLocaleTimeString()}`
                      )
                    ) : (
                      "No record for this date"
                    )
                  )}
                </div>
                {status && (
                  <div className="mt-2 text-xs font-semibold text-green-600">
                    {status}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 md:items-end">
                {!wallet ? (
                  <button
                    onClick={connectWallet}
                    className="w-full rounded-xl bg-[#7bbf6a] px-10 py-4 text-xl font-semibold text-white shadow-sm transition-colors hover:bg-[#6aae5c] md:w-56"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => clockIn()}
                      disabled={loading || todayRecord.clockIn !== 0 || !isToday}
                      className="w-full rounded-xl bg-[#7bbf6a] px-10 py-4 text-xl font-semibold text-white shadow-sm transition-colors hover:bg-[#6aae5c] disabled:opacity-50 md:w-56"
                      title={!isToday ? "Can only clock in for today" : ""}
                    >
                      {loading ? "Processing..." : "Clock-In"}
                    </button>
                    <button
                      onClick={() => clockOut()}
                      disabled={loading || todayRecord.clockIn === 0 || todayRecord.clockOut !== 0 || !isToday}
                      className="w-full rounded-xl bg-[#e43d2f] px-10 py-4 text-xl font-semibold text-white shadow-sm transition-colors hover:bg-[#d33629] disabled:opacity-50 md:w-56"
                      title={!isToday ? "Can only clock out for today" : ""}
                    >
                      {loading ? "Processing..." : "Clock-Out"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Date Picker Section */}
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold text-zinc-700">
              View Attendance Records
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label htmlFor="datePicker" className="text-sm text-zinc-600">
                Select Date:
              </label>
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

        {/* Selected Date Record */}
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
                  <td className="px-6 py-3 font-semibold text-zinc-700">
                    {new Date(selectedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-zinc-700">
                    {todayRecord?.clockIn ? new Date(todayRecord.clockIn * 1000).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-6 py-3 text-zinc-700">
                    {todayRecord?.clockOut ? new Date(todayRecord.clockOut * 1000).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-6 py-3 text-zinc-700">
                    {todayRecord?.clockIn && todayRecord?.clockOut
                      ? `${((todayRecord.clockOut - todayRecord.clockIn) / 3600).toFixed(1)}h`
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-zinc-700">
                    {todayRecord?.clockIn ? (todayRecord.clockOut ? "Present" : "Clocked In") : "Not Clocked"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Historical Records from MongoDB */}
        <section className="mt-10 overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-800">Attendance History</h2>
            <button
              onClick={fetchAllRecords}
              disabled={loadingRecords}
              className="rounded-lg bg-[#5b3a1c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a2f17] disabled:opacity-50"
            >
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
                    <td colSpan={5} className="px-6 py-8 text-zinc-500">
                      Loading records...
                    </td>
                  </tr>
                ) : allRecords.length === 0 ? (
                  <tr className="border-t border-zinc-200">
                    <td colSpan={5} className="px-6 py-8 text-zinc-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  allRecords.map((record, index) => (
                    <tr key={index} className="border-t border-zinc-200 bg-white">
                      <td className="px-6 py-3 font-semibold text-zinc-700">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-3 text-zinc-700">
                        {record.clockIn ? new Date(record.clockIn * 1000).toLocaleTimeString() : "-"}
                      </td>
                      <td className="px-6 py-3 text-zinc-700">
                        {record.clockOut ? new Date(record.clockOut * 1000).toLocaleTimeString() : "-"}
                      </td>
                      <td className="px-6 py-3 text-zinc-700">
                        {record.totalHours > 0 ? `${record.totalHours.toFixed(1)}h` : "-"}
                      </td>
                      <td className="px-6 py-3 text-zinc-700">
                        {record.status === "completed" ? "Completed" : 
                         record.status === "clocked-in" ? "Clocked In" : 
                         record.status === "clocked-out" ? "Clocked Out" : "Not Started"}
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
