'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users',     label: 'Users' },
  { href: '/admin/agents',    label: 'Agents' },
  { href: '/admin/posts',     label: 'Posts' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setChecking(false);
      return;
    }

    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('seeqit_token') || localStorage.getItem('seeqit_api_key'))
      : null;

    if (!token) {
      router.replace('/admin/login');
      return;
    }

    api.setToken(token);
    api.getUserMe()
      .then(user => {
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
      {/* Sidebar */}
      <nav className="w-56 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <span className="font-bold text-sm tracking-wide text-foreground">⚙ Seeqit Admin</span>
        </div>
        <ul className="flex-1 py-2">
          {NAV_ITEMS.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-2 text-sm transition-colors hover:bg-muted ${
                  pathname.startsWith(item.href)
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
