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
import { UserActionMenu } from '@/components/users/user-action-menu';
import { createUsersScreenStyles } from '@/components/users/users-screen.styles';
import { useTenantUsers } from '@/lib/hooks/use-tenant-users';
import { useUserFilters } from '@/lib/hooks/use-user-filters';
import { useAppTheme } from '@/lib/theme-preference';
import type { User } from '@/types/user';

export default function UsersScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { users, loading, isSubmitting, handleToggleActive, refetch } =
    useTenantUsers();
  const [refreshing, setRefreshing] = useState(false);
  const [menuUser, setMenuUser] = useState<User | null>(null);
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
        renderItem={({ item }) => (
          <UserCard user={item} onMenuPress={setMenuUser} />
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

      <UserActionMenu
        visible={menuUser !== null}
        user={menuUser}
        onClose={() => setMenuUser(null)}
        onView={(u) => openForm(u.id)}
        onEdit={(u) => openForm(u.id)}
        onToggleActive={(u) => void handleToggleActive(u)}
      />
    </SafeAreaView>
  );
}
