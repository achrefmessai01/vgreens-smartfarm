import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users } from 'lucide-react-native';
import { UserCard } from '@/components/users/user-card';
import { UsersHeader } from '@/components/users/users-header';
import { UsersStats } from '@/components/users/users-stats';
import { UsersSearch } from '@/components/users/users-search';
import { UsersRoleFilter } from '@/components/users/users-role-filter';
import { createUsersScreenStyles } from '@/components/users/users-screen.styles';
import { useTenantUsers } from '@/lib/hooks/use-tenant-users';
import { useUserFilters } from '@/lib/hooks/use-user-filters';
import { useAppTheme } from '@/lib/theme-preference';
import type { User } from '@/types/user';

export default function UsersScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { users, loading, isSubmitting, handleDelete, refetch } =
    useTenantUsers();
  const [refreshing, setRefreshing] = useState(false);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const styles = useMemo(() => createUsersScreenStyles(colors), [colors]);

  const {
    filters,
    setSearch,
    setRole,
    setActiveOnly,
    filtered,
    extrasActive,
  } = useUserFilters(users);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const openForm = useCallback(
    (userId?: string) =>
      router.push(
        userId
          ? { pathname: '/(protected)/user-form', params: { userId } }
          : '/(protected)/user-form',
      ),
    [router],
  );

  const onToggleReveal = useCallback((user: User) => {
    setRevealedId((prev) => (prev === user.id ? null : user.id));
  }, []);

  const onEdit = useCallback(
    (user: User) => {
      setRevealedId(null);
      openForm(user.id);
    },
    [openForm],
  );

  const onDelete = useCallback(
    (user: User) => {
      setRevealedId(null);
      handleDelete(user);
    },
    [handleDelete],
  );

  const adminsCount = users.filter((u) => u.role === 'TENANT_ADMIN').length;
  const membersCount = users.filter((u) => u.role === 'TENANT_USER').length;

  if (loading && users.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <UsersHeader
        total={users.length}
        admins={adminsCount}
        disabled={isSubmitting}
        onInvitePress={() => openForm()}
      />
      <UsersStats
        total={users.length}
        admins={adminsCount}
        members={membersCount}
      />
      <UsersSearch
        value={filters.search}
        onChange={setSearch}
        filterActive={extrasActive}
        onFilterPress={() => setActiveOnly(!extrasActive)}
      />
      <UsersRoleFilter value={filters.role} onChange={setRole} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onScrollBeginDrag={() => setRevealedId(null)}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            revealed={revealedId === item.id}
            onToggleReveal={onToggleReveal}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Users size={30} color={colors.mutedForeground} />
            </View>
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptySub}>
              Try adjusting the search or filters.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
