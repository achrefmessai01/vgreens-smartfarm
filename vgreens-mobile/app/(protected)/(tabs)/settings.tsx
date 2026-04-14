import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-semibold text-foreground">
          Settings
        </Text>
        <Text className="mt-2 text-sm text-muted-foreground">
          User settings will be built here
        </Text>

        <Pressable
          onPress={() => signOut()}
          className="mt-8 rounded-lg bg-destructive px-6 py-3"
        >
          <Text className="font-medium text-white">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
