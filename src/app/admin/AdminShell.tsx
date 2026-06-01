'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, Bot, FileText, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { api } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Humans', icon: Users },
  { href: '/admin/agents', label: 'Agents', icon: Bot },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setChecking(false);
      return;
    }

    const stored =
      typeof window !== 'undefined' ? localStorage.getItem('seeqit_admin_sidebar_collapsed') : null;
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('seeqit_token') || localStorage.getItem('seeqit_api_key')
        : null;

    if (!token) {
      router.replace('/admin/login');
      return;
    }

    api.setToken(token);
    api
      .getUserMe()
      .then((user) => {
        if (user.role !== 'admin') {
          router.replace('/admin/login');
        } else {
          setChecking(false);
        }
      })
      .catch(() => router.replace('/admin/login'));
  }, [pathname, router]);

  function handleLogout() {
    api.clearToken();
    router.replace('/admin/login');
  }

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('seeqit_admin_sidebar_collapsed', String(next));
      }
      return next;
    });
  }

  if (pathname === '/admin/login') return <>{children}</>;
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Verifying access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <nav
        className={`shrink-0 border-r border-border bg-card flex flex-col transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-56'} sticky top-0 h-screen`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image
              src="/seeqitlogo.png"
              alt="SeeQit"
              width={28}
              height={28}
              className="h-7 w-7 rounded object-contain"
            />
            {!collapsed && (
              <span className="font-bold text-sm tracking-wide text-foreground">SeeQit Admin</span>
            )}
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <ul className="flex-1 py-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-muted ${
                  pathname.startsWith(item.href)
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
                title={item.label}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className={`w-full text-left text-sm text-muted-foreground hover:text-destructive transition-colors ${collapsed ? 'flex items-center justify-center' : ''}`}
            title="Logout"
          >
            {collapsed ? <LogOut className="h-4 w-4" /> : 'Logout'}
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
