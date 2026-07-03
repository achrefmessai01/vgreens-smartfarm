import { registerEnumType } from '@nestjs/graphql';

// Maps to the Postgres `harvests_input_mode_enum` type. How a harvest records
// yield: weight mode (per-quality kg entered directly) or crate mode
// (per-quality crate counts + remainder, kg derived from the selected crate's
// weight). Per-harvest — one batch can hold harvests in different modes.
export enum InputMode {
  WEIGHT = 'weight',
  CRATE = 'crate',
}

registerEnumType(InputMode, {
  name: 'InputMode',
  description: 'Yield input mode of a harvest: weight or crate',
});
