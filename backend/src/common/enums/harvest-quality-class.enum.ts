import { registerEnumType } from '@nestjs/graphql';

// The saleable crop grades a Brix reading can be attributed to. Waste (the
// fourth bucket) is excluded — it isn't a quality measured by Brix.
export enum HarvestQualityClass {
  A = 'A',
  B = 'B',
  C = 'C',
}

registerEnumType(HarvestQualityClass, {
  name: 'HarvestQualityClass',
  description: 'Saleable crop grade a Brix reading belongs to (A, B or C)',
});
