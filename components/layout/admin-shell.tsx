'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Brain,
  LogOut,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/stores/auth-store';
import { DemoBanner } from '@/components/shared/demo-banner';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
  { href: '/admin/jobs', label: 'Job Management', icon: Briefcase },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'DA';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const AccountFooter = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="border-t border-border p-4">
      <div className="mb-3 flex items-center gap-2 px-1" title={user?.displayName || 'Demo Admin'}>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-muted text-xs font-medium">{initials}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {user?.displayName || 'Demo Admin'}
        </span>
      </div>
      <Button
        variant="outline"
        size="default"
        className="w-full justify-start text-foreground hover:bg-muted"
        onClick={async () => {
          onNavigate?.();
          await handleSignOut();
        }}
        aria-label="Sign Out"
      >
        <LogOut className="mr-2 h-4 w-4 shrink-0" />
        Sign Out
      </Button>
    </div>
  );

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Fixed Sidebar: stays stationary when the user scrolls */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card md:flex">
        <Link
          href="/admin/dashboard"
          className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-6 transition-colors hover:bg-muted/40"
          title="MSOT Admin Dashboard"
        >
          <Brain className="h-6 w-6 shrink-0 text-brand" />
          <div className="text-left">
            <div className="text-base font-semibold tracking-tight text-foreground">MSOT</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Admin</div>
          </div>
        </Link>
        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks />
        </div>
        <AccountFooter />
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex h-full flex-col">
                <SheetHeader className="border-b border-border px-6 py-4 text-left">
                  <SheetTitle className="flex items-center gap-2 text-base font-semibold">
                    <Brain className="h-6 w-6 text-brand" />
                    MSOT Admin
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </div>
                <AccountFooter onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-brand" />
            <span className="font-semibold text-foreground">MSOT Admin</span>
          </Link>
          <div className="w-9" />
        </header>

        <DemoBanner />

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
