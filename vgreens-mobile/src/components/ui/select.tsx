import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  title?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  title = 'Select an option',
  disabled,
  hasError,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={cn(
          'h-12 flex-row items-center justify-between rounded-xl border bg-card px-4',
          hasError ? 'border-destructive' : 'border-input',
          disabled && 'opacity-50',
        )}
      >
        <Text
          className={cn(
            'text-[15px]',
            selectedLabel ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <ChevronDown size={18} color="#8ba5ad" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
        >
          <View style={{ height: '40%' }} />
        </Pressable>

        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const selected = item.value === value;
              return (
                <Pressable
                  onPress={() => {
                    onValueChange(item.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    selected && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selected ? <Check size={18} color="#016f7c" /> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: '#016f7c',
    backgroundColor: 'rgba(1, 111, 124, 0.05)',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  optionTextSelected: {
    color: '#016f7c',
  },
});
