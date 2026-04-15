import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/lib/theme-preference';

export default function AlertsScreen() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['bottom']}
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-semibold text-foreground">
          Alerts
        </Text>
        <Text className="mt-2 text-sm text-muted-foreground">
          Alert notifications will be built here
        </Text>
      </View>
    </SafeAreaView>
  );
}
