'use client';

import { useUsersQuery } from '@/generated/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example component showing how to use Apollo Client with generated types
 *
 * After running codegen, you can use the generated hooks like:
 * import { useUsersQuery } from '@/generated/graphql'
 * const { data, loading, error } = useUsersQuery()
 */
export function UserListExample() {
  const { data, loading, error } = useUsersQuery();

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users (Example)</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.users && data.users.length > 0 ? (
          <ul className="space-y-2">
            {data.users.map((user) => (
              <li key={user.id} className="flex items-center gap-4">
                <div>
                  <p className="font-medium">
                    {user.firstName || ''} {user.lastName || ''}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {user.email || 'No email'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Role: {user.role}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found</p>
        )}
      </CardContent>
    </Card>
  );
}
