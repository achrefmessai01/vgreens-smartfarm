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

  @Field(() => Float)
  marketable: number;

  @Field(() => Float)
  classB: number;

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

  @Field(() => Float)
  cumulativeClassA: number;

  @Field(() => Float)
  cumulativeClassB: number;

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
      'Weighted kg per plant across selected batches: Σ(classA+classB) / Σ totalPlants. Null when no batch in scope has totalPlants > 0.',
  })
  yieldPerPlant: number | null;

  @Field(() => Float)
  marketablePercent: number;

  @Field(() => Float)
  wastePercent: number;

  @Field(() => Float)
  wasteTotal: number;

  @Field(() => Float)
  classBTotal: number;

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
