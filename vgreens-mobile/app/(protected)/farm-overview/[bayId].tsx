import { View, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BayDetailScreen() {
  const { bayId } = useLocalSearchParams<{ bayId: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Bay ${bayId}`,
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold text-foreground">
            Bay {bayId} Details
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Bay detail screen will be built here
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}
