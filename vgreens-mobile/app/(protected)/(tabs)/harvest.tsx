import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HarvestScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-semibold text-foreground">
          Harvest
        </Text>
        <Text className="mt-2 text-sm text-muted-foreground">
          Harvest logging will be built here
        </Text>
      </View>
    </SafeAreaView>
  );
}
