import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-3xl font-bold text-primary">vGreens</Text>
        <Text className="mb-8 text-base text-muted-foreground">
          Create your account
        </Text>

        <View className="w-full max-w-sm gap-4">
          {/* Clerk sign-up UI will be integrated here */}
          <Text className="text-center text-sm text-muted-foreground">
            Sign-up screen — connect Clerk components here
          </Text>

          <Pressable
            onPress={() => router.push('/(auth)/sign-in')}
            className="mt-4"
          >
            <Text className="text-center text-sm text-primary">
              Already have an account? Sign in
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
