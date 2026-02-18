"use client";

export default function AttendancePage() {
  const stats = { totalStaff: 124, activeToday: 35 };
  const verified = [
    { id: "EMP-001", date: "2-3-26 | 10:30AM", input: "8:00AM", totalhours:"8hrs", status:"Verified" },
    { id: "EMP-014", date: "2-3-26 | 11:02AM", input: "8:00AM", totalhours:"8hrs", status:"Verified" },
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

      {/* Verified Records */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Verified Attendance Record</h3>
        <table className="w-full text-left border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">Employee ID</th>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Clock Input</th>
              <th className="px-4 py-2 border-b">Total Hours</th>
              <th className="px-4 py-2 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {verified.map((v, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-2">{v.id}</td>
                <td className="px-4 py-2">{v.date}</td>
                <td className="px-4 py-2">{v.input}</td>
                <td className="px-4 py-2">{v.totalhours}</td>
                <td className="px-4 py-2 text-green-500 font-semibold">{v.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Flagged Records */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Flagged Records - Review Required</h3>
        <table className="w-full text-left border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">Employee ID</th>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Flagged Reason</th>
              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-2">EMP-102</td>
              <td className="px-4 py-2">2-3-26</td>
              <td className="px-4 py-2 text-red-500">Late Clock-In</td>
              <td className="px-4 py-2">›</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2">EMP-117</td>
              <td className="px-4 py-2">2-3-26</td>
              <td className="px-4 py-2 text-red-500">Missing Logout</td>
              <td className="px-4 py-2">›</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
