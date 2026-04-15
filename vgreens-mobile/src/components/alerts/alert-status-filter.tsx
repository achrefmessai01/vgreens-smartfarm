import { ScrollView, Text, Pressable } from 'react-native';
import { AlertStatus } from '@/generated/graphql';
import type { AlertsFilterInput } from '@/lib/alerts-filter';

const OPTIONS: { key: 'all' | AlertStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: AlertStatus.Open, label: 'Open' },
  { key: AlertStatus.Acknowledged, label: 'Acknowledged' },
  { key: AlertStatus.Resolved, label: 'Resolved' },
];

interface AlertStatusFilterProps {
  filter: AlertsFilterInput;
  onChange: (updates: Partial<AlertsFilterInput>) => void;
}

export function AlertStatusFilter({ filter, onChange }: AlertStatusFilterProps) {
  const active: 'all' | AlertStatus =
    filter.status && !filter.statusIn?.length ? filter.status : 'all';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-3 flex-none"
      contentContainerClassName="flex-row gap-2 pb-1"
    >
      {OPTIONS.map(({ key, label }) => {
        const selected =
          key === 'all'
            ? active === 'all'
            : active === key;
        return (
          <Pressable
            key={String(key)}
            onPress={() => {
              if (key === 'all') {
                onChange({ status: undefined, statusIn: undefined });
              } else {
                onChange({ status: key, statusIn: undefined });
              }
            }}
            className={`rounded-full border px-3 py-1.5 ${
              selected
                ? 'border-primary bg-primary/15'
                : 'border-border bg-muted/60'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                selected ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
