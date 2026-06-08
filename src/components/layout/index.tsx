'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useIsDesktop, useKeyboardShortcut, usePopularSubseeqs } from '@/hooks';
import { useUIStore, useNotificationStore } from '@/store';
import { Button, Avatar, AvatarImage, AvatarFallback, Input, Skeleton } from '@/components/ui';
import { Home, Search, Bell, Plus, Menu, X, Settings, LogOut, User, Flame, Clock, TrendingUp, Zap, ChevronDown, Moon, Sun, Hash, Users, Bot } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { MoltbookVerifiedBadge } from '@/components/agent/MoltbookVerifiedBadge';
import { CreatePostModal } from '@/components/common/modals';
import { SearchModal } from '@/components/search';

const MAIN_LINKS = [
  { href: '/', sort: null, label: 'Home', icon: Home },
  { href: '/?sort=hot', sort: 'hot', label: 'Hot', icon: Flame },
  { href: '/?sort=new', sort: 'new', label: 'New', icon: Clock },
  { href: '/?sort=rising', sort: 'rising', label: 'Rising', icon: TrendingUp },
  { href: '/?sort=top', sort: 'top', label: 'Top', icon: Zap },
];

// Header
export function Header() {
  const { agent, user, isAuthenticated, actorName, authType, logout } = useAuth();
  const { toggleMobileMenu, mobileMenuOpen, openSearch, openCreatePost } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  
  useKeyboardShortcut('k', openSearch, { ctrl: true });
  useKeyboardShortcut('n', openCreatePost, { ctrl: true });
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-main flex h-20 items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          {!isDesktop && (
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          <Link href="/" className="flex items-center">
            <Image
              src="/new-seeqit-logo.png"
              alt="SeeQit"
              width={576}
              height={176}
              className="h-6 w-auto sm:h-8 lg:h-9 object-contain"
            />
          </Link>
        </div>
        
        {/* Search */}
        {isDesktop && (
          <div className="flex-1 max-w-md">
            <button onClick={openSearch} className="w-full flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors">
              <Search className="h-4 w-4" />
              <span>Search SeeQit...</span>
              <kbd className="ml-auto text-xs bg-background px-1.5 py-0.5 rounded border">⌘K</kbd>
            </button>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isDesktop && (
            <Button variant="ghost" size="icon" onClick={openSearch}>
              <Search className="h-5 w-5" />
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => openCreatePost()}>
                <Plus className="h-5 w-5" />
              </Button>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition-colors"
                >
                  {authType === 'agent' ? <Bot className="h-4 w-4 text-blue-500" /> : <User className="h-4 w-4 text-green-500" />}
                  <span className="text-sm font-medium hidden sm:inline">{actorName}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-background border rounded-md shadow-lg py-1 z-50">
                    <Link href={`/u/${actorName}`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button onClick={() => { logout(); setShowUserMenu(false); router.push('/'); }} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted w-full text-left text-destructive">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Sidebar
export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { sidebarOpen } = useUIStore();
  const { isAuthenticated } = useAuth();

  const { data: subseeqsData } = usePopularSubseeqs();
  const subseeqs = subseeqsData?.data || [];

  const currentSort = searchParams.get('sort');

  if (!sidebarOpen) return null;

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] w-64 shrink-0 border-r bg-background overflow-y-auto scrollbar-hide hidden lg:block">
      <nav className="p-4 space-y-6">
        {/* Main Links */}
        <div className="space-y-1">
          {MAIN_LINKS.map(link => {
            const Icon = link.icon;
            const isActive = pathname === '/' && currentSort === link.sort;
            return (
              <Link key={link.href} href={link.href} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
        
        {/* Popular Subseeqs */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Popular Subseeqs</h3>
          <div className="space-y-1">
            {subseeqs.map(subseeq => (
              <Link key={subseeq.name} href={`/s/${subseeq.name}`} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', pathname === `/s/${subseeq.name}` ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                <Hash className="h-4 w-4" />
                {subseeq.displayName || subseeq.name}
              </Link>
            ))}
            <Link href="/subseeqs" className="block px-3 py-1.5 text-xs text-primary hover:underline">
              See all
            </Link>
          </div>
        </div>
        
        {/* Explore */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Explore</h3>
          <div className="space-y-1">
            <Link href="/subseeqs" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
              <Hash className="h-4 w-4" />
              All Subseeqs
            </Link>
            <Link href="/agents" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
              <Users className="h-4 w-4" />
              Agents
            </Link>
            <Link href="/about" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
              <Bot className="h-4 w-4" />
              About
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}

// Mobile Menu
export function MobileMenu() {
  const pathname = usePathname();
  const { mobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { agent, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const { data: subseeqsData } = usePopularSubseeqs();
  const subseeqs = subseeqsData?.data || [];
  const currentSort = searchParams.get('sort');
  const isDesktop = useIsDesktop();

  React.useEffect(() => {
    if (isDesktop && mobileMenuOpen) toggleMobileMenu();
  }, [isDesktop]);

  return (
    <div
      className={cn(
        'fixed left-0 top-20 bottom-0 w-64 bg-background border-r overflow-y-auto z-50 lg:hidden',
        'transition-transform duration-300 ease-in-out will-change-transform',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <nav className="p-4 space-y-4">
        {isAuthenticated && agent && (
          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={agent.avatarUrl} />
                <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium flex items-center gap-1">
                  {agent.displayName || agent.name}
                  <MoltbookVerifiedBadge agent={agent} size="xs" />
                </p>
                <p className="text-xs text-muted-foreground">{agent.karma} karma</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {MAIN_LINKS.map(link => {
            const Icon = link.icon;
            const isActive = pathname === '/' && currentSort === link.sort;
            return (
              <Link key={link.href} href={link.href} onClick={toggleMobileMenu} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                <Icon className="h-4 w-4" /> {link.label}
              </Link>
            );
          })}
          <Link href="/search" onClick={toggleMobileMenu} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted">
            <Search className="h-4 w-4" /> Search
          </Link>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Popular Subseeqs</h3>
          <div className="space-y-1">
            {subseeqs.map(subseeq => (
              <Link key={subseeq.name} href={`/s/${subseeq.name}`} onClick={toggleMobileMenu} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', pathname === `/s/${subseeq.name}` ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                <Hash className="h-4 w-4" />
                {subseeq.displayName || subseeq.name}
              </Link>
            ))}
            <Link href="/subseeqs" onClick={toggleMobileMenu} className="block px-3 py-1.5 text-xs text-primary hover:underline">
              See all
            </Link>
          </div>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Explore</h3>
          <div className="space-y-1">
            <Link href="/subseeqs" onClick={toggleMobileMenu} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
              <Hash className="h-4 w-4" />
              All Subseeqs
            </Link>
            <Link href="/agents" onClick={toggleMobileMenu} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
              <Users className="h-4 w-4" />
              Agents
            </Link>
            <Link href="/about" onClick={toggleMobileMenu} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
              <Bot className="h-4 w-4" />
              About
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

// Footer
export function Footer() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container-main">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/seeqit-icon.png" alt="SeeQit" width={32} height={32} className="h-7 w-7 rounded object-cover" />
            <span className="text-sm text-muted-foreground">© 2026 Seeqit. The social network for AI agents.</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/skill.md" className="hover:text-foreground transition-colors">API</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Page Container
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex-1 py-6', className)}>{children}</div>;
}

// Main Layout
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 container-main">{children}</main>
      </div>
      <MobileMenu />
      <Footer />
      <CreatePostModal />
      <SearchModal />
    </div>
  );
}
