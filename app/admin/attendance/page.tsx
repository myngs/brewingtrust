import styles from "@/styles/attendance.module.css";

export default function AttendancePage() {
    const stats = {
    totalStaff: 124,
    activeToday: 35,
  };
    const verified = [
    { id: "EMP-001", date: "2-3-26 | 10:30AM", input: "8:00AM", totalhours:"8hrs", status:"● Verified"},
    { id: "EMP-014", date: "2-3-26 | 11:02AM", input: "8:00AM", totalhours:"8hrs", status:"● Verified"},
  ];

  return (
    <>
      <h1 className={styles.title}>Attendance & Payroll</h1>

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

      {/* Verified Records */}
      <div className={styles.section}>
        <div className={styles.tableTitle}>Verified Attendance Record</div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.blackHeader}>Employee ID</th>
              <th className={styles.blackHeader}>Date</th>
              <th className={styles.blackHeader}>Clock Input</th>
              <th className={styles.blackHeader}>Total Hours</th>
              <th className={styles.blackHeader}>Status</th>
            </tr>
          </thead>
                  <tbody>
        {verified.map((a, i) => (
            <tr key={i}>
            <td className={styles.lightGrey}>{a.id}</td>
            <td className={styles.lightGrey}>{a.date}</td>
            <td className={styles.lightGrey}>{a.input}</td>
            <td className={styles.lightGrey}>{a.totalhours}</td>
            <td className={styles.verified}>● Verified</td>
            </tr>
        ))}
        </tbody>
        </table>
      </div>

            {/* Bottom Section */}
      <div className={styles.bottomSection}>
        
        {/* Flagged Records */}
        <div className={styles.flaggedCard}>
          <div className={styles.flaggedHeader}>
            Flagged Records - Review Required
          </div>

          <table className={styles.flaggedTable}>
            <thead>
              <tr>
                <th className={styles.blackHeader}>Employee ID</th>
                <th className={styles.blackHeader}>Date</th>
                <th className={styles.blackHeader}>Flagged Reason</th>
                <th className={styles.blackHeader}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.lightGrey}>EMP-102</td>
                <td className={styles.lightGrey}>2-3-26</td>
                <td className={styles.lightGrey}>Late Clock-In</td>
                <td className={styles.action}>›</td>
              </tr>
              <tr>
                <td className={styles.lightGrey}>EMP-117</td>
                <td className={styles.lightGrey}>2-3-26</td>
                <td className={styles.lightGrey}>Missing Logout</td>
                <td className={styles.action}>›</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Blockchain Activity Feed */}
       {/* Blockchain Activity Feed */}
        <div className={styles.blockchainCard}>
        <h3 className={styles.blockchainTitle}>
            Blockchain Activity Feed
        </h3>

        <div className={styles.blockchainRow}>
            <h2 className={styles.amount}>₱40,000.00</h2>
            <button className={styles.smartBtn}>
            Execute Smart Contract
            </button>
        </div>

        <div className={styles.hashSection}>
            <p><strong>Transaction Hashes</strong></p>
            <p className={styles.lightGrey}>0x7d8a9b12e456...</p>

            <p><strong>Blockchain Hashes</strong></p>
            <p className={styles.lightGrey}>0xa4c78d8b9023...</p>
        </div>
        </div>
      </div>

    </>
  );
}
