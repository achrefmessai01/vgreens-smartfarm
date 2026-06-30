'use client';

import { UserRole } from '@/generated/graphql';
import { useSelectedTenantId } from '@/lib/contexts/selected-tenant-context';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useTenantNavItems } from '@/lib/hooks/use-tenant-nav-items';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Horizontal tenant navigation rendered in the top header, immediately below
 * the main navbar. Mirrors the items shown in the sidebar tenant nav so users
 * can switch pages without opening the sidebar — particularly useful for
 * VGREENS_ADMIN reviewing a specific tenant, where having harvest / farm
 * overview / alerts links right at the top mirrors how a tenant user would
 * actually navigate the app.
 *
 * Visibility:
 *  - VGREENS_ADMIN: only when they've picked a tenant in the navbar selector
 *    (otherwise they're in admin mode and the sidebar shows admin links).
 *  - Regular tenant users (TENANT_ADMIN / TENANT_USER): never. They already
 *    have the sidebar pinned to their own tenant, so a duplicate header strip
 *    would just be visual noise.
 */
export function TenantNavbar() {
  const pathname = usePathname();
  const { role, loading } = useCurrentUser();
  const selectedTenantId = useSelectedTenantId();
  // Pass the selected tenant id so the items are filtered against THAT
  // tenant's enabled features.
  const navItems = useTenantNavItems(selectedTenantId ?? undefined);

  if (loading) return null;

  // VGREENS_ADMIN-only surface. Regular tenant users get the sidebar instead.
  const isVGreensAdmin = role === UserRole.VgreensAdmin;
  if (!isVGreensAdmin) return null;
  // Admin without a picked tenant is in admin mode — hide the tenant strip.
  if (!selectedTenantId) return null;
  if (navItems.length === 0) return null;

  return (
    <div className="bg-background dark:bg-background sticky top-16 z-20 border-b">
      <nav
        aria-label="Tenant pages"
        className="flex h-12 items-center gap-1 overflow-x-auto px-4 lg:px-6"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 shadow-[0_8px_20px_-14px_rgba(16,185,129,0.9)] dark:text-emerald-100'
                  : 'border-border/60 bg-background/80 text-foreground/70 hover:border-border hover:bg-background hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
