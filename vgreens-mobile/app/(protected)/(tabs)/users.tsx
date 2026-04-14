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
import { Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/users/user-card';
import { useTenantUsers } from '@/lib/hooks/use-tenant-users';
import type { User } from '@/types/user';

export default function UsersScreen() {
  const router = useRouter();
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
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#016f7c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <View className="flex-1 px-4 pt-2">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-foreground">Users</Text>
            <Text className="text-sm text-muted-foreground">
              Manage your tenant users
            </Text>
          </View>
          <Button
            variant="default"
            size="sm"
            onPress={handleCreate}
            disabled={isSubmitting}
            className="flex-row items-center gap-1.5"
          >
            <Plus size={16} color="#ffffff" />
            <Text className="text-sm font-medium text-primary-foreground">
              Add User
            </Text>
          </Button>
        </View>

        {users.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-base font-medium text-muted-foreground">
              No users found
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Tap &quot;Add User&quot; to invite someone
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
            contentContainerClassName="gap-3 pb-4"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#016f7c"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
