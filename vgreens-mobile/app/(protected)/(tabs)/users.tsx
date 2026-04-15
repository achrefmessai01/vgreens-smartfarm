import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Users } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/users/user-card';
import { useTenantUsers } from '@/lib/hooks/use-tenant-users';
import { useAppTheme } from '@/lib/theme-preference';
import type { User } from '@/types/user';

export default function UsersScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { users, loading, isSubmitting, handleDelete, refetch } =
    useTenantUsers();
  const [refreshing, setRefreshing] = useState(false);

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
      <SafeAreaView
        className="flex-1 bg-background"
        edges={['bottom']}
        style={{ backgroundColor: colors.background }}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['bottom']}
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-1 px-4 pt-4">
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">Users</Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {users.length > 0
                ? `${users.length} team member${users.length !== 1 ? 's' : ''}`
                : 'Manage your team'}
            </Text>
          </View>
          <Button
            variant="default"
            size="sm"
            onPress={handleCreate}
            disabled={isSubmitting}
            className="flex-row items-center gap-1.5 rounded-xl px-4"
          >
            <Plus size={16} color="#ffffff" />
            <Text className="text-sm font-semibold text-primary-foreground">
              Add User
            </Text>
          </Button>
        </View>

        {users.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3 pb-20">
            <View className="items-center justify-center rounded-full bg-muted p-5">
              <Users size={32} color={colors.mutedForeground} />
            </View>
            <Text className="text-base font-semibold text-foreground">
              No team members yet
            </Text>
            <Text className="max-w-[250px] text-center text-sm text-muted-foreground">
              Invite people to join your tenant by tapping &quot;Add User&quot;
              above
            </Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserCard
                user={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                disabled={isSubmitting}
              />
            )}
            contentContainerClassName="gap-3 pb-6"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
