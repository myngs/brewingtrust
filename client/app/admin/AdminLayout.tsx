"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showProfile, setShowProfile] = useState(false);

  const isActive = (path: string) =>
    pathname === path ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-gray-100";

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
            <div className="text-xl font-bold text-orange-500">
              BREWING <span className="text-gray-800 font-normal">TRUST</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col mt-4 space-y-1">
            <SidebarLink href="/admin/overview" icon="/icons/overview.png" text="Overview" isActive={isActive("/admin/overview")} />
            <SidebarLink href="/admin/employees" icon="/icons/employee.png" text="Employee List" isActive={isActive("/admin/employees")} />
            <SidebarLink href="/admin/attendance" icon="/icons/attendance.png" text="Attendance & Payroll" isActive={isActive("/admin/attendance")} />
            <SidebarLink href="/admin/anomaly" icon="/icons/anomaly.png" text="Anomaly Detection" isActive={isActive("/admin/anomaly")} />
            <SidebarLink href="/admin/ledger" icon="/icons/ledger.png" text="Blockchain Ledger" isActive={isActive("/admin/ledger")} />
          </nav>
        </div>

        {/* Profile & Logout */}
        <div className="p-4 border-t">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowProfile(true)}
          >
            <Image
              src="/icons/avatar.png"
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-800">Bruno Mars</p>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              window.location.href = "/login";
            }}
            className="mt-3 flex items-center gap-2 text-red-500 hover:text-red-600"
          >
            <Image src="/icons/logout.png" alt="Logout" width={20} height={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>

      {/* Profile Modal */}
      {showProfile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-96 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Profile</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowProfile(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Image
                src="/icons/avatar.png"
                alt="Profile Avatar"
                width={80}
                height={80}
                className="rounded-full"
              />
              <div className="text-center text-gray-800">
                <p><strong>Name:</strong> Bruno Mars</p>
                <p><strong>Email:</strong> admin@brewingtrust.com</p>
                <p><strong>Role:</strong> Administrator</p>
              </div>
              <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for sidebar links
function SidebarLink({ href, icon, text, isActive }: { href: string; icon: string; text: string; isActive: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2 px-4 py-2 rounded transition ${isActive}`}>
      <Image src={icon} alt={text} width={20} height={20} />
      {text}
    </Link>
  );
}
