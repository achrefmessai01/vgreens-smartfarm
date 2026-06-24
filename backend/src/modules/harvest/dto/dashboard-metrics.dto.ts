import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class YieldOverTimeData {
  @Field()
  date: string;

  @Field(() => Float)
  yield: number;
}

@ObjectType()
export class YieldPerMeterData {
  @Field()
  date: string;

  @Field(() => Float)
  yieldPerMeter: number;
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

  @Field(() => Float)
  totalYield: number;

  @Field(() => Float)
  averageBrix: number;

  @Field(() => Float)
  averageFruitWeight: number;

  @Field(() => Float, {
    nullable: true,
    description:
      'Weighted kg per plant across selected batches: Σ(classA+classB+classC) / Σ totalPlants. Null when no batch in scope has totalPlants > 0.',
  })
  yieldPerPlant: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'Weighted kg per row metre across selected batches: Σ(classA+classB+classC) / Σ rowLength. Null when no batch in scope has rowLength > 0.',
  })
  yieldPerMeter: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'Total yield per m² across selected batches: totalYield / Σ cultivationArea. Null when no batch in scope has cultivationArea > 0.',
  })
  yieldPerSquareMeter: number | null;

  @Field(() => Float)
  marketablePercent: number;

  @Field(() => Float)
  wastePercent: number;

  @Field(() => Float)
  wasteTotal: number;

  @Field(() => Float)
  classBTotal: number;

  @Field(() => Float)
  classCTotal: number;

  @Field(() => Int)
  criticalAlerts: number;

  @Field(() => Int)
  daysActive: number;

  @Field(() => [YieldOverTimeData])
  yieldOverTime: YieldOverTimeData[];

  @Field(() => [YieldPerMeterData])
  yieldPerMeterTrend: YieldPerMeterData[];

  @Field(() => [ClassDistributionData])
  classDistribution: ClassDistributionData[];

  @Field(() => [BrixTrendData])
  brixTrend: BrixTrendData[];

  @Field(() => [FruitWeightTrendData])
  fruitWeightTrend: FruitWeightTrendData[];

  @Field(() => [CumulativeYieldData])
  cumulativeYield: CumulativeYieldData[];
}
