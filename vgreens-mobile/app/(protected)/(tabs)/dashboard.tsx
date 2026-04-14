import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-semibold text-foreground">
          Farm Overview
        </Text>
        <Text className="mt-2 text-sm text-muted-foreground">
          Telemetry dashboard will be built here
        </Text>
      </View>
    </SafeAreaView>
  );
}
