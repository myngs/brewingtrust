import styles from "@/styles/overview.module.css";

export default function OverviewPage() {
  const stats = {
    totalStaff: 124,
    activeToday: 35,
  };

  const anomalies = [
    { id: "EMP-001", time: "2-3-26 | 10:30AM", reason: "Late clock-in" },
    { id: "EMP-014", time: "2-3-26 | 11:02AM", reason: "Missed schedule" },
  ];

  const attendance = [
    { date: "Feb 2", work: true, paid: true, verified: true },
    { date: "Feb 1", work: true, paid: true, verified: true },
    { date: "Jan 31", work: true, paid: true, verified: true },
  ];

  return (
    <>
      {/* Stats */}
    <div className={styles.stats}>
    <div className={styles.card}>
        <p className={styles.statLabel}>Total Staff</p>
        <h2 className={styles.statNumber}>{stats.totalStaff}</h2>
    </div>

    <div className={styles.card}>
        <p className={styles.statLabel}>
        <span className={styles.dot}></span> Active Today
        </p>
        <h2 className={styles.statNumber}>{stats.activeToday}</h2>
    </div>
    </div>


      {/* Anomaly Table */}
    <div className={styles.section}>
    <div className={styles.tableTitle}>Anomaly Detection Feed</div>

    <table className={styles.table}>
        <thead>
        <tr>
            <th className={styles.blackHeader}>Employee ID</th>
            <th className={styles.blackHeader}>Time Plan ID</th>
            <th className={styles.blackHeader}>Flagged Reason</th>
        </tr>
        </thead>

        <tbody>
        {anomalies.map((a, i) => (
            <tr key={i}>
            <td className={styles.lightGrey}>{a.id}</td>
            <td className={styles.lightGrey}>{a.time}</td>
            <td className={styles.tdOrange}>{a.reason}</td>
            </tr>
        ))}
        </tbody>
    </table>
    </div>


      {/* Attendance Table */}
    <div className={styles.section}>
    <div className={styles.tableTitle}>Attendance Feed</div>

    <table className={styles.table}>
        <thead>
        <tr>
            <th className={styles.blackHeader}>Date</th>
            <th className={styles.blackHeader}>Work/Study</th>
            <th className={styles.blackHeader}>Last Paid</th>
            <th className={styles.blackHeader}>Verified</th>
        </tr>
        </thead>

        <tbody>
        {attendance.map((a, i) => (
            <tr key={i}>
            <td className={styles.lightGrey}>{a.date}</td>

            <td className={a.work ? styles.tdGreen : styles.tdRed}>
                {a.work ? "✔" : "—"}
            </td>

            <td className={a.paid ? styles.tdGreen : styles.tdRed}>
                {a.paid ? "✔" : "—"}
            </td>

            <td className={a.verified ? styles.tdGreen : styles.tdRed}>
                {a.verified ? "Verified" : "—"}
            </td>
            </tr>
        ))}
        </tbody>
    </table>
    </div>

    </>
  );
}
