"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import styles from "@/styles/adminlayout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showProfile, setShowProfile] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        {/* Logo Row */}
        <div className={styles.logoRow}>
          <div className={styles.logoWrapper}>
            <Image src="/logo.png" alt="Logo" width={60} height={60} />
          </div>

          <div className={styles.brandText}>
            <span>BREWING</span>
            <span className={styles.trust}>TRUST</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <Link
            href="/admin/overview"
            className={isActive("/admin/overview") ? styles.active : ""}
          >
            <Image src="/icons/overview.png" alt="" width={20} height={20} />
            <span>Overview</span>
          </Link>

          <Link
            href="/admin/employees"
            className={isActive("/admin/employees") ? styles.active : ""}
          >
            <Image src="/icons/employee.png" alt="" width={20} height={20} />
            <span>Employee List</span>
          </Link>

          <Link
            href="/admin/attendance"
            className={isActive("/admin/attendance") ? styles.active : ""}
          >
            <Image src="/icons/attendance.png" alt="" width={20} height={20} />
            <span>Attendance and Payroll</span>
          </Link>

          <Link
            href="/admin/anomaly"
            className={isActive("/admin/anomaly") ? styles.active : ""}
          >
            <Image src="/icons/anomaly.png" alt="" width={20} height={20} />
            <span>Anomaly Detection</span>
          </Link>

          <Link
            href="/admin/ledger"
            className={isActive("/admin/ledger") ? styles.active : ""}
          >
            <Image src="/icons/ledger.png" alt="" width={20} height={20} />
            <span>Blockchain Ledger</span>
          </Link>
        </nav>

        {/* Profile Card */}
        <div className={styles.profileCard}>
          {/* Make this a button instead of Link */}
          <div
            className={styles.profileTop}
            onClick={() => setShowProfile(true)}
          >
            <div className={styles.avatar}></div>
            <div>
              <div className={styles.profileName}>Bruno Mars</div>
              <div className={styles.profileRole}>Admin</div>
            </div>
          </div>

          <div className={styles.logout}>
            <Image src="/icons/logout.png" alt="" width={20} height={20} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>

      {/* ================= PROFILE MODAL ================= */}
      {showProfile && (
        <div
          className={styles.overlay}
          onClick={() => setShowProfile(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Profile</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowProfile(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.modalAvatar}></div>

              <div className={styles.modalInfo}>
                <p><strong>Name:</strong> Bruno Mars</p>
                <p><strong>Email:</strong> admin@brewingtrust.com</p>
                <p><strong>Role:</strong> Administrator</p>
              </div>

              <button className={styles.editBtn}>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
