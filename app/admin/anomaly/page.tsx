"use client"; // must be first line for client interactivity

import styles from "@/styles/anomaly.module.css";

export default function AnomalyPage() {
  const flagged = [
    { id: "EMP-001", date: "2-3-26 | 10:30AM", reason: "Late Clock-in" },
    { id: "EMP-002", date: "2-3-26 | 10:30AM", reason: "Late Clock-in" },
    { id: "EMP-003", date: "2-3-26 | 10:30AM", reason: "Late Clock-in" },
  ];

  const handleApprove = (empId: string) => {
    alert(`Attendance for ${empId} has been approved.`);
    // You can replace alert with API call or state update
  };

  const handleReject = (empId: string) => {
    alert(`Attendance for ${empId} has been rejected.`);
    // You can replace alert with API call or state update
  };

  return (
    <>
      <h1 className={styles.title}>Anomaly Detection: Review Required</h1>

      <div className={styles.section}>
        <div className={styles.tableTitle}>Flagged Attendance Records</div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.blackHeader}>Employee ID</th>
              <th className={styles.blackHeader}>Time & Date</th>
              <th className={styles.blackHeader}>Flagged Reason</th>
              <th className={styles.blackHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map((a, i) => (
              <tr className={styles.flaggedRow} key={i}>
                <td className={styles.lightGrey}>{a.id}</td>
                <td className={styles.lightGrey}>{a.date}</td>
                <td className={styles.lightGrey}>{a.reason}</td>
                <td>
                  <button
                    className={styles.approve}
                    onClick={() => handleApprove(a.id)}
                  >
                    ✔
                  </button>
                  <button
                    className={styles.reject}
                    onClick={() => handleReject(a.id)}
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
