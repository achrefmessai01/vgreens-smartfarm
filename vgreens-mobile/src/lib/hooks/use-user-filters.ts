import { useEffect, useMemo, useState } from 'react';
import type { RoleFilter } from '@/components/users/users-role-filter';
import { getUserDisplayName, type User } from '@/types/user';

export interface UserFilters {
  search: string;
  role: RoleFilter;
  activeOnly: boolean;
}

const DEFAULT: UserFilters = { search: '', role: 'all', activeOnly: false };

export function useUserFilters(users: User[]) {
  const [filters, setFilters] = useState<UserFilters>(DEFAULT);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search.trim()), 180);
    return () => clearTimeout(id);
  }, [filters.search]);

  const setSearch = (search: string) =>
    setFilters((p) => ({ ...p, search }));
  const setRole = (role: RoleFilter) => setFilters((p) => ({ ...p, role }));
  const setActiveOnly = (activeOnly: boolean) =>
    setFilters((p) => ({ ...p, activeOnly }));
  const reset = () => setFilters(DEFAULT);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return users.filter((u) => {
      if (filters.role !== 'all' && u.role !== filters.role) return false;
      if (filters.activeOnly && !u.isActive) return false;
      if (!q) return true;
      const haystack = `${getUserDisplayName(u)} ${u.email ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [users, filters.role, filters.activeOnly, debouncedSearch]);

  const extrasActive = filters.activeOnly;

  return {
    filters,
    setSearch,
    setRole,
    setActiveOnly,
    reset,
    filtered,
    extrasActive,
  };
}
