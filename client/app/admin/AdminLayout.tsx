"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type MeResponse = {
  user?: {
    username?: string;
    fullName?: string;
    email?: string;
    role?: "admin" | "employee";
  };
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showProfile, setShowProfile] = useState(false);
  const [me, setMe] = useState<MeResponse["user"] | null>(null);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fast-path: decode username from JWT so we don't show a generic fallback while loading.
        try {
          const decoded = jwtDecode<{ username?: string; email?: string; role?: "admin" | "employee" }>(token);
          setMe((prev) => ({
            username: prev?.username ?? decoded.username,
            email: prev?.email ?? decoded.email,
            role: prev?.role ?? decoded.role,
            fullName: prev?.fullName
          }));
        } catch {
          // ignore invalid/unknown token payload
        }

        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return;
        const data = (await res.json()) as MeResponse;
        setMe(data.user ?? null);
      } catch {
        setMe(null);
      }
    };

    fetchMe();
  }, []);

  const displayName = useMemo(() => {
    return me?.fullName?.trim() || me?.username?.trim() || "Admin";
  }, [me]);

  const displayUsername = useMemo(() => me?.username?.trim() || "", [me]);
  const displayEmail = useMemo(() => me?.email?.trim() || "", [me]);
  const roleLabel = useMemo(() => (me?.role === "admin" ? "Administrator" : me?.role || "Admin"), [me]);
  const initial = useMemo(() => (displayName[0] || "A").toUpperCase(), [displayName]);

  return (
    <div className="h-screen bg-[#f4f2ee] text-zinc-900">
      <div className="flex h-full">
        {/* Sidebar (fixed size across all /admin routes) */}
        <aside className="w-72 min-w-72 shrink-0 h-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] p-6 flex flex-col overflow-y-auto">
          {/* Logo Row */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#F89040] rounded-full flex items-center justify-center">
              <Image src="/logo.png" alt="Brewing Trust Logo" width={32} height={32} />
            </div>
            <div className="text-lg font-bold">
              <div className="text-[#F89040]">BREWING</div>
              <div className="text-zinc-900">TRUST</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <SidebarLink href="/admin/overview" icon="/icons/overview.png" text="Overview" isActive={isActive("/admin/overview")} />
            <SidebarLink href="/admin/employees" icon="/icons/employee.png" text="Employee List" isActive={isActive("/admin/employees")} />
            <SidebarLink href="/admin/attendance" icon="/icons/attendance.png" text="Attendance and Payroll" isActive={isActive("/admin/attendance")} />
            <SidebarLink href="/admin/anomaly" icon="/icons/anomaly.png" text="Anomaly Detection" isActive={isActive("/admin/anomaly")} />
            <SidebarLink href="/admin/ledger" icon="/icons/ledger.png" text="Blockchain Ledger" isActive={isActive("/admin/ledger")} />
          </nav>

          {/* Profile Card */}
          <div className="mt-auto pt-6">
            <div
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => setShowProfile(true)}
            >
              <div className="w-10 h-10 bg-[#F89040] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {initial}
              </div>
              <div>
                <div className="font-semibold text-zinc-900">{displayName}</div>
                <div className="text-sm text-zinc-500">
                  {roleLabel}
                  {displayUsername ? ` • @${displayUsername}` : ""}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                window.location.href = "/";
              }}
              className="flex items-center gap-2 mt-3 rounded-md p-2 text-[#e54b3c] hover:bg-white/60 w-full text-left"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 17l5-5-5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 12H3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 3v18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.5"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-7xl w-full">
            <div className="mb-4">
              <div className="rounded-xl bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
                <p className="text-sm font-semibold text-[#F89040]">
                  {displayName}
                  {displayUsername && displayUsername !== displayName ? ` (@${displayUsername})` : ""}
                </p>
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.10)] max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-zinc-900">Profile</h2>
              <button
                className="text-zinc-500 hover:text-zinc-700 text-xl"
                onClick={() => setShowProfile(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-[#F89040] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {initial}
              </div>
              <div className="text-center text-zinc-900">
                <p><strong>Name:</strong> {displayName}</p>
                <p><strong>Username:</strong> {displayUsername ? `@${displayUsername}` : "—"}</p>
                <p><strong>Email:</strong> {displayEmail || "—"}</p>
                <p><strong>Role:</strong> {roleLabel}</p>
              </div>
              <button className="bg-[#F89040] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E07F33] transition">
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
function SidebarLink({ href, icon, text, isActive }: { href: string; icon: string; text: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        isActive
          ? "bg-[#F89040] text-white"
          : "text-zinc-700 hover:bg-gray-100"
      }`}
    >
      <Image src={icon} alt={`${text} icon`} width={20} height={20} />
      <span className="font-medium">{text}</span>
    </Link>
  );
}
