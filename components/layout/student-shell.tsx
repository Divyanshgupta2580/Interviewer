'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Brain,
  History,
  Briefcase,
  FolderKanban,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/stores/auth-store';
import { DemoBanner } from '@/components/shared/demo-banner';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/interview/configure', label: 'AI Interview', icon: Brain, emphasized: true },
  { href: '/interview/history', label: 'Interview History', icon: History },
  { href: '/applications', label: 'Applications', icon: FolderKanban },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/resources', label: 'Resume & Resources', icon: FileText },
];

export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'DS';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const AccountFooter = ({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) => (
    <div className={cn('border-t border-border', collapsed ? 'p-2' : 'p-4')}>
      <div className={cn('mb-3 flex items-center gap-2', collapsed ? 'justify-center' : 'px-1')} title={user?.displayName || 'Demo Student'}>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-muted text-xs font-medium">{initials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <span className="min-w-0 truncate text-sm font-medium">
            {user?.displayName || 'Demo Student'}
          </span>
        )}
      </div>
      <Button
        variant="outline"
        size={collapsed ? 'icon' : 'default'}
        className={cn('w-full', collapsed ? 'px-0' : 'justify-start')}
        onClick={async () => {
          onNavigate?.();
          await handleSignOut();
        }}
        aria-label="Sign Out"
      >
        <LogOut className={cn('h-4 w-4', !collapsed && 'mr-2')} />
        {!collapsed && 'Sign Out'}
      </Button>
    </div>
  );

  const NavLinks = ({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors hover:scale-[1.02]',
              collapsed ? 'justify-center px-2' : 'px-3',
              isActive
                ? item.emphasized
                  ? 'bg-brand/10 text-brand'
                  : 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', isActive && item.emphasized && 'text-brand')} />
            {!collapsed && item.label}
            {item.emphasized && !collapsed && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className={cn(
          'hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 md:flex md:flex-col',
          sidebarCollapsed ? 'w-[76px]' : 'w-60'
        )}>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            className={cn(
              'flex h-16 items-center border-b border-border transition-colors hover:bg-muted',
              sidebarCollapsed ? 'justify-center px-2' : 'gap-2 px-6'
            )}
            aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <Brain className="h-6 w-6 shrink-0 text-brand" />
            {!sidebarCollapsed && <span className="text-base font-semibold tracking-tight">MSOT</span>}
          </button>
          <div className="flex-1 overflow-y-auto p-4">
            <NavLinks collapsed={sidebarCollapsed} />
          </div>
          <AccountFooter collapsed={sidebarCollapsed} />
        </aside>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Header */}
          <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden">
            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex h-full flex-col">
                  <SheetHeader className="border-b border-border">
                    <SheetTitle className="flex items-center gap-2">
                      <Brain className="h-6 w-6 text-brand" />
                      MSOT
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-4">
                    <NavLinks onNavigate={() => setMobileOpen(false)} />
                  </div>
                  <AccountFooter onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo on mobile */}
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Brain className="h-5 w-5 text-brand" />
              <span className="font-semibold">MSOT</span>
            </Button>
            <div className="flex-1" />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
