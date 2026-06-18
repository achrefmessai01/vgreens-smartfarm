import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

// Derived totals for a single harvest, computed by HarvestService from the
// harvest's entries (+ parent batch for the yields). This is exactly what the
// omitted DB view would have produced; nothing here is stored on the harvest.
@ObjectType()
export class HarvestTotals {
  @Field(() => Float, { description: 'SUM of entries.classA' })
  classA: number;

  @Field(() => Float, { description: 'SUM of entries.classB' })
  classB: number;

  @Field(() => Float, { description: 'SUM of entries.classC' })
  classC: number;

  @Field(() => Float, { description: 'SUM of entries.waste' })
  waste: number;

  @Field(() => Int, { description: 'SUM of entries.fruitCount' })
  fruitCount: number;

  @Field(() => Float, { description: 'SUM of entries.totalFruitWeight' })
  totalFruitWeight: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'SUM of crate-mode entries.crateCountA. Null when the batch is not in crate mode.',
  })
  crateCountA: number | null;

  @Field(() => Int, {
    nullable: true,
    description:
      'SUM of crate-mode entries.crateCountB. Null when the batch is not in crate mode.',
  })
  crateCountB: number | null;

  @Field(() => Int, {
    nullable: true,
    description:
      'SUM of crate-mode entries.crateCountC. Null when the batch is not in crate mode.',
  })
  crateCountC: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'Unweighted MEAN of per-entry avgFruitWeight. Null when there are no entries.',
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
      'totalFruitWeight / batch.totalPlants. Null when totalPlants is 0/missing.',
  })
  yieldPerPlant: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'totalFruitWeight / batch.rowLength. Null when rowLength is 0/missing.',
  })
  yieldPerMeter: number | null;
}
