import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/lib/theme-preference';

export default function DashboardScreen() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['bottom']}
      style={{ backgroundColor: colors.background }}
    >
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
