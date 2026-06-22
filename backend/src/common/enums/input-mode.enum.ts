import { registerEnumType } from '@nestjs/graphql';

// Maps to the Postgres `batches_input_mode_enum` type. How a batch's harvests
// record yield: weight mode (per-quality kg entered directly) or crate mode
// (per-quality crate counts + remainder, kg derived from the batch crateWeight).
export enum InputMode {
  WEIGHT = 'weight',
  CRATE = 'crate',
}

registerEnumType(InputMode, {
  name: 'InputMode',
  description: 'Harvest yield input mode for a batch: weight or crate',
});
