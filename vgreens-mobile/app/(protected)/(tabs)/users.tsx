import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Users } from 'lucide-react-native';
import { UserCard } from '@/components/users/user-card';
import { createUsersScreenStyles } from '@/components/users/users-screen.styles';
import { useTenantUsers } from '@/lib/hooks/use-tenant-users';
import { useAppTheme } from '@/lib/theme-preference';
import type { User } from '@/types/user';

export default function UsersScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { users, loading, isSubmitting, handleDelete, refetch } =
    useTenantUsers();
  const [refreshing, setRefreshing] = useState(false);
  const styles = useMemo(() => createUsersScreenStyles(colors), [colors]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleEdit = useCallback(
    (user: User) => {
      router.push({
        pathname: '/(protected)/user-form',
        params: { userId: user.id },
      });
    },
    [router],
  );

  const handleCreate = useCallback(() => {
    router.push('/(protected)/user-form');
  }, [router]);

  if (loading && users.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.head}>
          <View style={styles.headText}>
            <Text style={styles.h1} numberOfLines={1}>
              Users
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              {users.length > 0
                ? `${users.length} team member${users.length !== 1 ? 's' : ''}`
                : 'Manage your team'}
            </Text>
          </View>
          <Pressable
            style={styles.cta}
            onPress={handleCreate}
            disabled={isSubmitting}
          >
            <Plus size={16} color={colors.primaryForeground} />
            <Text style={styles.ctaText}>New</Text>
          </Pressable>
        </View>

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              disabled={isSubmitting}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Users size={30} color={colors.mutedForeground} />
              </View>
              <Text style={styles.emptyTitle}>No team members yet</Text>
              <Text style={styles.emptySub}>
                Invite teammates to collaborate on your farm.
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
      </View>
    </SafeAreaView>
  );
}
