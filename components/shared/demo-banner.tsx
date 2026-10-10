'use client';

import { DEMO_BANNER_TEXT } from '@/lib/config';
import { useAuthStore } from '@/stores/auth-store';
import { Info } from 'lucide-react';

export function DemoBanner() {
  const isDemoMode = useAuthStore((s) => s.isDemoMode);

  if (!isDemoMode) return null;

  return (
    <div className="flex items-center gap-2 border-b border-border bg-warning/10 px-4 py-2 text-xs text-foreground/80">
      <Info className="h-3.5 w-3.5 text-warning shrink-0" />
      <span>{DEMO_BANNER_TEXT}</span>
    </div>
  );
}
