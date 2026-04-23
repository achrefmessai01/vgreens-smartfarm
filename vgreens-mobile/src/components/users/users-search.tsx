import { memo, useMemo } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Filter, Search } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface UsersSearchProps {
  value: string;
  onChange: (v: string) => void;
  filterActive?: boolean;
  onFilterPress?: () => void;
}

function UsersSearchBase({
  value,
  onChange,
  filterActive,
  onFilterPress,
}: UsersSearchProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 16,
          marginBottom: 10,
        },
        searchWrap: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          height: 42,
          borderRadius: 12,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        input: {
          flex: 1,
          fontSize: 14,
          color: colors.foreground,
          paddingVertical: 0,
        },
        filterBtn: {
          width: 42,
          height: 42,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        filterActiveBtn: {
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}1f`,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.row}>
      <View style={styles.searchWrap}>
        <Search size={15} color={colors.mutedForeground} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search name or email..."
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      <Pressable
        onPress={onFilterPress}
        style={[styles.filterBtn, filterActive && styles.filterActiveBtn]}
        accessibilityLabel="Filters"
      >
        <Filter
          size={16}
          color={filterActive ? colors.primary : colors.mutedForeground}
        />
      </Pressable>
    </View>
  );
}

export const UsersSearch = memo(UsersSearchBase);
UsersSearch.displayName = 'UsersSearch';
