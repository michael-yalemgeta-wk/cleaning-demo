"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  History,
  DollarSign,
  Bell,
  LogOut
} from "lucide-react";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isWorker = localStorage.getItem("isWorker");
    if (!isWorker) {
      router.push("/worker/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isWorker");
    localStorage.removeItem("workerId");
    localStorage.removeItem("workerName");
    localStorage.removeItem("workerStaffId");
    router.push("/worker/login");
  };

  const workerLinks = [
    { href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/worker/time-tracking", label: "Time Tracking", icon: Clock },
    { href: "/worker/work-history", label: "Work History", icon: History },
    { href: "/worker/earnings", label: "Earnings", icon: DollarSign },
    { href: "/worker/notifications", label: "Messages", icon: Bell },
  ];

  if (!authorized) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{
        width: '250px',
        background: 'var(--secondary)',
        color: 'var(--text-inverted)',
        minHeight: '100vh',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '3rem', paddingLeft: '1rem' }}>
          Worker Portal
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          {workerLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none'
                }}
              >
                <Icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            marginTop: 'auto'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      <div style={{ flexGrow: 1, background: 'var(--background)' }}>
        {children}
      </div>
    </div>
  );
}
