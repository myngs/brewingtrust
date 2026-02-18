export default function AnomalyPage() {
  const flagged = [
    { id: "EMP-001", date: "2-3-26 | 10:30AM", reason: "Late Clock-in" },
    { id: "EMP-002", date: "2-3-26 | 10:30AM", reason: "Late Clock-in" },
    { id: "EMP-003", date: "2-3-26 | 10:30AM", reason: "Late Clock-in" },
  ];

  const handleApprove = (id: string) => alert(`Approved ${id}`);
  const handleReject = (id: string) => alert(`Rejected ${id}`);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Anomaly Detection: Review Required</h1>
      <table className="w-full border border-gray-200 text-left rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b">Employee ID</th>
            <th className="px-4 py-2 border-b">Time & Date</th>
            <th className="px-4 py-2 border-b">Flagged Reason</th>
            <th className="px-4 py-2 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {flagged.map((f, i) => (
            <tr key={i} className="border-b">
              <td className="px-4 py-2">{f.id}</td>
              <td className="px-4 py-2">{f.date}</td>
              <td className="px-4 py-2 text-orange-500">{f.reason}</td>
              <td className="px-4 py-2 flex gap-2">
                <button onClick={() => handleApprove(f.id)} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">✔</button>
                <button onClick={() => handleReject(f.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">✖</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
