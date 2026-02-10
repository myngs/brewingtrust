import { useState } from "react";

export default function Dashboard() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [record, setRecord] = useState({
    clockIn: null,
    clockOut: null,
  });

  const handleClockIn = () => {
    const time = new Date().toLocaleTimeString();
    setIsClockedIn(true);
    setRecord({ clockIn: time, clockOut: null });

    // later → smart contract clockIn()
    console.log("Clocked in at:", time);
  };

  const handleClockOut = () => {
    const time = new Date().toLocaleTimeString();
    setIsClockedIn(false);
    setRecord((prev) => ({ ...prev, clockOut: time }));

    // later → smart contract clockOut()
    console.log("Clocked out at:", time);
  };

  return (
    <div className="container">
      <h2>Staff Dashboard</h2>

      <p>
        Status:{" "}
        <strong style={{ color: isClockedIn ? "green" : "red" }}>
          {isClockedIn ? "CLOCKED IN" : "CLOCKED OUT"}
        </strong>
      </p>

      <div style={{ margin: "20px 0" }}>
        <button onClick={handleClockIn} disabled={isClockedIn}>
          ⏱ Clock In
        </button>

        <button onClick={handleClockOut} disabled={!isClockedIn}>
          ⏹ Clock Out
        </button>
      </div>

      <div>
        <h3>Last Attendance Record</h3>
        <p>Clock In: {record.clockIn || "-"}</p>
        <p>Clock Out: {record.clockOut || "-"}</p>
      </div>
    </div>
  );
}
