"use client"; // <-- must be first line

import styles from "@/styles/employees.module.css";

const employees = [
  {
    id: "012-345-678",
    name: "Juan Dela Cruz",
    email: "juan@brewingtrust.com",
    role: "Staff",
    supervisor: "Lisa M.",
    status: "Active",
  },
  {
    id: "987-654-321",
    name: "Daniel Santos",
    email: "dan@brewingtrust.com",
    role: "Manager",
    supervisor: "Carl G.",
    status: "Inactive",
  },
  {
    id: "456-789-123",
    name: "Maria Lopez",
    email: "maria@brewingtrust.com",
    role: "Admin",
    supervisor: "Lisa M.",
    status: "Suspended",
  },
];

export default function EmployeesPage() {
  const statusOptions = ["All", "Active", "Inactive", "Suspended"];
  const roleOptions = ["Manager", "Staff", "Admin"];
  const supervisorOptions = ["Lisa M.", "Carl G.", "John P."];

  const handleAction = (empId: string, action: string) => {
    if (action === "Edit Role") {
      alert(`Navigate to Edit Role page for ${empId}`);
    } else if (action === "Deactivate") {
      alert(`Employee ${empId} will be deactivated`);
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2 className={styles.title}>Employee List</h2>
        <div className={styles.headerButtons}>
          <button
            className={styles.addBtn}
            onClick={() => alert("Open Add Employee card/page")}
          >
            + Add Employee
          </button>
          <button
            className={styles.exportBtn}
            onClick={() => alert("Open Export CSV card/page")}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by name, ID or email"
          className={styles.search}
        />

        <select className={styles.select}>
          <option>Status</option>
          {statusOptions.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <select className={styles.select}>
          <option>Role</option>
          {roleOptions.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>

        <select className={styles.select}>
          <option>Supervisor</option>
          {supervisorOptions.map((sup) => (
            <option key={sup}>{sup}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.blackHeader}>Employee ID</th>
              <th className={styles.blackHeader}>Name</th>
              <th className={styles.blackHeader}>Email</th>
              <th className={styles.blackHeader}>Role</th>
              <th className={styles.blackHeader}>Supervisor</th>
              <th className={styles.blackHeader}>Status</th>
              <th className={styles.blackHeader}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className={styles.lightGrey}>{emp.id}</td>
                <td className={styles.lightGrey}>{emp.name}</td>
                <td className={styles.email}>{emp.email}</td>
                <td className={styles.lightGrey}>{emp.role}</td>
                <td className={styles.lightGrey}>{emp.supervisor}</td>

                {/* Status column */}
                <td>
                  <span
                    className={
                      emp.status === "Active"
                        ? styles.active
                        : emp.status === "Inactive"
                        ? styles.inactive
                        : styles.suspended
                    }
                  >
                    {emp.status}
                  </span>
                </td>

                {/* Actions */}
                <td>
                  <select
                    className={styles.actionSelect}
                    onChange={(e) => handleAction(emp.id, e.target.value)}
                  >
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
