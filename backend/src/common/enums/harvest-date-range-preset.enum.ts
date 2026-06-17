import { registerEnumType } from '@nestjs/graphql';

// Relative time-range presets for filtering the harvest-entry list by the
// batch's plantingDate. Stored (not the resolved from/to dates) so a choice
// like "this month" stays relative across sessions. The frontend resolves each
// preset to an inclusive plantingDate range at query time.
export enum HarvestDateRangePreset {
  ALL = 'ALL',
  TODAY = 'TODAY',
  THIS_WEEK = 'THIS_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  THIS_YEAR = 'THIS_YEAR',
}

registerEnumType(HarvestDateRangePreset, {
  name: 'HarvestDateRangePreset',
  description: 'Relative plantingDate range presets for the harvest list',
});
