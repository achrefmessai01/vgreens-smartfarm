import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class YieldOverTimeData {
  @Field()
  date: string;

  @Field(() => Float)
  yield: number;
}

@ObjectType()
export class YieldPerRunningMeterData {
  @Field()
  date: string;

  @Field(() => Float)
  yieldPerRunningMeter: number;
}

@ObjectType()
export class ClassDistributionData {
  @Field()
  date: string;

  @Field(() => [Float], {
    description:
      'Per-quality kg for this day, positional and dynamic (index 0=A, 1=B, ...), padded to the widest day.',
  })
  classes: number[];

  @Field(() => Float)
  waste: number;
}

@ObjectType()
export class BrixTrendData {
  @Field()
  date: string;

  @Field(() => Float)
  brix: number;
}

@ObjectType()
export class FruitWeightTrendData {
  @Field()
  date: string;

  @Field(() => Float)
  weight: number;
}

@ObjectType()
export class CumulativeYieldData {
  @Field()
  date: string;

  @Field(() => Float, {
    description: 'Cumulative sellable kg (all quality classes summed) to date.',
  })
  cumulativeSellable: number;

  @Field(() => Float)
  cumulativeWaste: number;
}

@ObjectType()
export class HarvestDashboardMetrics {
  @Field()
  species: string;

  @Field()
  variety: string;

  @Field(() => Int)
  harvestCount: number;

  @Field(() => Float, {
    description:
      'Total sellable yield (kg) across all quality classes. Waste is NEVER included in yield; it is reported separately as wasteTotal.',
  })
  totalYield: number;

  @Field(() => Float)
  averageBrix: number;

  @Field(() => Float)
  averageFruitWeight: number;

  @Field(() => Float, {
    nullable: true,
    description:
      'Weighted sellable kg per living plant across selected batches (waste excluded): Σ sellable weight / Σ livingPlants. Null when no batch in scope has livingPlants > 0.',
  })
  yieldPerPlant: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'Weighted sellable kg per running metre across selected batches (waste excluded): Σ sellable weight / Σ runningMeter (numberOfRows × rowLength). Null when no batch in scope has runningMeter > 0.',
  })
  yieldPerRunningMeter: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'Sellable yield per m² across selected batches (waste excluded): Σ sellable weight / Σ cultivationArea (distinct batches). Null when no batch in scope has cultivationArea > 0.',
  })
  yieldPerSquareMeter: number | null;

  @Field(() => Float)
  marketablePercent: number;

  @Field(() => Float)
  wastePercent: number;

  @Field(() => Float)
  wasteTotal: number;

  @Field(() => [Float], {
    description:
      'Per-quality sellable kg totals across the selected harvests, positional and dynamic (index 0=A, 1=B, 2=C, ...). Element-wise sum of each harvest classKgs.',
  })
  classTotals: number[];

  @Field(() => Int)
  criticalAlerts: number;

  @Field(() => Int)
  daysActive: number;

  @Field(() => [YieldOverTimeData])
  yieldOverTime: YieldOverTimeData[];

  @Field(() => [YieldPerRunningMeterData])
  yieldPerRunningMeterTrend: YieldPerRunningMeterData[];

  @Field(() => [ClassDistributionData])
  classDistribution: ClassDistributionData[];

  @Field(() => [BrixTrendData])
  brixTrend: BrixTrendData[];

  @Field(() => [FruitWeightTrendData])
  fruitWeightTrend: FruitWeightTrendData[];

  @Field(() => [CumulativeYieldData])
  cumulativeYield: CumulativeYieldData[];
}
