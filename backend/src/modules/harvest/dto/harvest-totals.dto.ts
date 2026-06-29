import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

// Derived totals for a single harvest, computed by HarvestService from the
// harvest's entries (+ parent batch for the yields). This is exactly what the
// omitted DB view would have produced; nothing here is stored on the harvest.
@ObjectType()
export class HarvestTotals {
  @Field(() => [Float], {
    description:
      'The authoritative per-quality sellable kg breakdown, positional and dynamic (index 0=A, 1=B, 2=C, ...). As wide as the widest entry; sum it for total sellable.',
  })
  classKgs: number[];

  @Field(() => Float, { description: 'SUM of entries.waste' })
  waste: number;

  @Field(() => Int, {
    description:
      'Total fruits SAMPLED: SUM of entries.sampleFruitCount. The number of fruits weighed across the samples, NOT an estimate of total fruits harvested.',
  })
  fruitCount: number;

  @Field(() => Float, {
    description:
      'Total harvested weight (kg): SUM over entries of (sellable kg across all classes + waste). Waste is INCLUDED here and also reported separately as `waste`.',
  })
  totalFruitWeight: number;

  @Field(() => [Int], {
    nullable: true,
    description:
      'Per-quality SUM of crate counts, indexed 0=A,1=B,2=C. Null when the batch is not in crate mode.',
  })
  crateCounts: number[] | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'Unweighted MEAN of per-entry avgFruitWeight (GRAMS per fruit). Null when no entry has a computable average.',
  })
  avgFruitWeight: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'Unweighted MEAN of per-entry avgBrix. Null when there are no entries.',
  })
  avgBrix: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'totalFruitWeight / living plants, where living plants = batch.totalPlants − batch.lostPlants. Null when living plants is 0/negative/missing.',
  })
  yieldPerPlant: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'totalFruitWeight / batch.runningMeter (numberOfRows × rowLength). kg per running metre across all rows of the batch. Null when runningMeter is 0/missing.',
  })
  yieldPerRunningMeter: number | null;
}
