import { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { useBatchSheet } from '@/lib/hooks/use-batch-sheet';
import type { BatchDetailsData, BatchSheetMode } from '@/types/batch-sheet';
import { BatchSheetHeader } from './fields/batch-sheet-header';
import { BatchSheetStats } from './fields/batch-sheet-stats';
import { BatchSheetYield } from './fields/batch-sheet-yield';
import { BatchSheetBrix } from './fields/batch-sheet-brix';
import { BatchSheetPhotos } from './fields/batch-sheet-photos';
import { createBatchSheetStyles } from './batch-sheet.styles';

interface BatchSheetProps {
  visible: boolean;
  harvestId: string | null;
  batchData: BatchDetailsData | null;
  mode: BatchSheetMode;
  onClose: () => void;
  onCompleted: () => void;
}

export function BatchSheet({
  visible,
  harvestId,
  batchData,
  mode,
  onClose,
  onCompleted,
}: BatchSheetProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createBatchSheetStyles(colors), [colors]);

  const {
    currentData,
    loading,
    uploading,
    handleBrixChange,
    handleYieldChange,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSave,
  } = useBatchSheet({ harvestId, batchData, mode, onCompleted });

  const buttonLabel = loading
    ? mode === 'edit'
      ? 'Updating…'
      : 'Saving…'
    : mode === 'edit'
      ? 'Update'
      : 'Log Harvest';

  const sheetTitle = currentData?.greenhouse?.name
    ? `Batch Details — ${currentData.greenhouse.name}`
    : 'Batch Details';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.title} numberOfLines={1}>
            {sheetTitle}
          </Text>
          <Pressable onPress={onClose} style={styles.close} hitSlop={8}>
            <X size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {currentData ? (
          <>
            <View style={styles.summary}>
              <BatchSheetHeader
                name={currentData.name}
                species={currentData.species}
                variety={currentData.variety}
                status={currentData.status}
              />
              <BatchSheetStats
                daysAfterPlanting={currentData.daysAfterPlanting}
                area={currentData.area}
              />
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <BatchSheetYield
                marketable={currentData.todaysHarvest.marketable}
                waste={currentData.todaysHarvest.waste}
                rowX={currentData.todaysHarvest.rowX}
                rowY={currentData.todaysHarvest.rowY}
                disabled={loading}
                onYieldChange={handleYieldChange}
              />
              <BatchSheetBrix
                measurements={currentData.brixMeasurements}
                disabled={loading}
                onMeasurementChange={handleBrixChange}
              />
              <BatchSheetPhotos
                photos={currentData.photos}
                disabled={loading}
                uploading={uploading}
                onUpload={handlePhotoUpload}
                onRemove={handleRemovePhoto}
              />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
              <Pressable
                style={[styles.submit, loading && styles.submitDisabled]}
                onPress={() => void handleSave()}
                disabled={loading || !harvestId}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text style={styles.submitText}>{buttonLabel}</Text>
                )}
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No batch selected</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}
