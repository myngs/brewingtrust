export default function OverviewPage() {
  const stats = { totalStaff: 124, activeToday: 35 };
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
    <div className="p-6 space-y-8">
      {/* Stats */}
      <div className="flex gap-6">
        <div className="bg-white p-4 rounded-xl shadow w-1/2">
          <p className="text-gray-500">Total Staff</p>
          <h2 className="text-2xl font-bold">{stats.totalStaff}</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow w-1/2">
          <p className="text-gray-500">
            <span className="text-green-500">●</span> Active Today
          </p>
          <h2 className="text-2xl font-bold">{stats.activeToday}</h2>
        </div>
      </div>

      {/* Anomaly Table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Anomaly Detection Feed</h3>
        <table className="w-full text-left border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">Employee ID</th>
              <th className="px-4 py-2 border-b">Time Plan ID</th>
              <th className="px-4 py-2 border-b">Flagged Reason</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-2 text-gray-700">{a.id}</td>
                <td className="px-4 py-2 text-gray-700">{a.time}</td>
                <td className="px-4 py-2 text-orange-500">{a.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attendance Table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Attendance Feed</h3>
        <table className="w-full text-left border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Work/Study</th>
              <th className="px-4 py-2 border-b">Last Paid</th>
              <th className="px-4 py-2 border-b">Verified</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-2 text-gray-700">{a.date}</td>
                <td className={`px-4 py-2 font-bold ${a.work ? "text-green-500" : "text-red-500"}`}>
                  {a.work ? "✔" : "—"}
                </td>
                <td className={`px-4 py-2 font-bold ${a.paid ? "text-green-500" : "text-red-500"}`}>
                  {a.paid ? "✔" : "—"}
                </td>
                <td className={`px-4 py-2 font-bold ${a.verified ? "text-green-500" : "text-red-500"}`}>
                  {a.verified ? "Verified" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
