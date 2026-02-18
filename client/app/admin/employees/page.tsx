"use client";

const employees = [
  { id: "012-345-678", name: "Juan Dela Cruz", email: "juan@brewingtrust.com", role: "Staff", supervisor: "Lisa M.", status: "Active" },
  { id: "987-654-321", name: "Daniel Santos", email: "dan@brewingtrust.com", role: "Manager", supervisor: "Carl G.", status: "Inactive" },
  { id: "456-789-123", name: "Maria Lopez", email: "maria@brewingtrust.com", role: "Admin", supervisor: "Lisa M.", status: "Suspended" },
];

export default function EmployeesPage() {
  const statusOptions = ["All", "Active", "Inactive", "Suspended"];
  const roleOptions = ["Manager", "Staff", "Admin"];
  const supervisorOptions = ["Lisa M.", "Carl G.", "John P."];

  const handleAction = (empId: string, action: string) => {
    alert(`${action} for ${empId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Employee List</h2>
        <div className="flex gap-2">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">+ Add Employee</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Export CSV</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <input type="text" placeholder="Search by name, ID or email" className="border px-3 py-2 rounded w-1/3" />
        <select className="border px-3 py-2 rounded">
          <option>Status</option>
          {statusOptions.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="border px-3 py-2 rounded">
          <option>Role</option>
          {roleOptions.map(r => <option key={r}>{r}</option>)}
        </select>
        <select className="border px-3 py-2 rounded">
          <option>Supervisor</option>
          {supervisorOptions.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">Employee ID</th>
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Role</th>
              <th className="px-4 py-2 border-b">Supervisor</th>
              <th className="px-4 py-2 border-b">Status</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="border-b">
                <td className="px-4 py-2">{emp.id}</td>
                <td className="px-4 py-2">{emp.name}</td>
                <td className="px-4 py-2">{emp.email}</td>
                <td className="px-4 py-2">{emp.role}</td>
                <td className="px-4 py-2">{emp.supervisor}</td>
                <td className={`px-4 py-2 font-semibold ${
                  emp.status === "Active" ? "text-green-500" :
                  emp.status === "Inactive" ? "text-red-500" :
                  "text-orange-500"
                }`}>{emp.status}</td>
                <td className="px-4 py-2">
                  <select onChange={(e) => handleAction(emp.id, e.target.value)} className="border rounded px-2 py-1">
                    <option>View</option>
                    <option>Edit Role</option>
                    <option>Deactivate</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
