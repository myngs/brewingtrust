import styles from "@/styles/ledger.module.css";

export default function LedgerPage() {
      const verified = [
    { hash: "0x84****@kjyf", block: "3421", totalhours: "● Verified", status:"● Verified" },
    { hash: "0x84****@kjyf", block: "3421", totalhours: "● Verified", status:"● Verified" },
  ];
  return (
    <>
      <h1 className={styles.title}>Blockchain Ledger</h1>

      <div className={styles.section}>
        <div className={styles.tableTitle}>Verified Attendance Record</div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.blackHeader}>Transaction Hash</th>
              <th className={styles.blackHeader}>Block Number</th>
              <th className={styles.blackHeader}>Total Hours</th>
              <th className={styles.blackHeader}>Status</th>
            </tr>
          </thead>
          <tbody>
            {verified.map((a, i) => (
            <tr key={i}>
            <td className={styles.lightGrey}>{a.hash}</td>
            <td className={styles.lightGrey}>{a.block}</td>
            <td className={styles.tdGreen}>{a.totalhours}</td>
            <td className={styles.tdGreen}>{a.status}</td>

            </tr>
        ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
