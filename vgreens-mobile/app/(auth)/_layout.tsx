import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#016f7c" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(protected)/(tabs)/dashboard" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
