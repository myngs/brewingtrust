"use client";

export default function LedgerPage() {
  const verified = [
    { hash: "0x84****@kjyf", block: "3421", totalhours: "8hrs", status: "Verified" },
    { hash: "0x84****@kjyf", block: "3421", totalhours: "8hrs", status: "Verified" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Blockchain Ledger</h1>
      <table className="w-full border border-gray-200 text-left rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b">Transaction Hash</th>
            <th className="px-4 py-2 border-b">Block Number</th>
            <th className="px-4 py-2 border-b">Total Hours</th>
            <th className="px-4 py-2 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {verified.map((v, i) => (
            <tr key={i} className="border-b">
              <td className="px-4 py-2">{v.hash}</td>
              <td className="px-4 py-2">{v.block}</td>
              <td className="px-4 py-2 text-green-500 font-semibold">{v.totalhours}</td>
              <td className="px-4 py-2 text-green-500 font-semibold">{v.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
