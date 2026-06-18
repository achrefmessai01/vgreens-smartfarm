import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

export type Alert = {
  __typename?: 'Alert';
  acknowledgedBy?: Maybe<User>;
  acknowledgedById?: Maybe<Scalars['ID']['output']>;
  acknowledgedTime?: Maybe<Scalars['DateTime']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  column?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<User>;
  deletedById?: Maybe<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  device?: Maybe<Scalars['String']['output']>;
  field?: Maybe<Scalars['String']['output']>;
  greenhouse?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  measurement?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<Scalars['String']['output']>;
  resolvedBy?: Maybe<User>;
  resolvedById?: Maybe<Scalars['ID']['output']>;
  resolvedTime?: Maybe<Scalars['DateTime']['output']>;
  row?: Maybe<Scalars['String']['output']>;
  ruleKey?: Maybe<Scalars['String']['output']>;
  sensorName: Scalars['String']['output'];
  severity: AlertSeverity;
  status: AlertStatus;
  tenant?: Maybe<Tenant>;
  tenantId: Scalars['ID']['output'];
  timestamp?: Maybe<Scalars['DateTime']['output']>;
  tunnelId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  value: Scalars['String']['output'];
};

/** Alert severity levels */
export enum AlertSeverity {
  Critical = 'CRITICAL'
}

/** Alert status types */
export enum AlertStatus {
  Acknowledged = 'ACKNOWLEDGED',
  Open = 'OPEN',
  Resolved = 'RESOLVED'
}

export type AlertsFilterInput = {
  acknowledgedById?: InputMaybe<Scalars['ID']['input']>;
  /** Filter by any of these user IDs (OR) */
  acknowledgedByIdIn?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Filter alerts from this date (timestamp or createdAt) */
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  /** Filter alerts until this date (timestamp or createdAt) */
  dateTo?: InputMaybe<Scalars['String']['input']>;
  resolvedById?: InputMaybe<Scalars['ID']['input']>;
  /** Filter by any of these user IDs (OR) */
  resolvedByIdIn?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Generic search: sensor name, acknowledged by, resolved by, value */
  search?: InputMaybe<Scalars['String']['input']>;
  severity?: InputMaybe<AlertSeverity>;
  /** Filter by multiple severities (OR) */
  severityIn?: InputMaybe<Array<AlertSeverity>>;
  status?: InputMaybe<AlertStatus>;
  /** Filter by multiple statuses (OR) */
  statusIn?: InputMaybe<Array<AlertStatus>>;
};

export type Batch = {
  __typename?: 'Batch';
  batchNumber?: Maybe<Scalars['String']['output']>;
  crateWeight?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<User>;
  createdById?: Maybe<Scalars['ID']['output']>;
  crop?: Maybe<Crop>;
  cropId: Scalars['ID']['output'];
  cultivationArea: Scalars['Float']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<User>;
  deletedById?: Maybe<Scalars['ID']['output']>;
  endRow?: Maybe<Scalars['Float']['output']>;
  greenhouse?: Maybe<Greenhouse>;
  greenhouseId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  inputMode: InputMode;
  lostPlants: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  numberOfRows: Scalars['Float']['output'];
  plantingDate: Scalars['DateTime']['output'];
  plantsPerMeter: Scalars['Float']['output'];
  replicates: Scalars['Int']['output'];
  rowLength: Scalars['Float']['output'];
  rowSpacing: Scalars['Float']['output'];
  startRow?: Maybe<Scalars['Float']['output']>;
  status: BatchStatus;
  tenant?: Maybe<Tenant>;
  tenantId: Scalars['ID']['output'];
  totalPlants: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  variety?: Maybe<Variety>;
  varietyId?: Maybe<Scalars['ID']['output']>;
};

export type BatchFilterInput = {
  /** Batches planted on or after this date (inclusive, YYYY-MM-DD) */
  plantingDateFrom?: InputMaybe<Scalars['String']['input']>;
  /** Batches planted on or before this date (inclusive, YYYY-MM-DD) */
  plantingDateTo?: InputMaybe<Scalars['String']['input']>;
};

export type BatchSortInput = {
  /** Sort direction (default DESC) */
  direction?: InputMaybe<OrderDirection>;
  /** Field to sort by (default PLANTING_DATE) */
  field?: InputMaybe<HarvestSortField>;
};

/** Batch lifecycle status */
export enum BatchStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Completed = 'COMPLETED'
}

export type BrixReading = {
  __typename?: 'BrixReading';
  class: HarvestQualityClass;
  value: Scalars['Float']['output'];
};

export type BrixReadingInput = {
  class: HarvestQualityClass;
  value: Scalars['Float']['input'];
};

export type BrixTrendData = {
  __typename?: 'BrixTrendData';
  brix: Scalars['Float']['output'];
  date: Scalars['String']['output'];
};

export type CameraLivestreamFeed = {
  __typename?: 'CameraLivestreamFeed';
  available: Scalars['Boolean']['output'];
  error?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  path: Scalars['String']['output'];
  snapshotUrl?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CameraLivestreamStream = {
  __typename?: 'CameraLivestreamStream';
  available: Scalars['Boolean']['output'];
  cameraId: Scalars['String']['output'];
  error?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type ClassDistributionData = {
  __typename?: 'ClassDistributionData';
  classB: Scalars['Float']['output'];
  classC: Scalars['Float']['output'];
  date: Scalars['String']['output'];
  marketable: Scalars['Float']['output'];
  waste: Scalars['Float']['output'];
};

export type CreateAlertInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  column?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  device?: InputMaybe<Scalars['String']['input']>;
  field?: InputMaybe<Scalars['String']['input']>;
  greenhouse?: InputMaybe<Scalars['String']['input']>;
  measurement?: InputMaybe<Scalars['String']['input']>;
  profile?: InputMaybe<Scalars['String']['input']>;
  row?: InputMaybe<Scalars['String']['input']>;
  ruleKey?: InputMaybe<Scalars['String']['input']>;
  sensorName: Scalars['String']['input'];
  severity?: InputMaybe<AlertSeverity>;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
  timestamp?: InputMaybe<Scalars['String']['input']>;
  tunnelId?: InputMaybe<Scalars['ID']['input']>;
  value: Scalars['String']['input'];
};

export type CreateBatchInput = {
  crateWeight?: InputMaybe<Scalars['Float']['input']>;
  cropId: Scalars['ID']['input'];
  cultivationArea?: InputMaybe<Scalars['Float']['input']>;
  endRow?: InputMaybe<Scalars['Float']['input']>;
  greenhouseId?: InputMaybe<Scalars['ID']['input']>;
  inputMode?: InputMaybe<InputMode>;
  lostPlants?: Scalars['Int']['input'];
  /** Defaults to "crop - variety" if omitted */
  name?: InputMaybe<Scalars['String']['input']>;
  numberOfRows?: Scalars['Float']['input'];
  /** Planting date (ISO date string) */
  plantingDate: Scalars['String']['input'];
  plantsPerMeter?: Scalars['Float']['input'];
  replicates?: Scalars['Int']['input'];
  rowLength?: Scalars['Float']['input'];
  rowSpacing?: InputMaybe<Scalars['Float']['input']>;
  startRow?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<BatchStatus>;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
  totalPlants?: InputMaybe<Scalars['Int']['input']>;
  varietyId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateErrorReportInput = {
  attachments?: InputMaybe<Array<Scalars['String']['input']>>;
  browserInfo?: InputMaybe<Scalars['String']['input']>;
  errorDetails: Scalars['String']['input'];
  errorTitle: Scalars['String']['input'];
  expectedVsActual?: InputMaybe<Scalars['String']['input']>;
  reproductionSteps?: InputMaybe<Scalars['String']['input']>;
  severity: ReportSeverity;
  userEmail: Scalars['String']['input'];
};

export type CreateFeatureInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  key: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateGreenhouseInput = {
  bayCount?: InputMaybe<Scalars['Int']['input']>;
  doorPosition?: InputMaybe<DoorPosition>;
  isHorizontal?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  tenantId?: InputMaybe<Scalars['ID']['input']>;
  xDimension?: InputMaybe<Scalars['Float']['input']>;
  yDimension?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateHarvestInput = {
  batchId: Scalars['ID']['input'];
  /** Harvest date (ISO date string) */
  date: Scalars['String']['input'];
  entries?: InputMaybe<Array<HarvestEntryInput>>;
  photoUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateImageUploadInput = {
  /** Signed upload URL validity in seconds (default: 600, max: 3600). */
  expiresIn?: InputMaybe<Scalars['Int']['input']>;
  /** Original filename including extension */
  filename: Scalars['String']['input'];
  /** Logical folder under the tenant, e.g. "harvest" or "avatars". Defaults to "images". */
  folder?: InputMaybe<Scalars['String']['input']>;
  /** Optional tenant override. Only honoured for vGreens admins; for others the tenant is taken from the current user. */
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateSystemErrorInput = {
  action?: InputMaybe<Scalars['String']['input']>;
  component?: InputMaybe<Scalars['String']['input']>;
  errorMessage: Scalars['String']['input'];
  errorType: ErrorType;
  httpMethod?: InputMaybe<Scalars['String']['input']>;
  httpStatusCode?: InputMaybe<Scalars['Float']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  requestPayload?: InputMaybe<Scalars['JSONObject']['input']>;
  requestUrl?: InputMaybe<Scalars['String']['input']>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  severity: ReportSeverity;
  source: ErrorSource;
  stackTrace?: InputMaybe<Scalars['String']['input']>;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
  userAgent?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateTenantInput = {
  companyName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUserInput = {
  clerkUserId?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  tenantId?: InputMaybe<Scalars['String']['input']>;
};

export type Crop = {
  __typename?: 'Crop';
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<User>;
  deletedById?: Maybe<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CumulativeYieldData = {
  __typename?: 'CumulativeYieldData';
  cumulativeClassA: Scalars['Float']['output'];
  cumulativeClassB: Scalars['Float']['output'];
  cumulativeClassC: Scalars['Float']['output'];
  cumulativeWaste: Scalars['Float']['output'];
  date: Scalars['String']['output'];
};

export type DashboardFilterInput = {
  /** Filter by batch name */
  batch?: InputMaybe<Scalars['String']['input']>;
  /** Filter to a single batch and all its harvests */
  batchId?: InputMaybe<Scalars['ID']['input']>;
  /** Start date for dashboard data (ISO date string) */
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  /** End date for dashboard data (ISO date string) */
  dateTo?: InputMaybe<Scalars['String']['input']>;
  /** Filter by greenhouse */
  greenhouseId?: InputMaybe<Scalars['ID']['input']>;
  /** Filter by species (batch) */
  species?: InputMaybe<Scalars['String']['input']>;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
  /** Filter by variety (batch) */
  variety?: InputMaybe<Scalars['String']['input']>;
};

export type DeleteImageInput = {
  /** Full storage path of the image relative to the bucket (including tenant prefix). */
  path: Scalars['String']['input'];
};

/** Door position types */
export enum DoorPosition {
  BottomCenter = 'BOTTOM_CENTER',
  BottomLeft = 'BOTTOM_LEFT',
  BottomRight = 'BOTTOM_RIGHT',
  LeftBottom = 'LEFT_BOTTOM',
  LeftCenter = 'LEFT_CENTER',
  LeftTop = 'LEFT_TOP',
  RightBottom = 'RIGHT_BOTTOM',
  RightCenter = 'RIGHT_CENTER',
  RightTop = 'RIGHT_TOP',
  TopCenter = 'TOP_CENTER',
  TopLeft = 'TOP_LEFT',
  TopRight = 'TOP_RIGHT'
}

export type ErrorReport = {
  __typename?: 'ErrorReport';
  adminNotes?: Maybe<Scalars['String']['output']>;
  attachments?: Maybe<Array<Scalars['String']['output']>>;
  browserInfo?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  errorDetails: Scalars['String']['output'];
  errorTitle: Scalars['String']['output'];
  expectedVsActual?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isResolved?: Maybe<Scalars['Boolean']['output']>;
  reproductionSteps?: Maybe<Scalars['String']['output']>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  resolvedBy?: Maybe<Scalars['String']['output']>;
  resolvedByUser?: Maybe<User>;
  severity: ReportSeverity;
  status: ReportStatus;
  tenant?: Maybe<Tenant>;
  tenantId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userEmail: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type ErrorReportsFilterInput = {
  createdAfter?: InputMaybe<Scalars['String']['input']>;
  createdBefore?: InputMaybe<Scalars['String']['input']>;
  isResolved?: InputMaybe<Scalars['Boolean']['input']>;
  orderDirection?: InputMaybe<OrderDirection>;
  severity?: InputMaybe<ReportSeverity>;
  status?: InputMaybe<ReportStatus>;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

/** Source of the error - where it originated */
export enum ErrorSource {
  Backend = 'BACKEND',
  Database = 'DATABASE',
  ExternalApi = 'EXTERNAL_API',
  Frontend = 'FRONTEND',
  Infrastructure = 'INFRASTRUCTURE'
}

/** Type/category of the error */
export enum ErrorType {
  ApiError = 'API_ERROR',
  AuthenticationError = 'AUTHENTICATION_ERROR',
  AuthorizationError = 'AUTHORIZATION_ERROR',
  BusinessLogicError = 'BUSINESS_LOGIC_ERROR',
  ConfigurationError = 'CONFIGURATION_ERROR',
  DatabaseError = 'DATABASE_ERROR',
  ExternalServiceError = 'EXTERNAL_SERVICE_ERROR',
  MemoryError = 'MEMORY_ERROR',
  NetworkError = 'NETWORK_ERROR',
  RuntimeError = 'RUNTIME_ERROR',
  SyntaxError = 'SYNTAX_ERROR',
  TimeoutError = 'TIMEOUT_ERROR',
  UnknownError = 'UNKNOWN_ERROR',
  ValidationError = 'VALIDATION_ERROR'
}

export type Feature = {
  __typename?: 'Feature';
  category?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  tenantFeatures?: Maybe<Array<TenantFeature>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type FeatureWithTenantStatus = {
  __typename?: 'FeatureWithTenantStatus';
  category?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  enabledForTenant?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type FieldMeanMetric = {
  __typename?: 'FieldMeanMetric';
  chamber?: Maybe<Scalars['String']['output']>;
  field: Scalars['String']['output'];
  greenhouse?: Maybe<Scalars['String']['output']>;
  rawValue?: Maybe<Scalars['Float']['output']>;
  time: Scalars['DateTime']['output'];
  value: Scalars['Float']['output'];
};

export type FruitWeightTrendData = {
  __typename?: 'FruitWeightTrendData';
  date: Scalars['String']['output'];
  weight: Scalars['Float']['output'];
};

export type GetBucketDataInput = {
  bucketName: Scalars['String']['input'];
  device?: InputMaybe<Scalars['String']['input']>;
  field?: InputMaybe<Scalars['String']['input']>;
  greenhouse?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['String']['input']>;
  stop?: InputMaybe<Scalars['String']['input']>;
  useLastPerSeries?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GetFieldMeansInput = {
  bucketName: Scalars['String']['input'];
  greenhouse?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['String']['input']>;
  stop?: InputMaybe<Scalars['String']['input']>;
  windowMinutes?: Scalars['Int']['input'];
};

export type GetSignedImageUrlInput = {
  /** Signed URL validity in seconds (default: 600, max: 3600). */
  expiresIn?: InputMaybe<Scalars['Int']['input']>;
  /** Full storage path of the image relative to the bucket (including tenant prefix). */
  path: Scalars['String']['input'];
};

export type GetTenantParDliInput = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type Greenhouse = {
  __typename?: 'Greenhouse';
  bayCount?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<User>;
  deletedById?: Maybe<Scalars['ID']['output']>;
  doorPosition?: Maybe<DoorPosition>;
  id: Scalars['ID']['output'];
  isHorizontal?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  tenant?: Maybe<Tenant>;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  xDimension?: Maybe<Scalars['Float']['output']>;
  yDimension?: Maybe<Scalars['Float']['output']>;
};

export type GreenhouseCrop = {
  __typename?: 'GreenhouseCrop';
  createdAt: Scalars['DateTime']['output'];
  crop?: Maybe<Crop>;
  cropId: Scalars['ID']['output'];
  greenhouse?: Maybe<Greenhouse>;
  greenhouseId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type GreenhouseParDli = {
  __typename?: 'GreenhouseParDli';
  data: ParDliResult;
  name: Scalars['String']['output'];
};

export type Harvest = {
  __typename?: 'Harvest';
  batch?: Maybe<Batch>;
  batchId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<User>;
  createdById?: Maybe<Scalars['ID']['output']>;
  date: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<User>;
  deletedById?: Maybe<Scalars['ID']['output']>;
  entries: Array<HarvestEntry>;
  id: Scalars['ID']['output'];
  photoUrls: Array<Scalars['String']['output']>;
  tenant?: Maybe<Tenant>;
  tenantId: Scalars['ID']['output'];
  totals: HarvestTotals;
  updatedAt: Scalars['DateTime']['output'];
};

export type HarvestBatchListItem = {
  __typename?: 'HarvestBatchListItem';
  greenhouse?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  plantingDate: Scalars['DateTime']['output'];
  species?: Maybe<Scalars['String']['output']>;
  status: BatchStatus;
  variety?: Maybe<Scalars['String']['output']>;
  /** kg per plant for this batch: Σ(totalFruitWeight across the batch entries) / totalPlants. Null when totalPlants is 0 or missing. */
  yieldPerPlant?: Maybe<Scalars['Float']['output']>;
};

export type HarvestDashboardMetrics = {
  __typename?: 'HarvestDashboardMetrics';
  averageBrix: Scalars['Float']['output'];
  averageFruitWeight: Scalars['Float']['output'];
  brixTrend: Array<BrixTrendData>;
  classBTotal: Scalars['Float']['output'];
  classCTotal: Scalars['Float']['output'];
  classDistribution: Array<ClassDistributionData>;
  criticalAlerts: Scalars['Int']['output'];
  cumulativeYield: Array<CumulativeYieldData>;
  daysActive: Scalars['Int']['output'];
  fruitWeightTrend: Array<FruitWeightTrendData>;
  harvestCount: Scalars['Int']['output'];
  marketablePercent: Scalars['Float']['output'];
  species: Scalars['String']['output'];
  totalYield: Scalars['Float']['output'];
  variety: Scalars['String']['output'];
  wastePercent: Scalars['Float']['output'];
  wasteTotal: Scalars['Float']['output'];
  yieldOverTime: Array<YieldOverTimeData>;
  /** Weighted kg per row metre across selected batches: Σ(classA+classB+classC) / Σ rowLength. Null when no batch in scope has rowLength > 0. */
  yieldPerMeter?: Maybe<Scalars['Float']['output']>;
  yieldPerMeterTrend: Array<YieldPerMeterData>;
  /** Weighted kg per plant across selected batches: Σ(classA+classB+classC) / Σ totalPlants. Null when no batch in scope has totalPlants > 0. */
  yieldPerPlant?: Maybe<Scalars['Float']['output']>;
};

/** Relative plantingDate range presets for the harvest list */
export enum HarvestDateRangePreset {
  All = 'ALL',
  LastMonth = 'LAST_MONTH',
  ThisMonth = 'THIS_MONTH',
  ThisWeek = 'THIS_WEEK',
  ThisYear = 'THIS_YEAR',
  Today = 'TODAY'
}

export type HarvestEntry = {
  __typename?: 'HarvestEntry';
  avgBrix: Scalars['Float']['output'];
  avgFruitWeight: Scalars['Float']['output'];
  brixReadings: Array<BrixReading>;
  classA: Scalars['Float']['output'];
  classB: Scalars['Float']['output'];
  classC: Scalars['Float']['output'];
  crateCounts?: Maybe<Array<Scalars['Int']['output']>>;
  createdAt: Scalars['DateTime']['output'];
  fruitCount: Scalars['Int']['output'];
  harvestId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  remainingKgs?: Maybe<Array<Scalars['Float']['output']>>;
  rowX: Scalars['Float']['output'];
  rowY: Scalars['Float']['output'];
  totalFruitWeight: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  waste: Scalars['Float']['output'];
};

export type HarvestEntryInput = {
  brixReadings?: InputMaybe<Array<BrixReadingInput>>;
  classA?: Scalars['Float']['input'];
  classB?: Scalars['Float']['input'];
  classC?: Scalars['Float']['input'];
  crateCounts?: InputMaybe<Array<Scalars['Int']['input']>>;
  fruitCount?: Scalars['Int']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  remainingKgs?: InputMaybe<Array<Scalars['Float']['input']>>;
  rowX?: Scalars['Float']['input'];
  rowY?: Scalars['Float']['input'];
  totalFruitWeight?: Scalars['Float']['input'];
  waste?: Scalars['Float']['input'];
};

export type HarvestFilterInput = {
  /** Filter by batch */
  batchId?: InputMaybe<Scalars['ID']['input']>;
  /** Filter by user who created */
  createdById?: InputMaybe<Scalars['ID']['input']>;
  /** Harvests from this date (inclusive) */
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  /** Harvests until this date (inclusive) */
  dateTo?: InputMaybe<Scalars['String']['input']>;
  /** Filter by greenhouse */
  greenhouseId?: InputMaybe<Scalars['ID']['input']>;
  /** Search in batch name / species / variety */
  search?: InputMaybe<Scalars['String']['input']>;
  /** Filter by the parent batch status */
  status?: InputMaybe<BatchStatus>;
  /** Filter by tenant (VGreens admin only) */
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};

/** Saleable crop grade a Brix reading belongs to (A, B or C) */
export enum HarvestQualityClass {
  A = 'A',
  B = 'B',
  C = 'C'
}

/** Sortable fields for the batch-grouped harvest list */
export enum HarvestSortField {
  Crop = 'CROP',
  Greenhouse = 'GREENHOUSE',
  PlantingDate = 'PLANTING_DATE'
}

export type HarvestTotals = {
  __typename?: 'HarvestTotals';
  /** Unweighted MEAN of per-entry avgBrix. Null when there are no entries. */
  avgBrix?: Maybe<Scalars['Float']['output']>;
  /** Unweighted MEAN of per-entry avgFruitWeight. Null when there are no entries. */
  avgFruitWeight?: Maybe<Scalars['Float']['output']>;
  /** SUM of entries.classA */
  classA: Scalars['Float']['output'];
  /** SUM of entries.classB */
  classB: Scalars['Float']['output'];
  /** SUM of entries.classC */
  classC: Scalars['Float']['output'];
  /** Per-quality SUM of crate counts, indexed 0=A,1=B,2=C. Null when the batch is not in crate mode. */
  crateCounts?: Maybe<Array<Scalars['Int']['output']>>;
  /** SUM of entries.fruitCount */
  fruitCount: Scalars['Int']['output'];
  /** SUM of entries.totalFruitWeight */
  totalFruitWeight: Scalars['Float']['output'];
  /** SUM of entries.waste */
  waste: Scalars['Float']['output'];
  /** totalFruitWeight / batch.rowLength. Null when rowLength is 0/missing. */
  yieldPerMeter?: Maybe<Scalars['Float']['output']>;
  /** totalFruitWeight / batch.totalPlants. Null when totalPlants is 0/missing. */
  yieldPerPlant?: Maybe<Scalars['Float']['output']>;
};

export type HarvestViewSettings = {
  __typename?: 'HarvestViewSettings';
  collapsedBatchIds?: Maybe<Array<Scalars['String']['output']>>;
  range?: Maybe<HarvestDateRangePreset>;
  sort?: Maybe<HarvestViewSort>;
};

export type HarvestViewSettingsInput = {
  collapsedBatchIds?: InputMaybe<Array<Scalars['String']['input']>>;
  range?: InputMaybe<HarvestDateRangePreset>;
  sort?: InputMaybe<HarvestViewSortInput>;
};

export type HarvestViewSort = {
  __typename?: 'HarvestViewSort';
  direction: OrderDirection;
  field: HarvestSortField;
};

export type HarvestViewSortInput = {
  direction: OrderDirection;
  field: HarvestSortField;
};

export type ImageFile = {
  __typename?: 'ImageFile';
  /** Bucket in which the image is stored. */
  bucket: Scalars['String']['output'];
  /** Timestamp when the image was created in storage. */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** Filename of the image. */
  filename: Scalars['String']['output'];
  /** MIME type as reported by Supabase. */
  mimeType?: Maybe<Scalars['String']['output']>;
  /** Full storage path of the image relative to the bucket (including tenant prefix). */
  path: Scalars['String']['output'];
  /** Size of the image in bytes. */
  size?: Maybe<Scalars['Float']['output']>;
  /** Timestamp when the image was last updated. */
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Time-limited URL that can be used to view the image. Only populated when returned from listImages. */
  url?: Maybe<Scalars['String']['output']>;
};

export type InfluxDbData = {
  __typename?: 'InfluxDBData';
  data: Scalars['JSONObject']['output'];
};

/** Harvest yield input mode for a batch: weight or crate */
export enum InputMode {
  Crate = 'CRATE',
  Weight = 'WEIGHT'
}

export type ListImagesInput = {
  /** Folder under the tenant prefix to list, e.g. "harvest". Defaults to listing all images for the tenant. */
  folder?: InputMaybe<Scalars['String']['input']>;
  /** Maximum number of results to return (default: 50, max: 200). */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Number of items to skip (offset-based pagination). */
  offset?: InputMaybe<Scalars['Int']['input']>;
  /** Optional tenant override. Only honoured for vGreens admins; for others the tenant is taken from the current user. */
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  acknowledgeAlert: Alert;
  assignCropToGreenhouse: GreenhouseCrop;
  createAlert: Alert;
  createBatch: Batch;
  createErrorReport: ErrorReport;
  createFeature: Feature;
  createGreenhouse: Greenhouse;
  createHarvest: Harvest;
  /** Create a signed URL that allows the client to upload an image directly to Supabase Storage. */
  createImageUploadUrl: SignedUrl;
  createTenant: Tenant;
  createUser: User;
  deleteAlert: Scalars['Boolean']['output'];
  deleteBatch: Scalars['Boolean']['output'];
  deleteErrorReport: Scalars['Boolean']['output'];
  deleteFeature: Scalars['Boolean']['output'];
  deleteGreenhouse: Scalars['Boolean']['output'];
  deleteHarvest: Scalars['Boolean']['output'];
  /** Delete an image from Supabase Storage. Non-admins can only delete their tenant images. */
  deleteImage: Scalars['Boolean']['output'];
  deleteSensorConfig: Scalars['Boolean']['output'];
  deleteTenant: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  logSystemError: SystemError;
  resolveAlert: Alert;
  resolveErrorReport: ErrorReport;
  resolveSystemError: SystemError;
  runThresholdCheck: Scalars['Boolean']['output'];
  setMyFarmOverviewTimeRange: User;
  setMyLanguage: User;
  setTenantDisabledSensorFields: Tenant;
  setTenantHarvestDashboardItems: Tenant;
  softDeleteAlert: Scalars['Boolean']['output'];
  toggleTenantFeature: TenantFeature;
  unassignCropFromGreenhouse: Scalars['Boolean']['output'];
  updateAlert: Alert;
  updateBatch: Batch;
  updateErrorReport: ErrorReport;
  updateErrorReportStatus: ErrorReport;
  updateFeature: Feature;
  updateGreenhouse: Greenhouse;
  updateHarvest: Harvest;
  updateMyHarvestViewSettings: User;
  updateTenant: Tenant;
  updateUser: User;
  /** Upload an image file directly via GraphQL and store it in Supabase Storage. */
  uploadImage: ImageFile;
  upsertFarmConfig: TenantFarmConfig;
  upsertSensorConfig: SensorConfig;
};


export type MutationAcknowledgeAlertArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAssignCropToGreenhouseArgs = {
  cropId: Scalars['ID']['input'];
  greenhouseId: Scalars['ID']['input'];
};


export type MutationCreateAlertArgs = {
  input: CreateAlertInput;
};


export type MutationCreateBatchArgs = {
  input: CreateBatchInput;
};


export type MutationCreateErrorReportArgs = {
  input: CreateErrorReportInput;
};


export type MutationCreateFeatureArgs = {
  input: CreateFeatureInput;
};


export type MutationCreateGreenhouseArgs = {
  input: CreateGreenhouseInput;
};


export type MutationCreateHarvestArgs = {
  input: CreateHarvestInput;
};


export type MutationCreateImageUploadUrlArgs = {
  input: CreateImageUploadInput;
};


export type MutationCreateTenantArgs = {
  input: CreateTenantInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteAlertArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBatchArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteErrorReportArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteFeatureArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGreenhouseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteHarvestArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteImageArgs = {
  input: DeleteImageInput;
};


export type MutationDeleteSensorConfigArgs = {
  id: Scalars['ID']['input'];
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationDeleteTenantArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLogSystemErrorArgs = {
  input: CreateSystemErrorInput;
};


export type MutationResolveAlertArgs = {
  id: Scalars['ID']['input'];
};


export type MutationResolveErrorReportArgs = {
  adminNotes?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationResolveSystemErrorArgs = {
  errorId: Scalars['ID']['input'];
  resolutionNotes?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRunThresholdCheckArgs = {
  bucketName: Scalars['String']['input'];
  tenantId: Scalars['ID']['input'];
};


export type MutationSetMyFarmOverviewTimeRangeArgs = {
  value: Scalars['String']['input'];
};


export type MutationSetMyLanguageArgs = {
  language: Scalars['String']['input'];
};


export type MutationSetTenantDisabledSensorFieldsArgs = {
  fields: Array<Scalars['String']['input']>;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationSetTenantHarvestDashboardItemsArgs = {
  hiddenItems: Array<Scalars['String']['input']>;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationSoftDeleteAlertArgs = {
  id: Scalars['ID']['input'];
};


export type MutationToggleTenantFeatureArgs = {
  input: ToggleTenantFeatureInput;
};


export type MutationUnassignCropFromGreenhouseArgs = {
  cropId: Scalars['ID']['input'];
  greenhouseId: Scalars['ID']['input'];
};


export type MutationUpdateAlertArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAlertInput;
};


export type MutationUpdateBatchArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBatchInput;
};


export type MutationUpdateErrorReportArgs = {
  id: Scalars['ID']['input'];
  input: UpdateErrorReportInput;
};


export type MutationUpdateErrorReportStatusArgs = {
  id: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};


export type MutationUpdateFeatureArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFeatureInput;
};


export type MutationUpdateGreenhouseArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGreenhouseInput;
};


export type MutationUpdateHarvestArgs = {
  id: Scalars['ID']['input'];
  input: UpdateHarvestInput;
};


export type MutationUpdateMyHarvestViewSettingsArgs = {
  input: HarvestViewSettingsInput;
};


export type MutationUpdateTenantArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTenantInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};


export type MutationUploadImageArgs = {
  input: UploadImageInput;
};


export type MutationUpsertFarmConfigArgs = {
  input: UpsertFarmConfigInput;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationUpsertSensorConfigArgs = {
  input: UpsertSensorConfigInput;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type ParDliBandPoint = {
  __typename?: 'ParDliBandPoint';
  dli?: Maybe<Scalars['Float']['output']>;
  hour: Scalars['Int']['output'];
};

export type ParDliPoint = {
  __typename?: 'ParDliPoint';
  dli: Scalars['Float']['output'];
  time: Scalars['DateTime']['output'];
};

export type ParDliResult = {
  __typename?: 'ParDliResult';
  currentDLI?: Maybe<Scalars['Float']['output']>;
  currentPPFD?: Maybe<Scalars['Float']['output']>;
  lowerEdge: Array<ParDliBandPoint>;
  todaysGraphData: Array<ParDliPoint>;
  upperEdge: Array<ParDliBandPoint>;
};

export type Query = {
  __typename?: 'Query';
  alert?: Maybe<Alert>;
  alerts: Array<Alert>;
  batch?: Maybe<Batch>;
  batches: Array<Batch>;
  cameraLivestreamFeeds: Array<CameraLivestreamFeed>;
  cameraLivestreamStreamUrl: CameraLivestreamStream;
  crops: Array<Crop>;
  errorReport?: Maybe<ErrorReport>;
  errorReports: Array<ErrorReport>;
  farmConfig?: Maybe<TenantFarmConfig>;
  feature?: Maybe<Feature>;
  features: Array<Feature>;
  featuresWithTenantStatus: Array<FeatureWithTenantStatus>;
  getBucketData: Array<InfluxDbData>;
  getBucketFieldMeansLastMinutes: Array<FieldMeanMetric>;
  getBucketFields: Array<Scalars['String']['output']>;
  getBuckets: Array<Scalars['String']['output']>;
  getParDliForTenant: TenantParDli;
  getRecentSystemErrors: Array<SystemError>;
  getSystemErrorStats: Scalars['String']['output'];
  greenhouse?: Maybe<Greenhouse>;
  greenhouseOptions: Array<Scalars['String']['output']>;
  greenhouses: Array<Greenhouse>;
  harvest?: Maybe<Harvest>;
  harvestBatches: Array<HarvestBatchListItem>;
  harvestDashboard: HarvestDashboardMetrics;
  harvests: Array<Harvest>;
  harvestsCsvExport: Scalars['String']['output'];
  health: Scalars['String']['output'];
  /** List images stored for the current tenant (or a specific tenant for admins). */
  images: Array<ImageFile>;
  me?: Maybe<User>;
  sensorConfigs: Array<SensorConfig>;
  sensorDevices: Array<Scalars['String']['output']>;
  /** Create a time-limited signed URL for viewing or downloading a private image. */
  signedImageUrl: SignedUrl;
  tenant?: Maybe<Tenant>;
  tenantFeatures: Array<TenantFeature>;
  tenantGreenhouses: Array<Scalars['String']['output']>;
  tenants: Array<Tenant>;
  testInfluxDBConnection: Scalars['String']['output'];
  unresolvedErrorReportsCount: Scalars['Int']['output'];
  user?: Maybe<User>;
  users: Array<User>;
  varieties: Array<Variety>;
};


export type QueryAlertArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAlertsArgs = {
  filter?: InputMaybe<AlertsFilterInput>;
};


export type QueryBatchArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBatchesArgs = {
  filter?: InputMaybe<BatchFilterInput>;
  sort?: InputMaybe<BatchSortInput>;
};


export type QueryCameraLivestreamStreamUrlArgs = {
  cameraId: Scalars['String']['input'];
};


export type QueryCropsArgs = {
  greenhouseId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryErrorReportArgs = {
  id: Scalars['ID']['input'];
};


export type QueryErrorReportsArgs = {
  filter?: InputMaybe<ErrorReportsFilterInput>;
};


export type QueryFarmConfigArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryFeatureArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFeaturesWithTenantStatusArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGetBucketDataArgs = {
  input: GetBucketDataInput;
};


export type QueryGetBucketFieldMeansLastMinutesArgs = {
  input: GetFieldMeansInput;
};


export type QueryGetBucketFieldsArgs = {
  bucketName: Scalars['String']['input'];
  start?: InputMaybe<Scalars['String']['input']>;
  stop?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetParDliForTenantArgs = {
  input: GetTenantParDliInput;
};


export type QueryGetRecentSystemErrorsArgs = {
  isResolved?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  severity?: InputMaybe<ReportSeverity>;
  source?: InputMaybe<ErrorSource>;
};


export type QueryGetSystemErrorStatsArgs = {
  hours?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryGreenhouseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGreenhouseOptionsArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGreenhousesArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryHarvestArgs = {
  id: Scalars['ID']['input'];
};


export type QueryHarvestDashboardArgs = {
  filter?: InputMaybe<DashboardFilterInput>;
};


export type QueryHarvestsArgs = {
  filter?: InputMaybe<HarvestFilterInput>;
};


export type QueryHarvestsCsvExportArgs = {
  columns?: InputMaybe<Array<Scalars['String']['input']>>;
  filter?: InputMaybe<HarvestFilterInput>;
};


export type QueryImagesArgs = {
  input?: InputMaybe<ListImagesInput>;
};


export type QuerySensorConfigsArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerySensorDevicesArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerySignedImageUrlArgs = {
  input: GetSignedImageUrlInput;
};


export type QueryTenantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTenantFeaturesArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryTenantGreenhousesArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVarietiesArgs = {
  cropId: Scalars['ID']['input'];
};

/** Error report severity levels */
export enum ReportSeverity {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM',
  Urgent = 'URGENT'
}

/** Error report status levels */
export enum ReportStatus {
  InProgress = 'IN_PROGRESS',
  Open = 'OPEN',
  Resolved = 'RESOLVED'
}

export type SensorConfig = {
  __typename?: 'SensorConfig';
  city?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  device: Scalars['String']['output'];
  greenhouse?: Maybe<Scalars['String']['output']>;
  greenhouseId?: Maybe<Scalars['ID']['output']>;
  hiddenInFarmOverview?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  tenant?: Maybe<Tenant>;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  xPosition?: Maybe<Scalars['Float']['output']>;
  yPosition?: Maybe<Scalars['Float']['output']>;
};

export type SignedUrl = {
  __typename?: 'SignedUrl';
  /** Timestamp at which the signed URL expires. */
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  /** Full storage path of the image relative to the bucket (including tenant prefix). */
  path: Scalars['String']['output'];
  /** Time-limited URL that can be used to upload or download the image. */
  url: Scalars['String']['output'];
};

export type SystemError = {
  __typename?: 'SystemError';
  action?: Maybe<Scalars['String']['output']>;
  component?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  errorHash?: Maybe<Scalars['String']['output']>;
  errorMessage: Scalars['String']['output'];
  errorType: ErrorType;
  httpMethod?: Maybe<Scalars['String']['output']>;
  httpStatusCode?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  isNotified?: Maybe<Scalars['Boolean']['output']>;
  isResolved: Scalars['Boolean']['output'];
  lastOccurredAt?: Maybe<Scalars['DateTime']['output']>;
  metadata?: Maybe<Scalars['JSONObject']['output']>;
  occurrenceCount?: Maybe<Scalars['Float']['output']>;
  requestPayload?: Maybe<Scalars['JSONObject']['output']>;
  requestUrl?: Maybe<Scalars['String']['output']>;
  resolutionNotes?: Maybe<Scalars['String']['output']>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  resolvedBy?: Maybe<Scalars['String']['output']>;
  resolver?: Maybe<User>;
  sessionId?: Maybe<Scalars['String']['output']>;
  severity: ReportSeverity;
  source: ErrorSource;
  stackTrace?: Maybe<Scalars['String']['output']>;
  tenant?: Maybe<Tenant>;
  tenantId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userAgent?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type Tenant = {
  __typename?: 'Tenant';
  companyName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  disabledSensorFields: Array<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  greenhouses?: Maybe<Array<TenantGreenhouse>>;
  hiddenHarvestDashboardItems: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  influxBucketName?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  tenantFeatures?: Maybe<Array<TenantFeature>>;
  tenantId?: Maybe<Scalars['ID']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  users?: Maybe<Array<User>>;
};

export type TenantFarmConfig = {
  __typename?: 'TenantFarmConfig';
  bayCount: Scalars['Int']['output'];
  chambersCount: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  polesMax: Scalars['Int']['output'];
  tenant?: Maybe<Tenant>;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TenantFeature = {
  __typename?: 'TenantFeature';
  createdAt: Scalars['DateTime']['output'];
  enabled: Scalars['Boolean']['output'];
  feature?: Maybe<Feature>;
  featureId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TenantGreenhouse = {
  __typename?: 'TenantGreenhouse';
  bayCount?: Maybe<Scalars['Int']['output']>;
  doorPosition?: Maybe<DoorPosition>;
  isHorizontal?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  xDimension: Scalars['Float']['output'];
  yDimension: Scalars['Float']['output'];
};

export type TenantParDli = {
  __typename?: 'TenantParDli';
  combined: ParDliResult;
  greenhouses: Array<GreenhouseParDli>;
};

export type ToggleTenantFeatureInput = {
  enabled: Scalars['Boolean']['input'];
  featureId: Scalars['ID']['input'];
  tenantId: Scalars['ID']['input'];
};

export type UpdateAlertInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  column?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  device?: InputMaybe<Scalars['String']['input']>;
  field?: InputMaybe<Scalars['String']['input']>;
  greenhouse?: InputMaybe<Scalars['String']['input']>;
  measurement?: InputMaybe<Scalars['String']['input']>;
  profile?: InputMaybe<Scalars['String']['input']>;
  row?: InputMaybe<Scalars['String']['input']>;
  sensorName?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<AlertStatus>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBatchInput = {
  crateWeight?: InputMaybe<Scalars['Float']['input']>;
  cropId?: InputMaybe<Scalars['ID']['input']>;
  cultivationArea?: InputMaybe<Scalars['Float']['input']>;
  endRow?: InputMaybe<Scalars['Float']['input']>;
  greenhouseId?: InputMaybe<Scalars['ID']['input']>;
  inputMode?: InputMaybe<InputMode>;
  lostPlants?: InputMaybe<Scalars['Int']['input']>;
  /** Defaults to "crop - variety" if omitted */
  name?: InputMaybe<Scalars['String']['input']>;
  numberOfRows?: InputMaybe<Scalars['Float']['input']>;
  /** Planting date (ISO date string) */
  plantingDate?: InputMaybe<Scalars['String']['input']>;
  plantsPerMeter?: InputMaybe<Scalars['Float']['input']>;
  replicates?: InputMaybe<Scalars['Int']['input']>;
  rowLength?: InputMaybe<Scalars['Float']['input']>;
  rowSpacing?: InputMaybe<Scalars['Float']['input']>;
  startRow?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<BatchStatus>;
  totalPlants?: InputMaybe<Scalars['Int']['input']>;
  varietyId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateErrorReportInput = {
  adminNotes?: InputMaybe<Scalars['String']['input']>;
  browserInfo?: InputMaybe<Scalars['String']['input']>;
  errorDetails?: InputMaybe<Scalars['String']['input']>;
  errorTitle?: InputMaybe<Scalars['String']['input']>;
  expectedVsActual?: InputMaybe<Scalars['String']['input']>;
  isResolved?: InputMaybe<Scalars['Boolean']['input']>;
  reproductionSteps?: InputMaybe<Scalars['String']['input']>;
  severity?: InputMaybe<ReportSeverity>;
  status?: InputMaybe<ReportStatus>;
};

export type UpdateFeatureInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGreenhouseInput = {
  bayCount?: InputMaybe<Scalars['Int']['input']>;
  doorPosition?: InputMaybe<DoorPosition>;
  isHorizontal?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  xDimension?: InputMaybe<Scalars['Float']['input']>;
  yDimension?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateHarvestInput = {
  batchId?: InputMaybe<Scalars['ID']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  entries?: InputMaybe<Array<HarvestEntryInput>>;
  photoUrls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateTenantInput = {
  companyName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  clerkUserId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  tenantId?: InputMaybe<Scalars['String']['input']>;
};

export type UploadImageInput = {
  /** Image file to upload. */
  file: Scalars['Upload']['input'];
  /** Logical folder, e.g. "harvest" or "avatars". */
  folder?: InputMaybe<Scalars['String']['input']>;
  /** Optional tenant override. Only honoured for vGreens admins; for others the tenant is taken from the current user. */
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpsertFarmConfigInput = {
  bayCount?: InputMaybe<Scalars['Int']['input']>;
  chambersCount?: InputMaybe<Scalars['Int']['input']>;
  polesMax?: InputMaybe<Scalars['Int']['input']>;
};

export type UpsertSensorConfigInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  device: Scalars['String']['input'];
  greenhouseId?: InputMaybe<Scalars['ID']['input']>;
  hiddenInFarmOverview?: InputMaybe<Scalars['Boolean']['input']>;
  xPosition?: InputMaybe<Scalars['Float']['input']>;
  yPosition?: InputMaybe<Scalars['Float']['input']>;
};

export type User = {
  __typename?: 'User';
  clerkUserId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  farmOverviewTimeRange?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  preferredLanguage?: Maybe<Scalars['String']['output']>;
  role: UserRole;
  status?: Maybe<UserStatus>;
  tenant?: Maybe<Tenant>;
  tenantId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userSettings?: Maybe<UserSettings>;
};

/** User role types */
export enum UserRole {
  TenantAdmin = 'TENANT_ADMIN',
  TenantUser = 'TENANT_USER',
  VgreensAdmin = 'VGREENS_ADMIN'
}

export type UserSettings = {
  __typename?: 'UserSettings';
  harvestView?: Maybe<HarvestViewSettings>;
};

/** User invitation and activation status */
export enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

export type Variety = {
  __typename?: 'Variety';
  createdAt: Scalars['DateTime']['output'];
  crop?: Maybe<Crop>;
  cropId: Scalars['ID']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<User>;
  deletedById?: Maybe<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type YieldOverTimeData = {
  __typename?: 'YieldOverTimeData';
  date: Scalars['String']['output'];
  yield: Scalars['Float']['output'];
};

export type YieldPerMeterData = {
  __typename?: 'YieldPerMeterData';
  date: Scalars['String']['output'];
  yieldPerMeter: Scalars['Float']['output'];
};

export type ErrorReportFragmentFragment = { __typename?: 'ErrorReport', id: string, userEmail: string, errorTitle: string, errorDetails: string, severity: ReportSeverity, status: ReportStatus, reproductionSteps?: string | null, expectedVsActual?: string | null, browserInfo?: string | null, attachments?: Array<string> | null, adminNotes?: string | null, isResolved?: boolean | null, resolvedAt?: any | null, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null }, tenant?: { __typename?: 'Tenant', id: string, name: string } | null, resolvedByUser?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null };

export type CreateErrorReportMutationVariables = Exact<{
  input: CreateErrorReportInput;
}>;


export type CreateErrorReportMutation = { __typename?: 'Mutation', createErrorReport: { __typename?: 'ErrorReport', id: string, userEmail: string, errorTitle: string, errorDetails: string, severity: ReportSeverity, status: ReportStatus, reproductionSteps?: string | null, expectedVsActual?: string | null, browserInfo?: string | null, attachments?: Array<string> | null, adminNotes?: string | null, isResolved?: boolean | null, resolvedAt?: any | null, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null }, tenant?: { __typename?: 'Tenant', id: string, name: string } | null, resolvedByUser?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null } };

export type UpdateErrorReportMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateErrorReportInput;
}>;


export type UpdateErrorReportMutation = { __typename?: 'Mutation', updateErrorReport: { __typename?: 'ErrorReport', id: string, userEmail: string, errorTitle: string, errorDetails: string, severity: ReportSeverity, status: ReportStatus, reproductionSteps?: string | null, expectedVsActual?: string | null, browserInfo?: string | null, attachments?: Array<string> | null, adminNotes?: string | null, isResolved?: boolean | null, resolvedAt?: any | null, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null }, tenant?: { __typename?: 'Tenant', id: string, name: string } | null, resolvedByUser?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null } };

export type UpdateErrorReportStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: Scalars['String']['input'];
}>;


export type UpdateErrorReportStatusMutation = { __typename?: 'Mutation', updateErrorReportStatus: { __typename?: 'ErrorReport', id: string, userEmail: string, errorTitle: string, errorDetails: string, severity: ReportSeverity, status: ReportStatus, reproductionSteps?: string | null, expectedVsActual?: string | null, browserInfo?: string | null, attachments?: Array<string> | null, adminNotes?: string | null, isResolved?: boolean | null, resolvedAt?: any | null, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null }, tenant?: { __typename?: 'Tenant', id: string, name: string } | null, resolvedByUser?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null } };

export type ResolveErrorReportMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  adminNotes?: InputMaybe<Scalars['String']['input']>;
}>;


export type ResolveErrorReportMutation = { __typename?: 'Mutation', resolveErrorReport: { __typename?: 'ErrorReport', id: string, userEmail: string, errorTitle: string, errorDetails: string, severity: ReportSeverity, status: ReportStatus, reproductionSteps?: string | null, expectedVsActual?: string | null, browserInfo?: string | null, attachments?: Array<string> | null, adminNotes?: string | null, isResolved?: boolean | null, resolvedAt?: any | null, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null }, tenant?: { __typename?: 'Tenant', id: string, name: string } | null, resolvedByUser?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null } };

export type DeleteErrorReportMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteErrorReportMutation = { __typename?: 'Mutation', deleteErrorReport: boolean };

export type GetErrorReportsQueryVariables = Exact<{
  filter?: InputMaybe<ErrorReportsFilterInput>;
}>;


export type GetErrorReportsQuery = { __typename?: 'Query', errorReports: Array<{ __typename?: 'ErrorReport', id: string, userEmail: string, errorTitle: string, errorDetails: string, severity: ReportSeverity, status: ReportStatus, reproductionSteps?: string | null, expectedVsActual?: string | null, browserInfo?: string | null, attachments?: Array<string> | null, adminNotes?: string | null, isResolved?: boolean | null, resolvedAt?: any | null, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null }, tenant?: { __typename?: 'Tenant', id: string, name: string } | null, resolvedByUser?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null }> };

export type GetErrorReportQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetErrorReportQuery = { __typename?: 'Query', errorReport?: { __typename?: 'ErrorReport', id: string, userEmail: string, errorTitle: string, errorDetails: string, severity: ReportSeverity, status: ReportStatus, reproductionSteps?: string | null, expectedVsActual?: string | null, browserInfo?: string | null, attachments?: Array<string> | null, adminNotes?: string | null, isResolved?: boolean | null, resolvedAt?: any | null, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null }, tenant?: { __typename?: 'Tenant', id: string, name: string } | null, resolvedByUser?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null } | null };

export type GetUnresolvedErrorReportsCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnresolvedErrorReportsCountQuery = { __typename?: 'Query', unresolvedErrorReportsCount: number };

export type BatchMutationFieldsFragment = { __typename?: 'Batch', id: string, tenantId: string, greenhouseId?: string | null, cropId: string, varietyId?: string | null, name?: string | null, batchNumber?: string | null, status: BatchStatus, plantingDate: any, numberOfRows: number, rowLength: number, rowSpacing: number, startRow?: number | null, endRow?: number | null, plantsPerMeter: number, lostPlants: number, cultivationArea: number, totalPlants: number, inputMode: InputMode, crateWeight?: number | null, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null };

export type CreateBatchMutationVariables = Exact<{
  input: CreateBatchInput;
}>;


export type CreateBatchMutation = { __typename?: 'Mutation', createBatch: { __typename?: 'Batch', id: string, tenantId: string, greenhouseId?: string | null, cropId: string, varietyId?: string | null, name?: string | null, batchNumber?: string | null, status: BatchStatus, plantingDate: any, numberOfRows: number, rowLength: number, rowSpacing: number, startRow?: number | null, endRow?: number | null, plantsPerMeter: number, lostPlants: number, cultivationArea: number, totalPlants: number, inputMode: InputMode, crateWeight?: number | null, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null } };

export type UpdateBatchMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateBatchInput;
}>;


export type UpdateBatchMutation = { __typename?: 'Mutation', updateBatch: { __typename?: 'Batch', id: string, tenantId: string, greenhouseId?: string | null, cropId: string, varietyId?: string | null, name?: string | null, batchNumber?: string | null, status: BatchStatus, plantingDate: any, numberOfRows: number, rowLength: number, rowSpacing: number, startRow?: number | null, endRow?: number | null, plantsPerMeter: number, lostPlants: number, cultivationArea: number, totalPlants: number, inputMode: InputMode, crateWeight?: number | null, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null } };

export type DeleteBatchMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteBatchMutation = { __typename?: 'Mutation', deleteBatch: boolean };

export type UpsertFarmConfigMutationVariables = Exact<{
  input: UpsertFarmConfigInput;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type UpsertFarmConfigMutation = { __typename?: 'Mutation', upsertFarmConfig: { __typename?: 'TenantFarmConfig', id: string, tenantId: string, bayCount: number, polesMax: number, chambersCount: number, updatedAt: any } };

export type CreateFeatureMutationVariables = Exact<{
  input: CreateFeatureInput;
}>;


export type CreateFeatureMutation = { __typename?: 'Mutation', createFeature: { __typename?: 'Feature', id: string, key: string, name: string, description?: string | null, category?: string | null, isActive: boolean, createdAt: any, updatedAt: any } };

export type UpdateFeatureMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateFeatureInput;
}>;


export type UpdateFeatureMutation = { __typename?: 'Mutation', updateFeature: { __typename?: 'Feature', id: string, key: string, name: string, description?: string | null, category?: string | null, isActive: boolean, createdAt: any, updatedAt: any } };

export type DeleteFeatureMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteFeatureMutation = { __typename?: 'Mutation', deleteFeature: boolean };

export type ToggleTenantFeatureMutationVariables = Exact<{
  input: ToggleTenantFeatureInput;
}>;


export type ToggleTenantFeatureMutation = { __typename?: 'Mutation', toggleTenantFeature: { __typename?: 'TenantFeature', id: string, tenantId: string, featureId: string, enabled: boolean, createdAt: any, updatedAt: any, feature?: { __typename?: 'Feature', id: string, key: string, name: string, description?: string | null, category?: string | null, isActive: boolean } | null } };

export type AssignCropToGreenhouseMutationVariables = Exact<{
  greenhouseId: Scalars['ID']['input'];
  cropId: Scalars['ID']['input'];
}>;


export type AssignCropToGreenhouseMutation = { __typename?: 'Mutation', assignCropToGreenhouse: { __typename?: 'GreenhouseCrop', id: string, greenhouseId: string, cropId: string } };

export type UnassignCropFromGreenhouseMutationVariables = Exact<{
  greenhouseId: Scalars['ID']['input'];
  cropId: Scalars['ID']['input'];
}>;


export type UnassignCropFromGreenhouseMutation = { __typename?: 'Mutation', unassignCropFromGreenhouse: boolean };

export type GreenhouseMutationFieldsFragment = { __typename?: 'Greenhouse', id: string, tenantId: string, name: string, doorPosition?: DoorPosition | null, xDimension?: number | null, yDimension?: number | null, bayCount?: number | null, isHorizontal?: boolean | null };

export type CreateGreenhouseMutationVariables = Exact<{
  input: CreateGreenhouseInput;
}>;


export type CreateGreenhouseMutation = { __typename?: 'Mutation', createGreenhouse: { __typename?: 'Greenhouse', id: string, tenantId: string, name: string, doorPosition?: DoorPosition | null, xDimension?: number | null, yDimension?: number | null, bayCount?: number | null, isHorizontal?: boolean | null } };

export type UpdateGreenhouseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateGreenhouseInput;
}>;


export type UpdateGreenhouseMutation = { __typename?: 'Mutation', updateGreenhouse: { __typename?: 'Greenhouse', id: string, tenantId: string, name: string, doorPosition?: DoorPosition | null, xDimension?: number | null, yDimension?: number | null, bayCount?: number | null, isHorizontal?: boolean | null } };

export type DeleteGreenhouseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGreenhouseMutation = { __typename?: 'Mutation', deleteGreenhouse: boolean };

export type HarvestMutationFieldsFragment = { __typename?: 'Harvest', id: string, tenantId: string, createdById?: string | null, batchId: string, date: any, photoUrls: Array<string>, createdAt: any, updatedAt: any, batch?: { __typename?: 'Batch', id: string, name?: string | null, status: BatchStatus, totalPlants: number, rowLength: number, inputMode: InputMode, crateWeight?: number | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null } | null, entries: Array<{ __typename?: 'HarvestEntry', id: string, rowX: number, rowY: number, classA: number, classB: number, classC: number, waste: number, crateCounts?: Array<number> | null, remainingKgs?: Array<number> | null, fruitCount: number, totalFruitWeight: number, avgFruitWeight: number, avgBrix: number, brixReadings: Array<{ __typename?: 'BrixReading', class: HarvestQualityClass, value: number }> }>, totals: { __typename?: 'HarvestTotals', classA: number, classB: number, classC: number, waste: number, fruitCount: number, totalFruitWeight: number, crateCounts?: Array<number> | null, avgFruitWeight?: number | null, avgBrix?: number | null, yieldPerPlant?: number | null, yieldPerMeter?: number | null } };

export type CreateHarvestMutationVariables = Exact<{
  input: CreateHarvestInput;
}>;


export type CreateHarvestMutation = { __typename?: 'Mutation', createHarvest: { __typename?: 'Harvest', id: string, tenantId: string, createdById?: string | null, batchId: string, date: any, photoUrls: Array<string>, createdAt: any, updatedAt: any, batch?: { __typename?: 'Batch', id: string, name?: string | null, status: BatchStatus, totalPlants: number, rowLength: number, inputMode: InputMode, crateWeight?: number | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null } | null, entries: Array<{ __typename?: 'HarvestEntry', id: string, rowX: number, rowY: number, classA: number, classB: number, classC: number, waste: number, crateCounts?: Array<number> | null, remainingKgs?: Array<number> | null, fruitCount: number, totalFruitWeight: number, avgFruitWeight: number, avgBrix: number, brixReadings: Array<{ __typename?: 'BrixReading', class: HarvestQualityClass, value: number }> }>, totals: { __typename?: 'HarvestTotals', classA: number, classB: number, classC: number, waste: number, fruitCount: number, totalFruitWeight: number, crateCounts?: Array<number> | null, avgFruitWeight?: number | null, avgBrix?: number | null, yieldPerPlant?: number | null, yieldPerMeter?: number | null } } };

export type UpdateHarvestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateHarvestInput;
}>;


export type UpdateHarvestMutation = { __typename?: 'Mutation', updateHarvest: { __typename?: 'Harvest', id: string, tenantId: string, createdById?: string | null, batchId: string, date: any, photoUrls: Array<string>, createdAt: any, updatedAt: any, batch?: { __typename?: 'Batch', id: string, name?: string | null, status: BatchStatus, totalPlants: number, rowLength: number, inputMode: InputMode, crateWeight?: number | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null } | null, entries: Array<{ __typename?: 'HarvestEntry', id: string, rowX: number, rowY: number, classA: number, classB: number, classC: number, waste: number, crateCounts?: Array<number> | null, remainingKgs?: Array<number> | null, fruitCount: number, totalFruitWeight: number, avgFruitWeight: number, avgBrix: number, brixReadings: Array<{ __typename?: 'BrixReading', class: HarvestQualityClass, value: number }> }>, totals: { __typename?: 'HarvestTotals', classA: number, classB: number, classC: number, waste: number, fruitCount: number, totalFruitWeight: number, crateCounts?: Array<number> | null, avgFruitWeight?: number | null, avgBrix?: number | null, yieldPerPlant?: number | null, yieldPerMeter?: number | null } } };

export type DeleteHarvestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteHarvestMutation = { __typename?: 'Mutation', deleteHarvest: boolean };

export type UploadHarvestImageMutationVariables = Exact<{
  input: UploadImageInput;
}>;


export type UploadHarvestImageMutation = { __typename?: 'Mutation', uploadImage: { __typename?: 'ImageFile', path: string, filename: string, bucket: string, mimeType?: string | null, url?: string | null } };

export type DeleteHarvestImageMutationVariables = Exact<{
  path: Scalars['String']['input'];
}>;


export type DeleteHarvestImageMutation = { __typename?: 'Mutation', deleteImage: boolean };

export type UpsertSensorConfigMutationVariables = Exact<{
  input: UpsertSensorConfigInput;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type UpsertSensorConfigMutation = { __typename?: 'Mutation', upsertSensorConfig: { __typename?: 'SensorConfig', id: string, tenantId: string, device: string, xPosition?: number | null, yPosition?: number | null, greenhouseId?: string | null, greenhouse?: string | null, city?: string | null, hiddenInFarmOverview?: boolean | null, createdAt: any, updatedAt: any } };

export type DeleteSensorConfigMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type DeleteSensorConfigMutation = { __typename?: 'Mutation', deleteSensorConfig: boolean };

export type CreateTenantMutationVariables = Exact<{
  input: CreateTenantInput;
}>;


export type CreateTenantMutation = { __typename?: 'Mutation', createTenant: { __typename?: 'Tenant', id: string, name: string, companyName?: string | null, email?: string | null, phone?: string | null, isActive: boolean, createdAt: any, updatedAt: any, greenhouses?: Array<{ __typename?: 'TenantGreenhouse', name: string, doorPosition?: DoorPosition | null, xDimension: number, yDimension: number, bayCount?: number | null, isHorizontal?: boolean | null }> | null } };

export type UpdateTenantMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTenantInput;
}>;


export type UpdateTenantMutation = { __typename?: 'Mutation', updateTenant: { __typename?: 'Tenant', id: string, name: string, companyName?: string | null, email?: string | null, phone?: string | null, isActive: boolean, createdAt: any, updatedAt: any, greenhouses?: Array<{ __typename?: 'TenantGreenhouse', name: string, doorPosition?: DoorPosition | null, xDimension: number, yDimension: number, bayCount?: number | null, isHorizontal?: boolean | null }> | null } };

export type DeleteTenantMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTenantMutation = { __typename?: 'Mutation', deleteTenant: boolean };

export type SetTenantDisabledSensorFieldsMutationVariables = Exact<{
  fields: Array<Scalars['String']['input']> | Scalars['String']['input'];
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type SetTenantDisabledSensorFieldsMutation = { __typename?: 'Mutation', setTenantDisabledSensorFields: { __typename?: 'Tenant', id: string, disabledSensorFields: Array<string> } };

export type SetTenantHarvestDashboardItemsMutationVariables = Exact<{
  hiddenItems: Array<Scalars['String']['input']> | Scalars['String']['input'];
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type SetTenantHarvestDashboardItemsMutation = { __typename?: 'Mutation', setTenantHarvestDashboardItems: { __typename?: 'Tenant', id: string, hiddenHarvestDashboardItems: Array<string> } };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, clerkUserId: string, email?: string | null, firstName?: string | null, lastName?: string | null, imageUrl?: string | null, role: UserRole, tenantId?: string | null, isActive: boolean, status?: UserStatus | null, createdAt: any, updatedAt: any } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, clerkUserId: string, email?: string | null, firstName?: string | null, lastName?: string | null, imageUrl?: string | null, role: UserRole, tenantId?: string | null, isActive: boolean, createdAt: any, updatedAt: any } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: boolean };

export type SetMyLanguageMutationVariables = Exact<{
  language: Scalars['String']['input'];
}>;


export type SetMyLanguageMutation = { __typename?: 'Mutation', setMyLanguage: { __typename?: 'User', id: string, preferredLanguage?: string | null } };

export type SetMyFarmOverviewTimeRangeMutationVariables = Exact<{
  value: Scalars['String']['input'];
}>;


export type SetMyFarmOverviewTimeRangeMutation = { __typename?: 'Mutation', setMyFarmOverviewTimeRange: { __typename?: 'User', id: string, farmOverviewTimeRange?: string | null } };

export type UpdateMyHarvestViewSettingsMutationVariables = Exact<{
  input: HarvestViewSettingsInput;
}>;


export type UpdateMyHarvestViewSettingsMutation = { __typename?: 'Mutation', updateMyHarvestViewSettings: { __typename?: 'User', id: string, userSettings?: { __typename?: 'UserSettings', harvestView?: { __typename?: 'HarvestViewSettings', range?: HarvestDateRangePreset | null, collapsedBatchIds?: Array<string> | null, sort?: { __typename?: 'HarvestViewSort', field: HarvestSortField, direction: OrderDirection } | null } | null } | null } };

export type GetRecentSystemErrorsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']['input']>;
  severity?: InputMaybe<ReportSeverity>;
  source?: InputMaybe<ErrorSource>;
  isResolved?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetRecentSystemErrorsQuery = { __typename?: 'Query', getRecentSystemErrors: Array<{ __typename?: 'SystemError', id: string, source: ErrorSource, errorType: ErrorType, severity: ReportSeverity, errorMessage: string, component?: string | null, action?: string | null, occurrenceCount?: number | null, isResolved: boolean, createdAt: any, updatedAt: any, lastOccurredAt?: any | null, user?: { __typename?: 'User', firstName?: string | null, lastName?: string | null, email?: string | null, id: string, isActive: boolean, createdAt: any, updatedAt: any, clerkUserId: string, role: UserRole } | null, tenant?: { __typename?: 'Tenant', id: string, isActive: boolean, createdAt: any, updatedAt: any, name: string, disabledSensorFields: Array<string>, hiddenHarvestDashboardItems: Array<string> } | null }> };

export type GetSystemErrorStatsQueryVariables = Exact<{
  hours?: InputMaybe<Scalars['Float']['input']>;
}>;


export type GetSystemErrorStatsQuery = { __typename?: 'Query', getSystemErrorStats: string };

export type ResolveSystemErrorMutationVariables = Exact<{
  errorId: Scalars['ID']['input'];
  resolutionNotes?: InputMaybe<Scalars['String']['input']>;
}>;


export type ResolveSystemErrorMutation = { __typename?: 'Mutation', resolveSystemError: { __typename?: 'SystemError', id: string, isResolved: boolean, resolvedAt?: any | null } };

export type AlertsQueryVariables = Exact<{
  filter?: InputMaybe<AlertsFilterInput>;
}>;


export type AlertsQuery = { __typename?: 'Query', alerts: Array<{ __typename?: 'Alert', id: string, tenantId: string, tunnelId?: string | null, sensorName: string, value: string, status: AlertStatus, severity: AlertSeverity, description?: string | null, timestamp?: any | null, field?: string | null, measurement?: string | null, device?: string | null, greenhouse?: string | null, city?: string | null, column?: string | null, row?: string | null, profile?: string | null, acknowledgedById?: string | null, acknowledgedTime?: any | null, resolvedById?: string | null, resolvedTime?: any | null, createdAt: any, updatedAt: any, acknowledgedBy?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null, resolvedBy?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null, tenant?: { __typename?: 'Tenant', id: string, name: string } | null }> };

export type AlertQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AlertQuery = { __typename?: 'Query', alert?: { __typename?: 'Alert', id: string, tenantId: string, tunnelId?: string | null, sensorName: string, value: string, status: AlertStatus, severity: AlertSeverity, description?: string | null, timestamp?: any | null, field?: string | null, measurement?: string | null, device?: string | null, greenhouse?: string | null, city?: string | null, column?: string | null, row?: string | null, profile?: string | null, acknowledgedById?: string | null, acknowledgedTime?: any | null, resolvedById?: string | null, resolvedTime?: any | null, createdAt: any, updatedAt: any, acknowledgedBy?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null, resolvedBy?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null, tenant?: { __typename?: 'Tenant', id: string, name: string } | null } | null };

export type CreateAlertMutationVariables = Exact<{
  input: CreateAlertInput;
}>;


export type CreateAlertMutation = { __typename?: 'Mutation', createAlert: { __typename?: 'Alert', id: string, tenantId: string, tunnelId?: string | null, sensorName: string, value: string, status: AlertStatus, severity: AlertSeverity, description?: string | null, timestamp?: any | null, field?: string | null, measurement?: string | null, device?: string | null, greenhouse?: string | null, city?: string | null, column?: string | null, row?: string | null, profile?: string | null, createdAt: any, updatedAt: any } };

export type UpdateAlertMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateAlertInput;
}>;


export type UpdateAlertMutation = { __typename?: 'Mutation', updateAlert: { __typename?: 'Alert', id: string, tenantId: string, tunnelId?: string | null, sensorName: string, value: string, status: AlertStatus, severity: AlertSeverity, timestamp?: any | null, description?: string | null, field?: string | null, measurement?: string | null, device?: string | null, greenhouse?: string | null, city?: string | null, column?: string | null, row?: string | null, profile?: string | null, createdAt: any, updatedAt: any } };

export type AcknowledgeAlertMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AcknowledgeAlertMutation = { __typename?: 'Mutation', acknowledgeAlert: { __typename?: 'Alert', id: string, status: AlertStatus, updatedAt: any } };

export type ResolveAlertMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ResolveAlertMutation = { __typename?: 'Mutation', resolveAlert: { __typename?: 'Alert', id: string, status: AlertStatus, updatedAt: any } };

export type SoftDeleteAlertMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SoftDeleteAlertMutation = { __typename?: 'Mutation', softDeleteAlert: boolean };

export type DeleteAlertMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteAlertMutation = { __typename?: 'Mutation', deleteAlert: boolean };

export type BatchFieldsFragment = { __typename?: 'Batch', id: string, tenantId: string, createdById?: string | null, greenhouseId?: string | null, cropId: string, varietyId?: string | null, name?: string | null, batchNumber?: string | null, status: BatchStatus, plantingDate: any, numberOfRows: number, rowLength: number, rowSpacing: number, startRow?: number | null, endRow?: number | null, plantsPerMeter: number, lostPlants: number, cultivationArea: number, totalPlants: number, replicates: number, inputMode: InputMode, crateWeight?: number | null, createdAt: any, updatedAt: any, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null };

export type BatchesQueryVariables = Exact<{
  filter?: InputMaybe<BatchFilterInput>;
  sort?: InputMaybe<BatchSortInput>;
}>;


export type BatchesQuery = { __typename?: 'Query', batches: Array<{ __typename?: 'Batch', id: string, tenantId: string, createdById?: string | null, greenhouseId?: string | null, cropId: string, varietyId?: string | null, name?: string | null, batchNumber?: string | null, status: BatchStatus, plantingDate: any, numberOfRows: number, rowLength: number, rowSpacing: number, startRow?: number | null, endRow?: number | null, plantsPerMeter: number, lostPlants: number, cultivationArea: number, totalPlants: number, replicates: number, inputMode: InputMode, crateWeight?: number | null, createdAt: any, updatedAt: any, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null }> };

export type BatchQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type BatchQuery = { __typename?: 'Query', batch?: { __typename?: 'Batch', id: string, tenantId: string, createdById?: string | null, greenhouseId?: string | null, cropId: string, varietyId?: string | null, name?: string | null, batchNumber?: string | null, status: BatchStatus, plantingDate: any, numberOfRows: number, rowLength: number, rowSpacing: number, startRow?: number | null, endRow?: number | null, plantsPerMeter: number, lostPlants: number, cultivationArea: number, totalPlants: number, replicates: number, inputMode: InputMode, crateWeight?: number | null, createdAt: any, updatedAt: any, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null } | null };

export type HarvestBatchesQueryVariables = Exact<{ [key: string]: never; }>;


export type HarvestBatchesQuery = { __typename?: 'Query', harvestBatches: Array<{ __typename?: 'HarvestBatchListItem', id: string, name: string, species?: string | null, variety?: string | null, greenhouse?: string | null, plantingDate: any, status: BatchStatus, yieldPerPlant?: number | null }> };

export type CameraLivestreamFeedsQueryVariables = Exact<{ [key: string]: never; }>;


export type CameraLivestreamFeedsQuery = { __typename?: 'Query', cameraLivestreamFeeds: Array<{ __typename?: 'CameraLivestreamFeed', id: string, name: string, path: string, snapshotUrl?: string | null, updatedAt?: any | null, expiresAt?: any | null, available: boolean, error?: string | null }> };

export type CameraLivestreamStreamUrlQueryVariables = Exact<{
  cameraId: Scalars['String']['input'];
}>;


export type CameraLivestreamStreamUrlQuery = { __typename?: 'Query', cameraLivestreamStreamUrl: { __typename?: 'CameraLivestreamStream', cameraId: string, url?: string | null, expiresAt?: any | null, available: boolean, error?: string | null } };

export type CropsQueryVariables = Exact<{
  greenhouseId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CropsQuery = { __typename?: 'Query', crops: Array<{ __typename?: 'Crop', id: string, name: string }> };

export type VarietiesQueryVariables = Exact<{
  cropId: Scalars['ID']['input'];
}>;


export type VarietiesQuery = { __typename?: 'Query', varieties: Array<{ __typename?: 'Variety', id: string, name: string }> };

export type FarmConfigQueryVariables = Exact<{
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type FarmConfigQuery = { __typename?: 'Query', farmConfig?: { __typename?: 'TenantFarmConfig', id: string, tenantId: string, bayCount: number, polesMax: number, chambersCount: number, updatedAt: any } | null };

export type FeaturesQueryVariables = Exact<{ [key: string]: never; }>;


export type FeaturesQuery = { __typename?: 'Query', features: Array<{ __typename?: 'Feature', id: string, key: string, name: string, description?: string | null, category?: string | null, isActive: boolean, createdAt: any, updatedAt: any }> };

export type FeaturesWithTenantStatusQueryVariables = Exact<{
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type FeaturesWithTenantStatusQuery = { __typename?: 'Query', featuresWithTenantStatus: Array<{ __typename?: 'FeatureWithTenantStatus', id: string, key: string, name: string, description?: string | null, category?: string | null, isActive: boolean, enabledForTenant?: boolean | null, createdAt: any, updatedAt: any }> };

export type FeatureQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FeatureQuery = { __typename?: 'Query', feature?: { __typename?: 'Feature', id: string, key: string, name: string, description?: string | null, category?: string | null, isActive: boolean, createdAt: any, updatedAt: any } | null };

export type TenantFeaturesQueryVariables = Exact<{
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type TenantFeaturesQuery = { __typename?: 'Query', tenantFeatures: Array<{ __typename?: 'TenantFeature', id: string, tenantId: string, featureId: string, enabled: boolean, createdAt: any, updatedAt: any, feature?: { __typename?: 'Feature', id: string, key: string, name: string, description?: string | null, category?: string | null, isActive: boolean } | null }> };

export type GreenhouseFieldsFragment = { __typename?: 'Greenhouse', id: string, tenantId: string, name: string, doorPosition?: DoorPosition | null, xDimension?: number | null, yDimension?: number | null, bayCount?: number | null, isHorizontal?: boolean | null, createdAt: any, updatedAt: any };

export type GreenhousesQueryVariables = Exact<{
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GreenhousesQuery = { __typename?: 'Query', greenhouses: Array<{ __typename?: 'Greenhouse', id: string, tenantId: string, name: string, doorPosition?: DoorPosition | null, xDimension?: number | null, yDimension?: number | null, bayCount?: number | null, isHorizontal?: boolean | null, createdAt: any, updatedAt: any }> };

export type GreenhouseQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GreenhouseQuery = { __typename?: 'Query', greenhouse?: { __typename?: 'Greenhouse', id: string, tenantId: string, name: string, doorPosition?: DoorPosition | null, xDimension?: number | null, yDimension?: number | null, bayCount?: number | null, isHorizontal?: boolean | null, createdAt: any, updatedAt: any } | null };

export type GetHarvestBatchesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetHarvestBatchesQuery = { __typename?: 'Query', harvestBatches: Array<{ __typename?: 'HarvestBatchListItem', id: string, name: string, species?: string | null, variety?: string | null, greenhouse?: string | null, plantingDate: any, status: BatchStatus, yieldPerPlant?: number | null }> };

export type GetHarvestDashboardQueryVariables = Exact<{
  filter?: InputMaybe<DashboardFilterInput>;
}>;


export type GetHarvestDashboardQuery = { __typename?: 'Query', harvestDashboard: { __typename?: 'HarvestDashboardMetrics', species: string, variety: string, harvestCount: number, totalYield: number, averageBrix: number, averageFruitWeight: number, yieldPerPlant?: number | null, yieldPerMeter?: number | null, marketablePercent: number, wastePercent: number, wasteTotal: number, classBTotal: number, classCTotal: number, criticalAlerts: number, daysActive: number, yieldOverTime: Array<{ __typename?: 'YieldOverTimeData', date: string, yield: number }>, yieldPerMeterTrend: Array<{ __typename?: 'YieldPerMeterData', date: string, yieldPerMeter: number }>, classDistribution: Array<{ __typename?: 'ClassDistributionData', date: string, marketable: number, classB: number, classC: number, waste: number }>, brixTrend: Array<{ __typename?: 'BrixTrendData', date: string, brix: number }>, fruitWeightTrend: Array<{ __typename?: 'FruitWeightTrendData', date: string, weight: number }>, cumulativeYield: Array<{ __typename?: 'CumulativeYieldData', date: string, cumulativeClassA: number, cumulativeClassB: number, cumulativeClassC: number, cumulativeWaste: number }> } };

export type GetHarvestDashboardWithVariablesQueryVariables = Exact<{
  filter?: InputMaybe<DashboardFilterInput>;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
  species?: InputMaybe<Scalars['String']['input']>;
  variety?: InputMaybe<Scalars['String']['input']>;
  batch?: InputMaybe<Scalars['String']['input']>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  greenhouseId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetHarvestDashboardWithVariablesQuery = { __typename?: 'Query', harvestDashboard: { __typename?: 'HarvestDashboardMetrics', species: string, variety: string, harvestCount: number, totalYield: number, averageBrix: number, averageFruitWeight: number, yieldPerPlant?: number | null, yieldPerMeter?: number | null, marketablePercent: number, wastePercent: number, wasteTotal: number, classBTotal: number, classCTotal: number, criticalAlerts: number, daysActive: number, yieldOverTime: Array<{ __typename?: 'YieldOverTimeData', date: string, yield: number }>, yieldPerMeterTrend: Array<{ __typename?: 'YieldPerMeterData', date: string, yieldPerMeter: number }>, classDistribution: Array<{ __typename?: 'ClassDistributionData', date: string, marketable: number, classB: number, classC: number, waste: number }>, brixTrend: Array<{ __typename?: 'BrixTrendData', date: string, brix: number }>, fruitWeightTrend: Array<{ __typename?: 'FruitWeightTrendData', date: string, weight: number }>, cumulativeYield: Array<{ __typename?: 'CumulativeYieldData', date: string, cumulativeClassA: number, cumulativeClassB: number, cumulativeClassC: number, cumulativeWaste: number }> } };

export type GetHarvestMetricsQueryVariables = Exact<{
  filter?: InputMaybe<DashboardFilterInput>;
}>;


export type GetHarvestMetricsQuery = { __typename?: 'Query', harvestDashboard: { __typename?: 'HarvestDashboardMetrics', species: string, variety: string, harvestCount: number, totalYield: number, averageBrix: number, averageFruitWeight: number, yieldPerPlant?: number | null, marketablePercent: number, wastePercent: number, wasteTotal: number, classBTotal: number, classCTotal: number, criticalAlerts: number, daysActive: number } };

export type GetYieldOverTimeQueryVariables = Exact<{
  filter?: InputMaybe<DashboardFilterInput>;
}>;


export type GetYieldOverTimeQuery = { __typename?: 'Query', harvestDashboard: { __typename?: 'HarvestDashboardMetrics', yieldOverTime: Array<{ __typename?: 'YieldOverTimeData', date: string, yield: number }> } };

export type GetClassDistributionQueryVariables = Exact<{
  filter?: InputMaybe<DashboardFilterInput>;
}>;


export type GetClassDistributionQuery = { __typename?: 'Query', harvestDashboard: { __typename?: 'HarvestDashboardMetrics', classDistribution: Array<{ __typename?: 'ClassDistributionData', date: string, marketable: number, classB: number, classC: number, waste: number }> } };

export type GetBrixTrendQueryVariables = Exact<{
  filter?: InputMaybe<DashboardFilterInput>;
}>;


export type GetBrixTrendQuery = { __typename?: 'Query', harvestDashboard: { __typename?: 'HarvestDashboardMetrics', brixTrend: Array<{ __typename?: 'BrixTrendData', date: string, brix: number }> } };

export type GetFruitWeightTrendQueryVariables = Exact<{
  filter?: InputMaybe<DashboardFilterInput>;
}>;


export type GetFruitWeightTrendQuery = { __typename?: 'Query', harvestDashboard: { __typename?: 'HarvestDashboardMetrics', fruitWeightTrend: Array<{ __typename?: 'FruitWeightTrendData', date: string, weight: number }> } };

export type GetCumulativeYieldQueryVariables = Exact<{
  filter?: InputMaybe<DashboardFilterInput>;
}>;


export type GetCumulativeYieldQuery = { __typename?: 'Query', harvestDashboard: { __typename?: 'HarvestDashboardMetrics', cumulativeYield: Array<{ __typename?: 'CumulativeYieldData', date: string, cumulativeClassA: number, cumulativeClassB: number, cumulativeClassC: number, cumulativeWaste: number }> } };

export type GetHarvestSummaryQueryVariables = Exact<{
  filter?: InputMaybe<HarvestFilterInput>;
}>;


export type GetHarvestSummaryQuery = { __typename?: 'Query', harvests: Array<{ __typename?: 'Harvest', id: string, date: any, createdAt: any, batch?: { __typename?: 'Batch', id: string, name?: string | null, status: BatchStatus, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null } | null, totals: { __typename?: 'HarvestTotals', classA: number, classB: number, classC: number, waste: number, avgBrix?: number | null } }> };

export type HarvestFieldsFragment = { __typename?: 'Harvest', id: string, tenantId: string, createdById?: string | null, batchId: string, date: any, photoUrls: Array<string>, createdAt: any, updatedAt: any, batch?: { __typename?: 'Batch', id: string, name?: string | null, cropId: string, varietyId?: string | null, status: BatchStatus, batchNumber?: string | null, greenhouseId?: string | null, plantingDate: any, cultivationArea: number, numberOfRows: number, rowLength: number, plantsPerMeter: number, rowSpacing: number, startRow?: number | null, endRow?: number | null, totalPlants: number, lostPlants: number, replicates: number, inputMode: InputMode, crateWeight?: number | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null } | null, entries: Array<{ __typename?: 'HarvestEntry', id: string, rowX: number, rowY: number, classA: number, classB: number, classC: number, waste: number, crateCounts?: Array<number> | null, remainingKgs?: Array<number> | null, fruitCount: number, totalFruitWeight: number, avgFruitWeight: number, avgBrix: number, brixReadings: Array<{ __typename?: 'BrixReading', class: HarvestQualityClass, value: number }> }>, totals: { __typename?: 'HarvestTotals', classA: number, classB: number, classC: number, waste: number, fruitCount: number, totalFruitWeight: number, crateCounts?: Array<number> | null, avgFruitWeight?: number | null, avgBrix?: number | null, yieldPerPlant?: number | null, yieldPerMeter?: number | null }, createdBy?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null };

export type HarvestsQueryVariables = Exact<{
  filter?: InputMaybe<HarvestFilterInput>;
}>;


export type HarvestsQuery = { __typename?: 'Query', harvests: Array<{ __typename?: 'Harvest', id: string, tenantId: string, createdById?: string | null, batchId: string, date: any, photoUrls: Array<string>, createdAt: any, updatedAt: any, batch?: { __typename?: 'Batch', id: string, name?: string | null, cropId: string, varietyId?: string | null, status: BatchStatus, batchNumber?: string | null, greenhouseId?: string | null, plantingDate: any, cultivationArea: number, numberOfRows: number, rowLength: number, plantsPerMeter: number, rowSpacing: number, startRow?: number | null, endRow?: number | null, totalPlants: number, lostPlants: number, replicates: number, inputMode: InputMode, crateWeight?: number | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null } | null, entries: Array<{ __typename?: 'HarvestEntry', id: string, rowX: number, rowY: number, classA: number, classB: number, classC: number, waste: number, crateCounts?: Array<number> | null, remainingKgs?: Array<number> | null, fruitCount: number, totalFruitWeight: number, avgFruitWeight: number, avgBrix: number, brixReadings: Array<{ __typename?: 'BrixReading', class: HarvestQualityClass, value: number }> }>, totals: { __typename?: 'HarvestTotals', classA: number, classB: number, classC: number, waste: number, fruitCount: number, totalFruitWeight: number, crateCounts?: Array<number> | null, avgFruitWeight?: number | null, avgBrix?: number | null, yieldPerPlant?: number | null, yieldPerMeter?: number | null }, createdBy?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null }> };

export type HarvestQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type HarvestQuery = { __typename?: 'Query', harvest?: { __typename?: 'Harvest', id: string, tenantId: string, createdById?: string | null, batchId: string, date: any, photoUrls: Array<string>, createdAt: any, updatedAt: any, batch?: { __typename?: 'Batch', id: string, name?: string | null, cropId: string, varietyId?: string | null, status: BatchStatus, batchNumber?: string | null, greenhouseId?: string | null, plantingDate: any, cultivationArea: number, numberOfRows: number, rowLength: number, plantsPerMeter: number, rowSpacing: number, startRow?: number | null, endRow?: number | null, totalPlants: number, lostPlants: number, replicates: number, inputMode: InputMode, crateWeight?: number | null, crop?: { __typename?: 'Crop', id: string, name: string } | null, variety?: { __typename?: 'Variety', id: string, name: string } | null, greenhouse?: { __typename?: 'Greenhouse', id: string, name: string } | null } | null, entries: Array<{ __typename?: 'HarvestEntry', id: string, rowX: number, rowY: number, classA: number, classB: number, classC: number, waste: number, crateCounts?: Array<number> | null, remainingKgs?: Array<number> | null, fruitCount: number, totalFruitWeight: number, avgFruitWeight: number, avgBrix: number, brixReadings: Array<{ __typename?: 'BrixReading', class: HarvestQualityClass, value: number }> }>, totals: { __typename?: 'HarvestTotals', classA: number, classB: number, classC: number, waste: number, fruitCount: number, totalFruitWeight: number, crateCounts?: Array<number> | null, avgFruitWeight?: number | null, avgBrix?: number | null, yieldPerPlant?: number | null, yieldPerMeter?: number | null }, createdBy?: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null } | null } | null };

export type HarvestsCsvExportQueryVariables = Exact<{
  filter?: InputMaybe<HarvestFilterInput>;
  columns?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type HarvestsCsvExportQuery = { __typename?: 'Query', harvestsCsvExport: string };

export type HarvestsCountQueryVariables = Exact<{
  filter?: InputMaybe<HarvestFilterInput>;
}>;


export type HarvestsCountQuery = { __typename?: 'Query', harvests: Array<{ __typename?: 'Harvest', id: string, batchId: string, date: any, batch?: { __typename?: 'Batch', id: string, status: BatchStatus } | null, totals: { __typename?: 'HarvestTotals', classA: number, classB: number, classC: number, waste: number, avgBrix?: number | null } }> };

export type HarvestImagesQueryVariables = Exact<{
  folder?: InputMaybe<Scalars['String']['input']>;
}>;


export type HarvestImagesQuery = { __typename?: 'Query', images: Array<{ __typename?: 'ImageFile', path: string, filename: string, mimeType?: string | null, url?: string | null }> };

export type GetBucketDataQueryVariables = Exact<{
  input: GetBucketDataInput;
}>;


export type GetBucketDataQuery = { __typename?: 'Query', getBucketData: Array<{ __typename?: 'InfluxDBData', data: any }> };

export type GetBucketFieldsQueryVariables = Exact<{
  bucketName: Scalars['String']['input'];
  start?: InputMaybe<Scalars['String']['input']>;
  stop?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetBucketFieldsQuery = { __typename?: 'Query', getBucketFields: Array<string> };

export type GetBucketFieldMeansLastMinutesQueryVariables = Exact<{
  input: GetFieldMeansInput;
}>;


export type GetBucketFieldMeansLastMinutesQuery = { __typename?: 'Query', getBucketFieldMeansLastMinutes: Array<{ __typename?: 'FieldMeanMetric', field: string, greenhouse?: string | null, chamber?: string | null, value: number }> };

export type GetParDliForTenantQueryVariables = Exact<{
  tenantId?: InputMaybe<Scalars['ID']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetParDliForTenantQuery = { __typename?: 'Query', getParDliForTenant: { __typename?: 'TenantParDli', combined: { __typename?: 'ParDliResult', currentPPFD?: number | null, currentDLI?: number | null, todaysGraphData: Array<{ __typename?: 'ParDliPoint', time: any, dli: number }>, lowerEdge: Array<{ __typename?: 'ParDliBandPoint', hour: number, dli?: number | null }>, upperEdge: Array<{ __typename?: 'ParDliBandPoint', hour: number, dli?: number | null }> }, greenhouses: Array<{ __typename?: 'GreenhouseParDli', name: string, data: { __typename?: 'ParDliResult', currentPPFD?: number | null, currentDLI?: number | null, todaysGraphData: Array<{ __typename?: 'ParDliPoint', time: any, dli: number }>, lowerEdge: Array<{ __typename?: 'ParDliBandPoint', hour: number, dli?: number | null }>, upperEdge: Array<{ __typename?: 'ParDliBandPoint', hour: number, dli?: number | null }> } }> } };

export type SensorConfigsQueryVariables = Exact<{
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type SensorConfigsQuery = { __typename?: 'Query', sensorConfigs: Array<{ __typename?: 'SensorConfig', id: string, tenantId: string, device: string, xPosition?: number | null, yPosition?: number | null, greenhouseId?: string | null, greenhouse?: string | null, city?: string | null, hiddenInFarmOverview?: boolean | null, createdAt: any, updatedAt: any }> };

export type SensorDevicesQueryVariables = Exact<{
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type SensorDevicesQuery = { __typename?: 'Query', sensorDevices: Array<string> };

export type GreenhouseOptionsQueryVariables = Exact<{
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GreenhouseOptionsQuery = { __typename?: 'Query', greenhouseOptions: Array<string> };

export type TenantsQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantsQuery = { __typename?: 'Query', tenants: Array<{ __typename?: 'Tenant', id: string, name: string, companyName?: string | null, email?: string | null, phone?: string | null, isActive: boolean, disabledSensorFields: Array<string>, hiddenHarvestDashboardItems: Array<string>, createdAt: any, updatedAt: any, greenhouses?: Array<{ __typename?: 'TenantGreenhouse', name: string, doorPosition?: DoorPosition | null, xDimension: number, yDimension: number, bayCount?: number | null, isHorizontal?: boolean | null }> | null }> };

export type TenantQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TenantQuery = { __typename?: 'Query', tenant?: { __typename?: 'Tenant', id: string, name: string, companyName?: string | null, email?: string | null, phone?: string | null, isActive: boolean, disabledSensorFields: Array<string>, hiddenHarvestDashboardItems: Array<string>, createdAt: any, updatedAt: any, greenhouses?: Array<{ __typename?: 'TenantGreenhouse', name: string, doorPosition?: DoorPosition | null, xDimension: number, yDimension: number, bayCount?: number | null, isHorizontal?: boolean | null }> | null, users?: Array<{ __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null, role: UserRole }> | null } | null };

export type GetTenantBucketQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTenantBucketQuery = { __typename?: 'Query', tenant?: { __typename?: 'Tenant', id: string, name: string, influxBucketName?: string | null } | null };

export type TenantGreenhousesQueryVariables = Exact<{
  tenantId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type TenantGreenhousesQuery = { __typename?: 'Query', tenantGreenhouses: Array<string> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, clerkUserId: string, email?: string | null, firstName?: string | null, lastName?: string | null, imageUrl?: string | null, role: UserRole, tenantId?: string | null, isActive: boolean, status?: UserStatus | null, preferredLanguage?: string | null, farmOverviewTimeRange?: string | null, createdAt: any, updatedAt: any, tenant?: { __typename?: 'Tenant', id: string, name: string, influxBucketName?: string | null, createdAt: any, isActive: boolean, updatedAt: any, disabledSensorFields: Array<string>, hiddenHarvestDashboardItems: Array<string>, greenhouses?: Array<{ __typename?: 'TenantGreenhouse', name: string, xDimension: number, yDimension: number, doorPosition?: DoorPosition | null, bayCount?: number | null, isHorizontal?: boolean | null }> | null } | null, userSettings?: { __typename?: 'UserSettings', harvestView?: { __typename?: 'HarvestViewSettings', range?: HarvestDateRangePreset | null, collapsedBatchIds?: Array<string> | null, sort?: { __typename?: 'HarvestViewSort', field: HarvestSortField, direction: OrderDirection } | null } | null } | null } | null };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, clerkUserId: string, email?: string | null, firstName?: string | null, lastName?: string | null, imageUrl?: string | null, role: UserRole, tenantId?: string | null, isActive: boolean, status?: UserStatus | null, createdAt: any, updatedAt: any, tenant?: { __typename?: 'Tenant', id: string, name: string, createdAt: any, isActive: boolean, updatedAt: any } | null }> };

export type UserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, clerkUserId: string, email?: string | null, firstName?: string | null, lastName?: string | null, imageUrl?: string | null, role: UserRole, tenantId?: string | null, isActive: boolean, createdAt: any, updatedAt: any } | null };

export const ErrorReportFragmentFragmentDoc = gql`
    fragment ErrorReportFragment on ErrorReport {
  id
  userEmail
  errorTitle
  errorDetails
  severity
  status
  reproductionSteps
  expectedVsActual
  browserInfo
  attachments
  adminNotes
  isResolved
  resolvedAt
  createdAt
  updatedAt
  user {
    id
    firstName
    lastName
    email
  }
  tenant {
    id
    name
  }
  resolvedByUser {
    id
    firstName
    lastName
    email
  }
}
    `;
export const BatchMutationFieldsFragmentDoc = gql`
    fragment BatchMutationFields on Batch {
  id
  tenantId
  greenhouseId
  cropId
  varietyId
  name
  batchNumber
  status
  plantingDate
  numberOfRows
  rowLength
  rowSpacing
  startRow
  endRow
  plantsPerMeter
  lostPlants
  cultivationArea
  totalPlants
  inputMode
  crateWeight
  greenhouse {
    id
    name
  }
  crop {
    id
    name
  }
  variety {
    id
    name
  }
}
    `;
export const GreenhouseMutationFieldsFragmentDoc = gql`
    fragment GreenhouseMutationFields on Greenhouse {
  id
  tenantId
  name
  doorPosition
  xDimension
  yDimension
  bayCount
  isHorizontal
}
    `;
export const HarvestMutationFieldsFragmentDoc = gql`
    fragment HarvestMutationFields on Harvest {
  id
  tenantId
  createdById
  batchId
  date
  photoUrls
  createdAt
  updatedAt
  batch {
    id
    name
    crop {
      id
      name
    }
    variety {
      id
      name
    }
    status
    totalPlants
    rowLength
    inputMode
    crateWeight
    greenhouse {
      id
      name
    }
  }
  entries {
    id
    rowX
    rowY
    classA
    classB
    classC
    waste
    crateCounts
    remainingKgs
    fruitCount
    totalFruitWeight
    avgFruitWeight
    avgBrix
    brixReadings {
      class
      value
    }
  }
  totals {
    classA
    classB
    classC
    waste
    fruitCount
    totalFruitWeight
    crateCounts
    avgFruitWeight
    avgBrix
    yieldPerPlant
    yieldPerMeter
  }
}
    `;
export const BatchFieldsFragmentDoc = gql`
    fragment BatchFields on Batch {
  id
  tenantId
  createdById
  greenhouseId
  cropId
  varietyId
  name
  batchNumber
  status
  plantingDate
  numberOfRows
  rowLength
  rowSpacing
  startRow
  endRow
  plantsPerMeter
  lostPlants
  cultivationArea
  totalPlants
  replicates
  inputMode
  crateWeight
  createdAt
  updatedAt
  greenhouse {
    id
    name
  }
  crop {
    id
    name
  }
  variety {
    id
    name
  }
}
    `;
export const GreenhouseFieldsFragmentDoc = gql`
    fragment GreenhouseFields on Greenhouse {
  id
  tenantId
  name
  doorPosition
  xDimension
  yDimension
  bayCount
  isHorizontal
  createdAt
  updatedAt
}
    `;
export const HarvestFieldsFragmentDoc = gql`
    fragment HarvestFields on Harvest {
  id
  tenantId
  createdById
  batchId
  date
  photoUrls
  createdAt
  updatedAt
  batch {
    id
    name
    cropId
    varietyId
    crop {
      id
      name
    }
    variety {
      id
      name
    }
    status
    batchNumber
    greenhouseId
    plantingDate
    cultivationArea
    numberOfRows
    rowLength
    plantsPerMeter
    rowSpacing
    startRow
    endRow
    totalPlants
    lostPlants
    replicates
    inputMode
    crateWeight
    greenhouse {
      id
      name
    }
  }
  entries {
    id
    rowX
    rowY
    classA
    classB
    classC
    waste
    crateCounts
    remainingKgs
    fruitCount
    totalFruitWeight
    avgFruitWeight
    avgBrix
    brixReadings {
      class
      value
    }
  }
  totals {
    classA
    classB
    classC
    waste
    fruitCount
    totalFruitWeight
    crateCounts
    avgFruitWeight
    avgBrix
    yieldPerPlant
    yieldPerMeter
  }
  createdBy {
    id
    firstName
    lastName
    email
  }
}
    `;
export const CreateErrorReportDocument = gql`
    mutation CreateErrorReport($input: CreateErrorReportInput!) {
  createErrorReport(input: $input) {
    ...ErrorReportFragment
  }
}
    ${ErrorReportFragmentFragmentDoc}`;
export type CreateErrorReportMutationFn = Apollo.MutationFunction<CreateErrorReportMutation, CreateErrorReportMutationVariables>;

/**
 * __useCreateErrorReportMutation__
 *
 * To run a mutation, you first call `useCreateErrorReportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateErrorReportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createErrorReportMutation, { data, loading, error }] = useCreateErrorReportMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateErrorReportMutation(baseOptions?: Apollo.MutationHookOptions<CreateErrorReportMutation, CreateErrorReportMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateErrorReportMutation, CreateErrorReportMutationVariables>(CreateErrorReportDocument, options);
      }
export type CreateErrorReportMutationHookResult = ReturnType<typeof useCreateErrorReportMutation>;
export type CreateErrorReportMutationResult = Apollo.MutationResult<CreateErrorReportMutation>;
export type CreateErrorReportMutationOptions = Apollo.BaseMutationOptions<CreateErrorReportMutation, CreateErrorReportMutationVariables>;
export const UpdateErrorReportDocument = gql`
    mutation UpdateErrorReport($id: ID!, $input: UpdateErrorReportInput!) {
  updateErrorReport(id: $id, input: $input) {
    ...ErrorReportFragment
  }
}
    ${ErrorReportFragmentFragmentDoc}`;
export type UpdateErrorReportMutationFn = Apollo.MutationFunction<UpdateErrorReportMutation, UpdateErrorReportMutationVariables>;

/**
 * __useUpdateErrorReportMutation__
 *
 * To run a mutation, you first call `useUpdateErrorReportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateErrorReportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateErrorReportMutation, { data, loading, error }] = useUpdateErrorReportMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateErrorReportMutation(baseOptions?: Apollo.MutationHookOptions<UpdateErrorReportMutation, UpdateErrorReportMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateErrorReportMutation, UpdateErrorReportMutationVariables>(UpdateErrorReportDocument, options);
      }
export type UpdateErrorReportMutationHookResult = ReturnType<typeof useUpdateErrorReportMutation>;
export type UpdateErrorReportMutationResult = Apollo.MutationResult<UpdateErrorReportMutation>;
export type UpdateErrorReportMutationOptions = Apollo.BaseMutationOptions<UpdateErrorReportMutation, UpdateErrorReportMutationVariables>;
export const UpdateErrorReportStatusDocument = gql`
    mutation UpdateErrorReportStatus($id: ID!, $status: String!) {
  updateErrorReportStatus(id: $id, status: $status) {
    ...ErrorReportFragment
  }
}
    ${ErrorReportFragmentFragmentDoc}`;
export type UpdateErrorReportStatusMutationFn = Apollo.MutationFunction<UpdateErrorReportStatusMutation, UpdateErrorReportStatusMutationVariables>;

/**
 * __useUpdateErrorReportStatusMutation__
 *
 * To run a mutation, you first call `useUpdateErrorReportStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateErrorReportStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateErrorReportStatusMutation, { data, loading, error }] = useUpdateErrorReportStatusMutation({
 *   variables: {
 *      id: // value for 'id'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateErrorReportStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateErrorReportStatusMutation, UpdateErrorReportStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateErrorReportStatusMutation, UpdateErrorReportStatusMutationVariables>(UpdateErrorReportStatusDocument, options);
      }
export type UpdateErrorReportStatusMutationHookResult = ReturnType<typeof useUpdateErrorReportStatusMutation>;
export type UpdateErrorReportStatusMutationResult = Apollo.MutationResult<UpdateErrorReportStatusMutation>;
export type UpdateErrorReportStatusMutationOptions = Apollo.BaseMutationOptions<UpdateErrorReportStatusMutation, UpdateErrorReportStatusMutationVariables>;
export const ResolveErrorReportDocument = gql`
    mutation ResolveErrorReport($id: ID!, $adminNotes: String) {
  resolveErrorReport(id: $id, adminNotes: $adminNotes) {
    ...ErrorReportFragment
  }
}
    ${ErrorReportFragmentFragmentDoc}`;
export type ResolveErrorReportMutationFn = Apollo.MutationFunction<ResolveErrorReportMutation, ResolveErrorReportMutationVariables>;

/**
 * __useResolveErrorReportMutation__
 *
 * To run a mutation, you first call `useResolveErrorReportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResolveErrorReportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resolveErrorReportMutation, { data, loading, error }] = useResolveErrorReportMutation({
 *   variables: {
 *      id: // value for 'id'
 *      adminNotes: // value for 'adminNotes'
 *   },
 * });
 */
export function useResolveErrorReportMutation(baseOptions?: Apollo.MutationHookOptions<ResolveErrorReportMutation, ResolveErrorReportMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResolveErrorReportMutation, ResolveErrorReportMutationVariables>(ResolveErrorReportDocument, options);
      }
export type ResolveErrorReportMutationHookResult = ReturnType<typeof useResolveErrorReportMutation>;
export type ResolveErrorReportMutationResult = Apollo.MutationResult<ResolveErrorReportMutation>;
export type ResolveErrorReportMutationOptions = Apollo.BaseMutationOptions<ResolveErrorReportMutation, ResolveErrorReportMutationVariables>;
export const DeleteErrorReportDocument = gql`
    mutation DeleteErrorReport($id: ID!) {
  deleteErrorReport(id: $id)
}
    `;
export type DeleteErrorReportMutationFn = Apollo.MutationFunction<DeleteErrorReportMutation, DeleteErrorReportMutationVariables>;

/**
 * __useDeleteErrorReportMutation__
 *
 * To run a mutation, you first call `useDeleteErrorReportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteErrorReportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteErrorReportMutation, { data, loading, error }] = useDeleteErrorReportMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteErrorReportMutation(baseOptions?: Apollo.MutationHookOptions<DeleteErrorReportMutation, DeleteErrorReportMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteErrorReportMutation, DeleteErrorReportMutationVariables>(DeleteErrorReportDocument, options);
      }
export type DeleteErrorReportMutationHookResult = ReturnType<typeof useDeleteErrorReportMutation>;
export type DeleteErrorReportMutationResult = Apollo.MutationResult<DeleteErrorReportMutation>;
export type DeleteErrorReportMutationOptions = Apollo.BaseMutationOptions<DeleteErrorReportMutation, DeleteErrorReportMutationVariables>;
export const GetErrorReportsDocument = gql`
    query GetErrorReports($filter: ErrorReportsFilterInput) {
  errorReports(filter: $filter) {
    ...ErrorReportFragment
  }
}
    ${ErrorReportFragmentFragmentDoc}`;

/**
 * __useGetErrorReportsQuery__
 *
 * To run a query within a React component, call `useGetErrorReportsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorReportsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorReportsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetErrorReportsQuery(baseOptions?: Apollo.QueryHookOptions<GetErrorReportsQuery, GetErrorReportsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetErrorReportsQuery, GetErrorReportsQueryVariables>(GetErrorReportsDocument, options);
      }
export function useGetErrorReportsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetErrorReportsQuery, GetErrorReportsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetErrorReportsQuery, GetErrorReportsQueryVariables>(GetErrorReportsDocument, options);
        }
// @ts-ignore
export function useGetErrorReportsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetErrorReportsQuery, GetErrorReportsQueryVariables>): Apollo.UseSuspenseQueryResult<GetErrorReportsQuery, GetErrorReportsQueryVariables>;
export function useGetErrorReportsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetErrorReportsQuery, GetErrorReportsQueryVariables>): Apollo.UseSuspenseQueryResult<GetErrorReportsQuery | undefined, GetErrorReportsQueryVariables>;
export function useGetErrorReportsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetErrorReportsQuery, GetErrorReportsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetErrorReportsQuery, GetErrorReportsQueryVariables>(GetErrorReportsDocument, options);
        }
export type GetErrorReportsQueryHookResult = ReturnType<typeof useGetErrorReportsQuery>;
export type GetErrorReportsLazyQueryHookResult = ReturnType<typeof useGetErrorReportsLazyQuery>;
export type GetErrorReportsSuspenseQueryHookResult = ReturnType<typeof useGetErrorReportsSuspenseQuery>;
export type GetErrorReportsQueryResult = Apollo.QueryResult<GetErrorReportsQuery, GetErrorReportsQueryVariables>;
export const GetErrorReportDocument = gql`
    query GetErrorReport($id: ID!) {
  errorReport(id: $id) {
    ...ErrorReportFragment
  }
}
    ${ErrorReportFragmentFragmentDoc}`;

/**
 * __useGetErrorReportQuery__
 *
 * To run a query within a React component, call `useGetErrorReportQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErrorReportQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErrorReportQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetErrorReportQuery(baseOptions: Apollo.QueryHookOptions<GetErrorReportQuery, GetErrorReportQueryVariables> & ({ variables: GetErrorReportQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetErrorReportQuery, GetErrorReportQueryVariables>(GetErrorReportDocument, options);
      }
export function useGetErrorReportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetErrorReportQuery, GetErrorReportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetErrorReportQuery, GetErrorReportQueryVariables>(GetErrorReportDocument, options);
        }
// @ts-ignore
export function useGetErrorReportSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetErrorReportQuery, GetErrorReportQueryVariables>): Apollo.UseSuspenseQueryResult<GetErrorReportQuery, GetErrorReportQueryVariables>;
export function useGetErrorReportSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetErrorReportQuery, GetErrorReportQueryVariables>): Apollo.UseSuspenseQueryResult<GetErrorReportQuery | undefined, GetErrorReportQueryVariables>;
export function useGetErrorReportSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetErrorReportQuery, GetErrorReportQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetErrorReportQuery, GetErrorReportQueryVariables>(GetErrorReportDocument, options);
        }
export type GetErrorReportQueryHookResult = ReturnType<typeof useGetErrorReportQuery>;
export type GetErrorReportLazyQueryHookResult = ReturnType<typeof useGetErrorReportLazyQuery>;
export type GetErrorReportSuspenseQueryHookResult = ReturnType<typeof useGetErrorReportSuspenseQuery>;
export type GetErrorReportQueryResult = Apollo.QueryResult<GetErrorReportQuery, GetErrorReportQueryVariables>;
export const GetUnresolvedErrorReportsCountDocument = gql`
    query GetUnresolvedErrorReportsCount {
  unresolvedErrorReportsCount
}
    `;

/**
 * __useGetUnresolvedErrorReportsCountQuery__
 *
 * To run a query within a React component, call `useGetUnresolvedErrorReportsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUnresolvedErrorReportsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUnresolvedErrorReportsCountQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUnresolvedErrorReportsCountQuery(baseOptions?: Apollo.QueryHookOptions<GetUnresolvedErrorReportsCountQuery, GetUnresolvedErrorReportsCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUnresolvedErrorReportsCountQuery, GetUnresolvedErrorReportsCountQueryVariables>(GetUnresolvedErrorReportsCountDocument, options);
      }
export function useGetUnresolvedErrorReportsCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUnresolvedErrorReportsCountQuery, GetUnresolvedErrorReportsCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUnresolvedErrorReportsCountQuery, GetUnresolvedErrorReportsCountQueryVariables>(GetUnresolvedErrorReportsCountDocument, options);
        }
// @ts-ignore
export function useGetUnresolvedErrorReportsCountSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUnresolvedErrorReportsCountQuery, GetUnresolvedErrorReportsCountQueryVariables>): Apollo.UseSuspenseQueryResult<GetUnresolvedErrorReportsCountQuery, GetUnresolvedErrorReportsCountQueryVariables>;
export function useGetUnresolvedErrorReportsCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUnresolvedErrorReportsCountQuery, GetUnresolvedErrorReportsCountQueryVariables>): Apollo.UseSuspenseQueryResult<GetUnresolvedErrorReportsCountQuery | undefined, GetUnresolvedErrorReportsCountQueryVariables>;
export function useGetUnresolvedErrorReportsCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUnresolvedErrorReportsCountQuery, GetUnresolvedErrorReportsCountQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUnresolvedErrorReportsCountQuery, GetUnresolvedErrorReportsCountQueryVariables>(GetUnresolvedErrorReportsCountDocument, options);
        }
export type GetUnresolvedErrorReportsCountQueryHookResult = ReturnType<typeof useGetUnresolvedErrorReportsCountQuery>;
export type GetUnresolvedErrorReportsCountLazyQueryHookResult = ReturnType<typeof useGetUnresolvedErrorReportsCountLazyQuery>;
export type GetUnresolvedErrorReportsCountSuspenseQueryHookResult = ReturnType<typeof useGetUnresolvedErrorReportsCountSuspenseQuery>;
export type GetUnresolvedErrorReportsCountQueryResult = Apollo.QueryResult<GetUnresolvedErrorReportsCountQuery, GetUnresolvedErrorReportsCountQueryVariables>;
export const CreateBatchDocument = gql`
    mutation CreateBatch($input: CreateBatchInput!) {
  createBatch(input: $input) {
    ...BatchMutationFields
  }
}
    ${BatchMutationFieldsFragmentDoc}`;
export type CreateBatchMutationFn = Apollo.MutationFunction<CreateBatchMutation, CreateBatchMutationVariables>;

/**
 * __useCreateBatchMutation__
 *
 * To run a mutation, you first call `useCreateBatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBatchMutation, { data, loading, error }] = useCreateBatchMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateBatchMutation(baseOptions?: Apollo.MutationHookOptions<CreateBatchMutation, CreateBatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateBatchMutation, CreateBatchMutationVariables>(CreateBatchDocument, options);
      }
export type CreateBatchMutationHookResult = ReturnType<typeof useCreateBatchMutation>;
export type CreateBatchMutationResult = Apollo.MutationResult<CreateBatchMutation>;
export type CreateBatchMutationOptions = Apollo.BaseMutationOptions<CreateBatchMutation, CreateBatchMutationVariables>;
export const UpdateBatchDocument = gql`
    mutation UpdateBatch($id: ID!, $input: UpdateBatchInput!) {
  updateBatch(id: $id, input: $input) {
    ...BatchMutationFields
  }
}
    ${BatchMutationFieldsFragmentDoc}`;
export type UpdateBatchMutationFn = Apollo.MutationFunction<UpdateBatchMutation, UpdateBatchMutationVariables>;

/**
 * __useUpdateBatchMutation__
 *
 * To run a mutation, you first call `useUpdateBatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateBatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateBatchMutation, { data, loading, error }] = useUpdateBatchMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateBatchMutation(baseOptions?: Apollo.MutationHookOptions<UpdateBatchMutation, UpdateBatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateBatchMutation, UpdateBatchMutationVariables>(UpdateBatchDocument, options);
      }
export type UpdateBatchMutationHookResult = ReturnType<typeof useUpdateBatchMutation>;
export type UpdateBatchMutationResult = Apollo.MutationResult<UpdateBatchMutation>;
export type UpdateBatchMutationOptions = Apollo.BaseMutationOptions<UpdateBatchMutation, UpdateBatchMutationVariables>;
export const DeleteBatchDocument = gql`
    mutation DeleteBatch($id: ID!) {
  deleteBatch(id: $id)
}
    `;
export type DeleteBatchMutationFn = Apollo.MutationFunction<DeleteBatchMutation, DeleteBatchMutationVariables>;

/**
 * __useDeleteBatchMutation__
 *
 * To run a mutation, you first call `useDeleteBatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteBatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteBatchMutation, { data, loading, error }] = useDeleteBatchMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteBatchMutation(baseOptions?: Apollo.MutationHookOptions<DeleteBatchMutation, DeleteBatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteBatchMutation, DeleteBatchMutationVariables>(DeleteBatchDocument, options);
      }
export type DeleteBatchMutationHookResult = ReturnType<typeof useDeleteBatchMutation>;
export type DeleteBatchMutationResult = Apollo.MutationResult<DeleteBatchMutation>;
export type DeleteBatchMutationOptions = Apollo.BaseMutationOptions<DeleteBatchMutation, DeleteBatchMutationVariables>;
export const UpsertFarmConfigDocument = gql`
    mutation UpsertFarmConfig($input: UpsertFarmConfigInput!, $tenantId: ID) {
  upsertFarmConfig(input: $input, tenantId: $tenantId) {
    id
    tenantId
    bayCount
    polesMax
    chambersCount
    updatedAt
  }
}
    `;
export type UpsertFarmConfigMutationFn = Apollo.MutationFunction<UpsertFarmConfigMutation, UpsertFarmConfigMutationVariables>;

/**
 * __useUpsertFarmConfigMutation__
 *
 * To run a mutation, you first call `useUpsertFarmConfigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertFarmConfigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertFarmConfigMutation, { data, loading, error }] = useUpsertFarmConfigMutation({
 *   variables: {
 *      input: // value for 'input'
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useUpsertFarmConfigMutation(baseOptions?: Apollo.MutationHookOptions<UpsertFarmConfigMutation, UpsertFarmConfigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertFarmConfigMutation, UpsertFarmConfigMutationVariables>(UpsertFarmConfigDocument, options);
      }
export type UpsertFarmConfigMutationHookResult = ReturnType<typeof useUpsertFarmConfigMutation>;
export type UpsertFarmConfigMutationResult = Apollo.MutationResult<UpsertFarmConfigMutation>;
export type UpsertFarmConfigMutationOptions = Apollo.BaseMutationOptions<UpsertFarmConfigMutation, UpsertFarmConfigMutationVariables>;
export const CreateFeatureDocument = gql`
    mutation CreateFeature($input: CreateFeatureInput!) {
  createFeature(input: $input) {
    id
    key
    name
    description
    category
    isActive
    createdAt
    updatedAt
  }
}
    `;
export type CreateFeatureMutationFn = Apollo.MutationFunction<CreateFeatureMutation, CreateFeatureMutationVariables>;

/**
 * __useCreateFeatureMutation__
 *
 * To run a mutation, you first call `useCreateFeatureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateFeatureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createFeatureMutation, { data, loading, error }] = useCreateFeatureMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateFeatureMutation(baseOptions?: Apollo.MutationHookOptions<CreateFeatureMutation, CreateFeatureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateFeatureMutation, CreateFeatureMutationVariables>(CreateFeatureDocument, options);
      }
export type CreateFeatureMutationHookResult = ReturnType<typeof useCreateFeatureMutation>;
export type CreateFeatureMutationResult = Apollo.MutationResult<CreateFeatureMutation>;
export type CreateFeatureMutationOptions = Apollo.BaseMutationOptions<CreateFeatureMutation, CreateFeatureMutationVariables>;
export const UpdateFeatureDocument = gql`
    mutation UpdateFeature($id: ID!, $input: UpdateFeatureInput!) {
  updateFeature(id: $id, input: $input) {
    id
    key
    name
    description
    category
    isActive
    createdAt
    updatedAt
  }
}
    `;
export type UpdateFeatureMutationFn = Apollo.MutationFunction<UpdateFeatureMutation, UpdateFeatureMutationVariables>;

/**
 * __useUpdateFeatureMutation__
 *
 * To run a mutation, you first call `useUpdateFeatureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFeatureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFeatureMutation, { data, loading, error }] = useUpdateFeatureMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateFeatureMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFeatureMutation, UpdateFeatureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFeatureMutation, UpdateFeatureMutationVariables>(UpdateFeatureDocument, options);
      }
export type UpdateFeatureMutationHookResult = ReturnType<typeof useUpdateFeatureMutation>;
export type UpdateFeatureMutationResult = Apollo.MutationResult<UpdateFeatureMutation>;
export type UpdateFeatureMutationOptions = Apollo.BaseMutationOptions<UpdateFeatureMutation, UpdateFeatureMutationVariables>;
export const DeleteFeatureDocument = gql`
    mutation DeleteFeature($id: ID!) {
  deleteFeature(id: $id)
}
    `;
export type DeleteFeatureMutationFn = Apollo.MutationFunction<DeleteFeatureMutation, DeleteFeatureMutationVariables>;

/**
 * __useDeleteFeatureMutation__
 *
 * To run a mutation, you first call `useDeleteFeatureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFeatureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFeatureMutation, { data, loading, error }] = useDeleteFeatureMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteFeatureMutation(baseOptions?: Apollo.MutationHookOptions<DeleteFeatureMutation, DeleteFeatureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteFeatureMutation, DeleteFeatureMutationVariables>(DeleteFeatureDocument, options);
      }
export type DeleteFeatureMutationHookResult = ReturnType<typeof useDeleteFeatureMutation>;
export type DeleteFeatureMutationResult = Apollo.MutationResult<DeleteFeatureMutation>;
export type DeleteFeatureMutationOptions = Apollo.BaseMutationOptions<DeleteFeatureMutation, DeleteFeatureMutationVariables>;
export const ToggleTenantFeatureDocument = gql`
    mutation ToggleTenantFeature($input: ToggleTenantFeatureInput!) {
  toggleTenantFeature(input: $input) {
    id
    tenantId
    featureId
    enabled
    createdAt
    updatedAt
    feature {
      id
      key
      name
      description
      category
      isActive
    }
  }
}
    `;
export type ToggleTenantFeatureMutationFn = Apollo.MutationFunction<ToggleTenantFeatureMutation, ToggleTenantFeatureMutationVariables>;

/**
 * __useToggleTenantFeatureMutation__
 *
 * To run a mutation, you first call `useToggleTenantFeatureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleTenantFeatureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleTenantFeatureMutation, { data, loading, error }] = useToggleTenantFeatureMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useToggleTenantFeatureMutation(baseOptions?: Apollo.MutationHookOptions<ToggleTenantFeatureMutation, ToggleTenantFeatureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ToggleTenantFeatureMutation, ToggleTenantFeatureMutationVariables>(ToggleTenantFeatureDocument, options);
      }
export type ToggleTenantFeatureMutationHookResult = ReturnType<typeof useToggleTenantFeatureMutation>;
export type ToggleTenantFeatureMutationResult = Apollo.MutationResult<ToggleTenantFeatureMutation>;
export type ToggleTenantFeatureMutationOptions = Apollo.BaseMutationOptions<ToggleTenantFeatureMutation, ToggleTenantFeatureMutationVariables>;
export const AssignCropToGreenhouseDocument = gql`
    mutation AssignCropToGreenhouse($greenhouseId: ID!, $cropId: ID!) {
  assignCropToGreenhouse(greenhouseId: $greenhouseId, cropId: $cropId) {
    id
    greenhouseId
    cropId
  }
}
    `;
export type AssignCropToGreenhouseMutationFn = Apollo.MutationFunction<AssignCropToGreenhouseMutation, AssignCropToGreenhouseMutationVariables>;

/**
 * __useAssignCropToGreenhouseMutation__
 *
 * To run a mutation, you first call `useAssignCropToGreenhouseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignCropToGreenhouseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignCropToGreenhouseMutation, { data, loading, error }] = useAssignCropToGreenhouseMutation({
 *   variables: {
 *      greenhouseId: // value for 'greenhouseId'
 *      cropId: // value for 'cropId'
 *   },
 * });
 */
export function useAssignCropToGreenhouseMutation(baseOptions?: Apollo.MutationHookOptions<AssignCropToGreenhouseMutation, AssignCropToGreenhouseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssignCropToGreenhouseMutation, AssignCropToGreenhouseMutationVariables>(AssignCropToGreenhouseDocument, options);
      }
export type AssignCropToGreenhouseMutationHookResult = ReturnType<typeof useAssignCropToGreenhouseMutation>;
export type AssignCropToGreenhouseMutationResult = Apollo.MutationResult<AssignCropToGreenhouseMutation>;
export type AssignCropToGreenhouseMutationOptions = Apollo.BaseMutationOptions<AssignCropToGreenhouseMutation, AssignCropToGreenhouseMutationVariables>;
export const UnassignCropFromGreenhouseDocument = gql`
    mutation UnassignCropFromGreenhouse($greenhouseId: ID!, $cropId: ID!) {
  unassignCropFromGreenhouse(greenhouseId: $greenhouseId, cropId: $cropId)
}
    `;
export type UnassignCropFromGreenhouseMutationFn = Apollo.MutationFunction<UnassignCropFromGreenhouseMutation, UnassignCropFromGreenhouseMutationVariables>;

/**
 * __useUnassignCropFromGreenhouseMutation__
 *
 * To run a mutation, you first call `useUnassignCropFromGreenhouseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnassignCropFromGreenhouseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unassignCropFromGreenhouseMutation, { data, loading, error }] = useUnassignCropFromGreenhouseMutation({
 *   variables: {
 *      greenhouseId: // value for 'greenhouseId'
 *      cropId: // value for 'cropId'
 *   },
 * });
 */
export function useUnassignCropFromGreenhouseMutation(baseOptions?: Apollo.MutationHookOptions<UnassignCropFromGreenhouseMutation, UnassignCropFromGreenhouseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnassignCropFromGreenhouseMutation, UnassignCropFromGreenhouseMutationVariables>(UnassignCropFromGreenhouseDocument, options);
      }
export type UnassignCropFromGreenhouseMutationHookResult = ReturnType<typeof useUnassignCropFromGreenhouseMutation>;
export type UnassignCropFromGreenhouseMutationResult = Apollo.MutationResult<UnassignCropFromGreenhouseMutation>;
export type UnassignCropFromGreenhouseMutationOptions = Apollo.BaseMutationOptions<UnassignCropFromGreenhouseMutation, UnassignCropFromGreenhouseMutationVariables>;
export const CreateGreenhouseDocument = gql`
    mutation CreateGreenhouse($input: CreateGreenhouseInput!) {
  createGreenhouse(input: $input) {
    ...GreenhouseMutationFields
  }
}
    ${GreenhouseMutationFieldsFragmentDoc}`;
export type CreateGreenhouseMutationFn = Apollo.MutationFunction<CreateGreenhouseMutation, CreateGreenhouseMutationVariables>;

/**
 * __useCreateGreenhouseMutation__
 *
 * To run a mutation, you first call `useCreateGreenhouseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGreenhouseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGreenhouseMutation, { data, loading, error }] = useCreateGreenhouseMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGreenhouseMutation(baseOptions?: Apollo.MutationHookOptions<CreateGreenhouseMutation, CreateGreenhouseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGreenhouseMutation, CreateGreenhouseMutationVariables>(CreateGreenhouseDocument, options);
      }
export type CreateGreenhouseMutationHookResult = ReturnType<typeof useCreateGreenhouseMutation>;
export type CreateGreenhouseMutationResult = Apollo.MutationResult<CreateGreenhouseMutation>;
export type CreateGreenhouseMutationOptions = Apollo.BaseMutationOptions<CreateGreenhouseMutation, CreateGreenhouseMutationVariables>;
export const UpdateGreenhouseDocument = gql`
    mutation UpdateGreenhouse($id: ID!, $input: UpdateGreenhouseInput!) {
  updateGreenhouse(id: $id, input: $input) {
    ...GreenhouseMutationFields
  }
}
    ${GreenhouseMutationFieldsFragmentDoc}`;
export type UpdateGreenhouseMutationFn = Apollo.MutationFunction<UpdateGreenhouseMutation, UpdateGreenhouseMutationVariables>;

/**
 * __useUpdateGreenhouseMutation__
 *
 * To run a mutation, you first call `useUpdateGreenhouseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGreenhouseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGreenhouseMutation, { data, loading, error }] = useUpdateGreenhouseMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateGreenhouseMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGreenhouseMutation, UpdateGreenhouseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGreenhouseMutation, UpdateGreenhouseMutationVariables>(UpdateGreenhouseDocument, options);
      }
export type UpdateGreenhouseMutationHookResult = ReturnType<typeof useUpdateGreenhouseMutation>;
export type UpdateGreenhouseMutationResult = Apollo.MutationResult<UpdateGreenhouseMutation>;
export type UpdateGreenhouseMutationOptions = Apollo.BaseMutationOptions<UpdateGreenhouseMutation, UpdateGreenhouseMutationVariables>;
export const DeleteGreenhouseDocument = gql`
    mutation DeleteGreenhouse($id: ID!) {
  deleteGreenhouse(id: $id)
}
    `;
export type DeleteGreenhouseMutationFn = Apollo.MutationFunction<DeleteGreenhouseMutation, DeleteGreenhouseMutationVariables>;

/**
 * __useDeleteGreenhouseMutation__
 *
 * To run a mutation, you first call `useDeleteGreenhouseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGreenhouseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGreenhouseMutation, { data, loading, error }] = useDeleteGreenhouseMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteGreenhouseMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGreenhouseMutation, DeleteGreenhouseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGreenhouseMutation, DeleteGreenhouseMutationVariables>(DeleteGreenhouseDocument, options);
      }
export type DeleteGreenhouseMutationHookResult = ReturnType<typeof useDeleteGreenhouseMutation>;
export type DeleteGreenhouseMutationResult = Apollo.MutationResult<DeleteGreenhouseMutation>;
export type DeleteGreenhouseMutationOptions = Apollo.BaseMutationOptions<DeleteGreenhouseMutation, DeleteGreenhouseMutationVariables>;
export const CreateHarvestDocument = gql`
    mutation CreateHarvest($input: CreateHarvestInput!) {
  createHarvest(input: $input) {
    ...HarvestMutationFields
  }
}
    ${HarvestMutationFieldsFragmentDoc}`;
export type CreateHarvestMutationFn = Apollo.MutationFunction<CreateHarvestMutation, CreateHarvestMutationVariables>;

/**
 * __useCreateHarvestMutation__
 *
 * To run a mutation, you first call `useCreateHarvestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateHarvestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createHarvestMutation, { data, loading, error }] = useCreateHarvestMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateHarvestMutation(baseOptions?: Apollo.MutationHookOptions<CreateHarvestMutation, CreateHarvestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateHarvestMutation, CreateHarvestMutationVariables>(CreateHarvestDocument, options);
      }
export type CreateHarvestMutationHookResult = ReturnType<typeof useCreateHarvestMutation>;
export type CreateHarvestMutationResult = Apollo.MutationResult<CreateHarvestMutation>;
export type CreateHarvestMutationOptions = Apollo.BaseMutationOptions<CreateHarvestMutation, CreateHarvestMutationVariables>;
export const UpdateHarvestDocument = gql`
    mutation UpdateHarvest($id: ID!, $input: UpdateHarvestInput!) {
  updateHarvest(id: $id, input: $input) {
    ...HarvestMutationFields
  }
}
    ${HarvestMutationFieldsFragmentDoc}`;
export type UpdateHarvestMutationFn = Apollo.MutationFunction<UpdateHarvestMutation, UpdateHarvestMutationVariables>;

/**
 * __useUpdateHarvestMutation__
 *
 * To run a mutation, you first call `useUpdateHarvestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateHarvestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateHarvestMutation, { data, loading, error }] = useUpdateHarvestMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateHarvestMutation(baseOptions?: Apollo.MutationHookOptions<UpdateHarvestMutation, UpdateHarvestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateHarvestMutation, UpdateHarvestMutationVariables>(UpdateHarvestDocument, options);
      }
export type UpdateHarvestMutationHookResult = ReturnType<typeof useUpdateHarvestMutation>;
export type UpdateHarvestMutationResult = Apollo.MutationResult<UpdateHarvestMutation>;
export type UpdateHarvestMutationOptions = Apollo.BaseMutationOptions<UpdateHarvestMutation, UpdateHarvestMutationVariables>;
export const DeleteHarvestDocument = gql`
    mutation DeleteHarvest($id: ID!) {
  deleteHarvest(id: $id)
}
    `;
export type DeleteHarvestMutationFn = Apollo.MutationFunction<DeleteHarvestMutation, DeleteHarvestMutationVariables>;

/**
 * __useDeleteHarvestMutation__
 *
 * To run a mutation, you first call `useDeleteHarvestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteHarvestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteHarvestMutation, { data, loading, error }] = useDeleteHarvestMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteHarvestMutation(baseOptions?: Apollo.MutationHookOptions<DeleteHarvestMutation, DeleteHarvestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteHarvestMutation, DeleteHarvestMutationVariables>(DeleteHarvestDocument, options);
      }
export type DeleteHarvestMutationHookResult = ReturnType<typeof useDeleteHarvestMutation>;
export type DeleteHarvestMutationResult = Apollo.MutationResult<DeleteHarvestMutation>;
export type DeleteHarvestMutationOptions = Apollo.BaseMutationOptions<DeleteHarvestMutation, DeleteHarvestMutationVariables>;
export const UploadHarvestImageDocument = gql`
    mutation UploadHarvestImage($input: UploadImageInput!) {
  uploadImage(input: $input) {
    path
    filename
    bucket
    mimeType
    url
  }
}
    `;
export type UploadHarvestImageMutationFn = Apollo.MutationFunction<UploadHarvestImageMutation, UploadHarvestImageMutationVariables>;

/**
 * __useUploadHarvestImageMutation__
 *
 * To run a mutation, you first call `useUploadHarvestImageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadHarvestImageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadHarvestImageMutation, { data, loading, error }] = useUploadHarvestImageMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUploadHarvestImageMutation(baseOptions?: Apollo.MutationHookOptions<UploadHarvestImageMutation, UploadHarvestImageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadHarvestImageMutation, UploadHarvestImageMutationVariables>(UploadHarvestImageDocument, options);
      }
export type UploadHarvestImageMutationHookResult = ReturnType<typeof useUploadHarvestImageMutation>;
export type UploadHarvestImageMutationResult = Apollo.MutationResult<UploadHarvestImageMutation>;
export type UploadHarvestImageMutationOptions = Apollo.BaseMutationOptions<UploadHarvestImageMutation, UploadHarvestImageMutationVariables>;
export const DeleteHarvestImageDocument = gql`
    mutation DeleteHarvestImage($path: String!) {
  deleteImage(input: {path: $path})
}
    `;
export type DeleteHarvestImageMutationFn = Apollo.MutationFunction<DeleteHarvestImageMutation, DeleteHarvestImageMutationVariables>;

/**
 * __useDeleteHarvestImageMutation__
 *
 * To run a mutation, you first call `useDeleteHarvestImageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteHarvestImageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteHarvestImageMutation, { data, loading, error }] = useDeleteHarvestImageMutation({
 *   variables: {
 *      path: // value for 'path'
 *   },
 * });
 */
export function useDeleteHarvestImageMutation(baseOptions?: Apollo.MutationHookOptions<DeleteHarvestImageMutation, DeleteHarvestImageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteHarvestImageMutation, DeleteHarvestImageMutationVariables>(DeleteHarvestImageDocument, options);
      }
export type DeleteHarvestImageMutationHookResult = ReturnType<typeof useDeleteHarvestImageMutation>;
export type DeleteHarvestImageMutationResult = Apollo.MutationResult<DeleteHarvestImageMutation>;
export type DeleteHarvestImageMutationOptions = Apollo.BaseMutationOptions<DeleteHarvestImageMutation, DeleteHarvestImageMutationVariables>;
export const UpsertSensorConfigDocument = gql`
    mutation UpsertSensorConfig($input: UpsertSensorConfigInput!, $tenantId: ID) {
  upsertSensorConfig(input: $input, tenantId: $tenantId) {
    id
    tenantId
    device
    xPosition
    yPosition
    greenhouseId
    greenhouse
    city
    hiddenInFarmOverview
    createdAt
    updatedAt
  }
}
    `;
export type UpsertSensorConfigMutationFn = Apollo.MutationFunction<UpsertSensorConfigMutation, UpsertSensorConfigMutationVariables>;

/**
 * __useUpsertSensorConfigMutation__
 *
 * To run a mutation, you first call `useUpsertSensorConfigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSensorConfigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSensorConfigMutation, { data, loading, error }] = useUpsertSensorConfigMutation({
 *   variables: {
 *      input: // value for 'input'
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useUpsertSensorConfigMutation(baseOptions?: Apollo.MutationHookOptions<UpsertSensorConfigMutation, UpsertSensorConfigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertSensorConfigMutation, UpsertSensorConfigMutationVariables>(UpsertSensorConfigDocument, options);
      }
export type UpsertSensorConfigMutationHookResult = ReturnType<typeof useUpsertSensorConfigMutation>;
export type UpsertSensorConfigMutationResult = Apollo.MutationResult<UpsertSensorConfigMutation>;
export type UpsertSensorConfigMutationOptions = Apollo.BaseMutationOptions<UpsertSensorConfigMutation, UpsertSensorConfigMutationVariables>;
export const DeleteSensorConfigDocument = gql`
    mutation DeleteSensorConfig($id: ID!, $tenantId: ID) {
  deleteSensorConfig(id: $id, tenantId: $tenantId)
}
    `;
export type DeleteSensorConfigMutationFn = Apollo.MutationFunction<DeleteSensorConfigMutation, DeleteSensorConfigMutationVariables>;

/**
 * __useDeleteSensorConfigMutation__
 *
 * To run a mutation, you first call `useDeleteSensorConfigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSensorConfigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSensorConfigMutation, { data, loading, error }] = useDeleteSensorConfigMutation({
 *   variables: {
 *      id: // value for 'id'
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useDeleteSensorConfigMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSensorConfigMutation, DeleteSensorConfigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSensorConfigMutation, DeleteSensorConfigMutationVariables>(DeleteSensorConfigDocument, options);
      }
export type DeleteSensorConfigMutationHookResult = ReturnType<typeof useDeleteSensorConfigMutation>;
export type DeleteSensorConfigMutationResult = Apollo.MutationResult<DeleteSensorConfigMutation>;
export type DeleteSensorConfigMutationOptions = Apollo.BaseMutationOptions<DeleteSensorConfigMutation, DeleteSensorConfigMutationVariables>;
export const CreateTenantDocument = gql`
    mutation CreateTenant($input: CreateTenantInput!) {
  createTenant(input: $input) {
    id
    name
    companyName
    email
    phone
    isActive
    greenhouses {
      name
      doorPosition
      xDimension
      yDimension
      bayCount
      isHorizontal
    }
    createdAt
    updatedAt
  }
}
    `;
export type CreateTenantMutationFn = Apollo.MutationFunction<CreateTenantMutation, CreateTenantMutationVariables>;

/**
 * __useCreateTenantMutation__
 *
 * To run a mutation, you first call `useCreateTenantMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTenantMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTenantMutation, { data, loading, error }] = useCreateTenantMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTenantMutation(baseOptions?: Apollo.MutationHookOptions<CreateTenantMutation, CreateTenantMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTenantMutation, CreateTenantMutationVariables>(CreateTenantDocument, options);
      }
export type CreateTenantMutationHookResult = ReturnType<typeof useCreateTenantMutation>;
export type CreateTenantMutationResult = Apollo.MutationResult<CreateTenantMutation>;
export type CreateTenantMutationOptions = Apollo.BaseMutationOptions<CreateTenantMutation, CreateTenantMutationVariables>;
export const UpdateTenantDocument = gql`
    mutation UpdateTenant($id: ID!, $input: UpdateTenantInput!) {
  updateTenant(id: $id, input: $input) {
    id
    name
    companyName
    email
    phone
    isActive
    greenhouses {
      name
      doorPosition
      xDimension
      yDimension
      bayCount
      isHorizontal
    }
    createdAt
    updatedAt
  }
}
    `;
export type UpdateTenantMutationFn = Apollo.MutationFunction<UpdateTenantMutation, UpdateTenantMutationVariables>;

/**
 * __useUpdateTenantMutation__
 *
 * To run a mutation, you first call `useUpdateTenantMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTenantMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTenantMutation, { data, loading, error }] = useUpdateTenantMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTenantMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTenantMutation, UpdateTenantMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTenantMutation, UpdateTenantMutationVariables>(UpdateTenantDocument, options);
      }
export type UpdateTenantMutationHookResult = ReturnType<typeof useUpdateTenantMutation>;
export type UpdateTenantMutationResult = Apollo.MutationResult<UpdateTenantMutation>;
export type UpdateTenantMutationOptions = Apollo.BaseMutationOptions<UpdateTenantMutation, UpdateTenantMutationVariables>;
export const DeleteTenantDocument = gql`
    mutation DeleteTenant($id: ID!) {
  deleteTenant(id: $id)
}
    `;
export type DeleteTenantMutationFn = Apollo.MutationFunction<DeleteTenantMutation, DeleteTenantMutationVariables>;

/**
 * __useDeleteTenantMutation__
 *
 * To run a mutation, you first call `useDeleteTenantMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTenantMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTenantMutation, { data, loading, error }] = useDeleteTenantMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTenantMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTenantMutation, DeleteTenantMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTenantMutation, DeleteTenantMutationVariables>(DeleteTenantDocument, options);
      }
export type DeleteTenantMutationHookResult = ReturnType<typeof useDeleteTenantMutation>;
export type DeleteTenantMutationResult = Apollo.MutationResult<DeleteTenantMutation>;
export type DeleteTenantMutationOptions = Apollo.BaseMutationOptions<DeleteTenantMutation, DeleteTenantMutationVariables>;
export const SetTenantDisabledSensorFieldsDocument = gql`
    mutation SetTenantDisabledSensorFields($fields: [String!]!, $tenantId: ID) {
  setTenantDisabledSensorFields(fields: $fields, tenantId: $tenantId) {
    id
    disabledSensorFields
  }
}
    `;
export type SetTenantDisabledSensorFieldsMutationFn = Apollo.MutationFunction<SetTenantDisabledSensorFieldsMutation, SetTenantDisabledSensorFieldsMutationVariables>;

/**
 * __useSetTenantDisabledSensorFieldsMutation__
 *
 * To run a mutation, you first call `useSetTenantDisabledSensorFieldsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetTenantDisabledSensorFieldsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setTenantDisabledSensorFieldsMutation, { data, loading, error }] = useSetTenantDisabledSensorFieldsMutation({
 *   variables: {
 *      fields: // value for 'fields'
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useSetTenantDisabledSensorFieldsMutation(baseOptions?: Apollo.MutationHookOptions<SetTenantDisabledSensorFieldsMutation, SetTenantDisabledSensorFieldsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetTenantDisabledSensorFieldsMutation, SetTenantDisabledSensorFieldsMutationVariables>(SetTenantDisabledSensorFieldsDocument, options);
      }
export type SetTenantDisabledSensorFieldsMutationHookResult = ReturnType<typeof useSetTenantDisabledSensorFieldsMutation>;
export type SetTenantDisabledSensorFieldsMutationResult = Apollo.MutationResult<SetTenantDisabledSensorFieldsMutation>;
export type SetTenantDisabledSensorFieldsMutationOptions = Apollo.BaseMutationOptions<SetTenantDisabledSensorFieldsMutation, SetTenantDisabledSensorFieldsMutationVariables>;
export const SetTenantHarvestDashboardItemsDocument = gql`
    mutation SetTenantHarvestDashboardItems($hiddenItems: [String!]!, $tenantId: ID) {
  setTenantHarvestDashboardItems(hiddenItems: $hiddenItems, tenantId: $tenantId) {
    id
    hiddenHarvestDashboardItems
  }
}
    `;
export type SetTenantHarvestDashboardItemsMutationFn = Apollo.MutationFunction<SetTenantHarvestDashboardItemsMutation, SetTenantHarvestDashboardItemsMutationVariables>;

/**
 * __useSetTenantHarvestDashboardItemsMutation__
 *
 * To run a mutation, you first call `useSetTenantHarvestDashboardItemsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetTenantHarvestDashboardItemsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setTenantHarvestDashboardItemsMutation, { data, loading, error }] = useSetTenantHarvestDashboardItemsMutation({
 *   variables: {
 *      hiddenItems: // value for 'hiddenItems'
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useSetTenantHarvestDashboardItemsMutation(baseOptions?: Apollo.MutationHookOptions<SetTenantHarvestDashboardItemsMutation, SetTenantHarvestDashboardItemsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetTenantHarvestDashboardItemsMutation, SetTenantHarvestDashboardItemsMutationVariables>(SetTenantHarvestDashboardItemsDocument, options);
      }
export type SetTenantHarvestDashboardItemsMutationHookResult = ReturnType<typeof useSetTenantHarvestDashboardItemsMutation>;
export type SetTenantHarvestDashboardItemsMutationResult = Apollo.MutationResult<SetTenantHarvestDashboardItemsMutation>;
export type SetTenantHarvestDashboardItemsMutationOptions = Apollo.BaseMutationOptions<SetTenantHarvestDashboardItemsMutation, SetTenantHarvestDashboardItemsMutationVariables>;
export const CreateUserDocument = gql`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    clerkUserId
    email
    firstName
    lastName
    imageUrl
    role
    tenantId
    isActive
    status
    createdAt
    updatedAt
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    clerkUserId
    email
    firstName
    lastName
    imageUrl
    role
    tenantId
    isActive
    createdAt
    updatedAt
  }
}
    `;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const DeleteUserDocument = gql`
    mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}
    `;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, options);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const SetMyLanguageDocument = gql`
    mutation SetMyLanguage($language: String!) {
  setMyLanguage(language: $language) {
    id
    preferredLanguage
  }
}
    `;
export type SetMyLanguageMutationFn = Apollo.MutationFunction<SetMyLanguageMutation, SetMyLanguageMutationVariables>;

/**
 * __useSetMyLanguageMutation__
 *
 * To run a mutation, you first call `useSetMyLanguageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetMyLanguageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setMyLanguageMutation, { data, loading, error }] = useSetMyLanguageMutation({
 *   variables: {
 *      language: // value for 'language'
 *   },
 * });
 */
export function useSetMyLanguageMutation(baseOptions?: Apollo.MutationHookOptions<SetMyLanguageMutation, SetMyLanguageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetMyLanguageMutation, SetMyLanguageMutationVariables>(SetMyLanguageDocument, options);
      }
export type SetMyLanguageMutationHookResult = ReturnType<typeof useSetMyLanguageMutation>;
export type SetMyLanguageMutationResult = Apollo.MutationResult<SetMyLanguageMutation>;
export type SetMyLanguageMutationOptions = Apollo.BaseMutationOptions<SetMyLanguageMutation, SetMyLanguageMutationVariables>;
export const SetMyFarmOverviewTimeRangeDocument = gql`
    mutation SetMyFarmOverviewTimeRange($value: String!) {
  setMyFarmOverviewTimeRange(value: $value) {
    id
    farmOverviewTimeRange
  }
}
    `;
export type SetMyFarmOverviewTimeRangeMutationFn = Apollo.MutationFunction<SetMyFarmOverviewTimeRangeMutation, SetMyFarmOverviewTimeRangeMutationVariables>;

/**
 * __useSetMyFarmOverviewTimeRangeMutation__
 *
 * To run a mutation, you first call `useSetMyFarmOverviewTimeRangeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetMyFarmOverviewTimeRangeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setMyFarmOverviewTimeRangeMutation, { data, loading, error }] = useSetMyFarmOverviewTimeRangeMutation({
 *   variables: {
 *      value: // value for 'value'
 *   },
 * });
 */
export function useSetMyFarmOverviewTimeRangeMutation(baseOptions?: Apollo.MutationHookOptions<SetMyFarmOverviewTimeRangeMutation, SetMyFarmOverviewTimeRangeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetMyFarmOverviewTimeRangeMutation, SetMyFarmOverviewTimeRangeMutationVariables>(SetMyFarmOverviewTimeRangeDocument, options);
      }
export type SetMyFarmOverviewTimeRangeMutationHookResult = ReturnType<typeof useSetMyFarmOverviewTimeRangeMutation>;
export type SetMyFarmOverviewTimeRangeMutationResult = Apollo.MutationResult<SetMyFarmOverviewTimeRangeMutation>;
export type SetMyFarmOverviewTimeRangeMutationOptions = Apollo.BaseMutationOptions<SetMyFarmOverviewTimeRangeMutation, SetMyFarmOverviewTimeRangeMutationVariables>;
export const UpdateMyHarvestViewSettingsDocument = gql`
    mutation UpdateMyHarvestViewSettings($input: HarvestViewSettingsInput!) {
  updateMyHarvestViewSettings(input: $input) {
    id
    userSettings {
      harvestView {
        sort {
          field
          direction
        }
        range
        collapsedBatchIds
      }
    }
  }
}
    `;
export type UpdateMyHarvestViewSettingsMutationFn = Apollo.MutationFunction<UpdateMyHarvestViewSettingsMutation, UpdateMyHarvestViewSettingsMutationVariables>;

/**
 * __useUpdateMyHarvestViewSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateMyHarvestViewSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMyHarvestViewSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMyHarvestViewSettingsMutation, { data, loading, error }] = useUpdateMyHarvestViewSettingsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateMyHarvestViewSettingsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMyHarvestViewSettingsMutation, UpdateMyHarvestViewSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMyHarvestViewSettingsMutation, UpdateMyHarvestViewSettingsMutationVariables>(UpdateMyHarvestViewSettingsDocument, options);
      }
export type UpdateMyHarvestViewSettingsMutationHookResult = ReturnType<typeof useUpdateMyHarvestViewSettingsMutation>;
export type UpdateMyHarvestViewSettingsMutationResult = Apollo.MutationResult<UpdateMyHarvestViewSettingsMutation>;
export type UpdateMyHarvestViewSettingsMutationOptions = Apollo.BaseMutationOptions<UpdateMyHarvestViewSettingsMutation, UpdateMyHarvestViewSettingsMutationVariables>;
export const GetRecentSystemErrorsDocument = gql`
    query GetRecentSystemErrors($limit: Float, $severity: ReportSeverity, $source: ErrorSource, $isResolved: Boolean) {
  getRecentSystemErrors(
    limit: $limit
    severity: $severity
    source: $source
    isResolved: $isResolved
  ) {
    id
    source
    errorType
    severity
    errorMessage
    component
    action
    occurrenceCount
    isResolved
    createdAt
    updatedAt
    lastOccurredAt
    user {
      firstName
      lastName
      email
      id
      isActive
      createdAt
      updatedAt
      clerkUserId
      role
    }
    tenant {
      id
      isActive
      createdAt
      updatedAt
      name
      disabledSensorFields
      hiddenHarvestDashboardItems
    }
  }
}
    `;

/**
 * __useGetRecentSystemErrorsQuery__
 *
 * To run a query within a React component, call `useGetRecentSystemErrorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecentSystemErrorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecentSystemErrorsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      severity: // value for 'severity'
 *      source: // value for 'source'
 *      isResolved: // value for 'isResolved'
 *   },
 * });
 */
export function useGetRecentSystemErrorsQuery(baseOptions?: Apollo.QueryHookOptions<GetRecentSystemErrorsQuery, GetRecentSystemErrorsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecentSystemErrorsQuery, GetRecentSystemErrorsQueryVariables>(GetRecentSystemErrorsDocument, options);
      }
export function useGetRecentSystemErrorsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecentSystemErrorsQuery, GetRecentSystemErrorsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecentSystemErrorsQuery, GetRecentSystemErrorsQueryVariables>(GetRecentSystemErrorsDocument, options);
        }
// @ts-ignore
export function useGetRecentSystemErrorsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecentSystemErrorsQuery, GetRecentSystemErrorsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecentSystemErrorsQuery, GetRecentSystemErrorsQueryVariables>;
export function useGetRecentSystemErrorsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecentSystemErrorsQuery, GetRecentSystemErrorsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecentSystemErrorsQuery | undefined, GetRecentSystemErrorsQueryVariables>;
export function useGetRecentSystemErrorsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecentSystemErrorsQuery, GetRecentSystemErrorsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecentSystemErrorsQuery, GetRecentSystemErrorsQueryVariables>(GetRecentSystemErrorsDocument, options);
        }
export type GetRecentSystemErrorsQueryHookResult = ReturnType<typeof useGetRecentSystemErrorsQuery>;
export type GetRecentSystemErrorsLazyQueryHookResult = ReturnType<typeof useGetRecentSystemErrorsLazyQuery>;
export type GetRecentSystemErrorsSuspenseQueryHookResult = ReturnType<typeof useGetRecentSystemErrorsSuspenseQuery>;
export type GetRecentSystemErrorsQueryResult = Apollo.QueryResult<GetRecentSystemErrorsQuery, GetRecentSystemErrorsQueryVariables>;
export const GetSystemErrorStatsDocument = gql`
    query GetSystemErrorStats($hours: Float) {
  getSystemErrorStats(hours: $hours)
}
    `;

/**
 * __useGetSystemErrorStatsQuery__
 *
 * To run a query within a React component, call `useGetSystemErrorStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSystemErrorStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSystemErrorStatsQuery({
 *   variables: {
 *      hours: // value for 'hours'
 *   },
 * });
 */
export function useGetSystemErrorStatsQuery(baseOptions?: Apollo.QueryHookOptions<GetSystemErrorStatsQuery, GetSystemErrorStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSystemErrorStatsQuery, GetSystemErrorStatsQueryVariables>(GetSystemErrorStatsDocument, options);
      }
export function useGetSystemErrorStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSystemErrorStatsQuery, GetSystemErrorStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSystemErrorStatsQuery, GetSystemErrorStatsQueryVariables>(GetSystemErrorStatsDocument, options);
        }
// @ts-ignore
export function useGetSystemErrorStatsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSystemErrorStatsQuery, GetSystemErrorStatsQueryVariables>): Apollo.UseSuspenseQueryResult<GetSystemErrorStatsQuery, GetSystemErrorStatsQueryVariables>;
export function useGetSystemErrorStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSystemErrorStatsQuery, GetSystemErrorStatsQueryVariables>): Apollo.UseSuspenseQueryResult<GetSystemErrorStatsQuery | undefined, GetSystemErrorStatsQueryVariables>;
export function useGetSystemErrorStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSystemErrorStatsQuery, GetSystemErrorStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSystemErrorStatsQuery, GetSystemErrorStatsQueryVariables>(GetSystemErrorStatsDocument, options);
        }
export type GetSystemErrorStatsQueryHookResult = ReturnType<typeof useGetSystemErrorStatsQuery>;
export type GetSystemErrorStatsLazyQueryHookResult = ReturnType<typeof useGetSystemErrorStatsLazyQuery>;
export type GetSystemErrorStatsSuspenseQueryHookResult = ReturnType<typeof useGetSystemErrorStatsSuspenseQuery>;
export type GetSystemErrorStatsQueryResult = Apollo.QueryResult<GetSystemErrorStatsQuery, GetSystemErrorStatsQueryVariables>;
export const ResolveSystemErrorDocument = gql`
    mutation ResolveSystemError($errorId: ID!, $resolutionNotes: String) {
  resolveSystemError(errorId: $errorId, resolutionNotes: $resolutionNotes) {
    id
    isResolved
    resolvedAt
  }
}
    `;
export type ResolveSystemErrorMutationFn = Apollo.MutationFunction<ResolveSystemErrorMutation, ResolveSystemErrorMutationVariables>;

/**
 * __useResolveSystemErrorMutation__
 *
 * To run a mutation, you first call `useResolveSystemErrorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResolveSystemErrorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resolveSystemErrorMutation, { data, loading, error }] = useResolveSystemErrorMutation({
 *   variables: {
 *      errorId: // value for 'errorId'
 *      resolutionNotes: // value for 'resolutionNotes'
 *   },
 * });
 */
export function useResolveSystemErrorMutation(baseOptions?: Apollo.MutationHookOptions<ResolveSystemErrorMutation, ResolveSystemErrorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResolveSystemErrorMutation, ResolveSystemErrorMutationVariables>(ResolveSystemErrorDocument, options);
      }
export type ResolveSystemErrorMutationHookResult = ReturnType<typeof useResolveSystemErrorMutation>;
export type ResolveSystemErrorMutationResult = Apollo.MutationResult<ResolveSystemErrorMutation>;
export type ResolveSystemErrorMutationOptions = Apollo.BaseMutationOptions<ResolveSystemErrorMutation, ResolveSystemErrorMutationVariables>;
export const AlertsDocument = gql`
    query Alerts($filter: AlertsFilterInput) {
  alerts(filter: $filter) {
    id
    tenantId
    tunnelId
    sensorName
    value
    status
    severity
    description
    timestamp
    field
    measurement
    device
    greenhouse
    city
    column
    row
    profile
    acknowledgedById
    acknowledgedTime
    acknowledgedBy {
      id
      firstName
      lastName
      email
    }
    resolvedById
    resolvedTime
    resolvedBy {
      id
      firstName
      lastName
      email
    }
    createdAt
    updatedAt
    tenant {
      id
      name
    }
  }
}
    `;

/**
 * __useAlertsQuery__
 *
 * To run a query within a React component, call `useAlertsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAlertsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAlertsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useAlertsQuery(baseOptions?: Apollo.QueryHookOptions<AlertsQuery, AlertsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AlertsQuery, AlertsQueryVariables>(AlertsDocument, options);
      }
export function useAlertsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AlertsQuery, AlertsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AlertsQuery, AlertsQueryVariables>(AlertsDocument, options);
        }
// @ts-ignore
export function useAlertsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AlertsQuery, AlertsQueryVariables>): Apollo.UseSuspenseQueryResult<AlertsQuery, AlertsQueryVariables>;
export function useAlertsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AlertsQuery, AlertsQueryVariables>): Apollo.UseSuspenseQueryResult<AlertsQuery | undefined, AlertsQueryVariables>;
export function useAlertsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AlertsQuery, AlertsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AlertsQuery, AlertsQueryVariables>(AlertsDocument, options);
        }
export type AlertsQueryHookResult = ReturnType<typeof useAlertsQuery>;
export type AlertsLazyQueryHookResult = ReturnType<typeof useAlertsLazyQuery>;
export type AlertsSuspenseQueryHookResult = ReturnType<typeof useAlertsSuspenseQuery>;
export type AlertsQueryResult = Apollo.QueryResult<AlertsQuery, AlertsQueryVariables>;
export const AlertDocument = gql`
    query Alert($id: ID!) {
  alert(id: $id) {
    id
    tenantId
    tunnelId
    sensorName
    value
    status
    severity
    description
    timestamp
    field
    measurement
    device
    greenhouse
    city
    column
    row
    profile
    acknowledgedById
    acknowledgedTime
    acknowledgedBy {
      id
      firstName
      lastName
      email
    }
    resolvedById
    resolvedTime
    resolvedBy {
      id
      firstName
      lastName
      email
    }
    createdAt
    updatedAt
    tenant {
      id
      name
    }
  }
}
    `;

/**
 * __useAlertQuery__
 *
 * To run a query within a React component, call `useAlertQuery` and pass it any options that fit your needs.
 * When your component renders, `useAlertQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAlertQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useAlertQuery(baseOptions: Apollo.QueryHookOptions<AlertQuery, AlertQueryVariables> & ({ variables: AlertQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AlertQuery, AlertQueryVariables>(AlertDocument, options);
      }
export function useAlertLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AlertQuery, AlertQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AlertQuery, AlertQueryVariables>(AlertDocument, options);
        }
// @ts-ignore
export function useAlertSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AlertQuery, AlertQueryVariables>): Apollo.UseSuspenseQueryResult<AlertQuery, AlertQueryVariables>;
export function useAlertSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AlertQuery, AlertQueryVariables>): Apollo.UseSuspenseQueryResult<AlertQuery | undefined, AlertQueryVariables>;
export function useAlertSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AlertQuery, AlertQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AlertQuery, AlertQueryVariables>(AlertDocument, options);
        }
export type AlertQueryHookResult = ReturnType<typeof useAlertQuery>;
export type AlertLazyQueryHookResult = ReturnType<typeof useAlertLazyQuery>;
export type AlertSuspenseQueryHookResult = ReturnType<typeof useAlertSuspenseQuery>;
export type AlertQueryResult = Apollo.QueryResult<AlertQuery, AlertQueryVariables>;
export const CreateAlertDocument = gql`
    mutation CreateAlert($input: CreateAlertInput!) {
  createAlert(input: $input) {
    id
    tenantId
    tunnelId
    sensorName
    value
    status
    severity
    description
    timestamp
    field
    measurement
    device
    greenhouse
    city
    column
    row
    profile
    createdAt
    updatedAt
  }
}
    `;
export type CreateAlertMutationFn = Apollo.MutationFunction<CreateAlertMutation, CreateAlertMutationVariables>;

/**
 * __useCreateAlertMutation__
 *
 * To run a mutation, you first call `useCreateAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAlertMutation, { data, loading, error }] = useCreateAlertMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateAlertMutation(baseOptions?: Apollo.MutationHookOptions<CreateAlertMutation, CreateAlertMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateAlertMutation, CreateAlertMutationVariables>(CreateAlertDocument, options);
      }
export type CreateAlertMutationHookResult = ReturnType<typeof useCreateAlertMutation>;
export type CreateAlertMutationResult = Apollo.MutationResult<CreateAlertMutation>;
export type CreateAlertMutationOptions = Apollo.BaseMutationOptions<CreateAlertMutation, CreateAlertMutationVariables>;
export const UpdateAlertDocument = gql`
    mutation UpdateAlert($id: ID!, $input: UpdateAlertInput!) {
  updateAlert(id: $id, input: $input) {
    id
    tenantId
    tunnelId
    sensorName
    value
    status
    severity
    timestamp
    description
    field
    measurement
    device
    greenhouse
    city
    column
    row
    profile
    createdAt
    updatedAt
  }
}
    `;
export type UpdateAlertMutationFn = Apollo.MutationFunction<UpdateAlertMutation, UpdateAlertMutationVariables>;

/**
 * __useUpdateAlertMutation__
 *
 * To run a mutation, you first call `useUpdateAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAlertMutation, { data, loading, error }] = useUpdateAlertMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateAlertMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAlertMutation, UpdateAlertMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAlertMutation, UpdateAlertMutationVariables>(UpdateAlertDocument, options);
      }
export type UpdateAlertMutationHookResult = ReturnType<typeof useUpdateAlertMutation>;
export type UpdateAlertMutationResult = Apollo.MutationResult<UpdateAlertMutation>;
export type UpdateAlertMutationOptions = Apollo.BaseMutationOptions<UpdateAlertMutation, UpdateAlertMutationVariables>;
export const AcknowledgeAlertDocument = gql`
    mutation AcknowledgeAlert($id: ID!) {
  acknowledgeAlert(id: $id) {
    id
    status
    updatedAt
  }
}
    `;
export type AcknowledgeAlertMutationFn = Apollo.MutationFunction<AcknowledgeAlertMutation, AcknowledgeAlertMutationVariables>;

/**
 * __useAcknowledgeAlertMutation__
 *
 * To run a mutation, you first call `useAcknowledgeAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAcknowledgeAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [acknowledgeAlertMutation, { data, loading, error }] = useAcknowledgeAlertMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useAcknowledgeAlertMutation(baseOptions?: Apollo.MutationHookOptions<AcknowledgeAlertMutation, AcknowledgeAlertMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AcknowledgeAlertMutation, AcknowledgeAlertMutationVariables>(AcknowledgeAlertDocument, options);
      }
export type AcknowledgeAlertMutationHookResult = ReturnType<typeof useAcknowledgeAlertMutation>;
export type AcknowledgeAlertMutationResult = Apollo.MutationResult<AcknowledgeAlertMutation>;
export type AcknowledgeAlertMutationOptions = Apollo.BaseMutationOptions<AcknowledgeAlertMutation, AcknowledgeAlertMutationVariables>;
export const ResolveAlertDocument = gql`
    mutation ResolveAlert($id: ID!) {
  resolveAlert(id: $id) {
    id
    status
    updatedAt
  }
}
    `;
export type ResolveAlertMutationFn = Apollo.MutationFunction<ResolveAlertMutation, ResolveAlertMutationVariables>;

/**
 * __useResolveAlertMutation__
 *
 * To run a mutation, you first call `useResolveAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResolveAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resolveAlertMutation, { data, loading, error }] = useResolveAlertMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useResolveAlertMutation(baseOptions?: Apollo.MutationHookOptions<ResolveAlertMutation, ResolveAlertMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResolveAlertMutation, ResolveAlertMutationVariables>(ResolveAlertDocument, options);
      }
export type ResolveAlertMutationHookResult = ReturnType<typeof useResolveAlertMutation>;
export type ResolveAlertMutationResult = Apollo.MutationResult<ResolveAlertMutation>;
export type ResolveAlertMutationOptions = Apollo.BaseMutationOptions<ResolveAlertMutation, ResolveAlertMutationVariables>;
export const SoftDeleteAlertDocument = gql`
    mutation SoftDeleteAlert($id: ID!) {
  softDeleteAlert(id: $id)
}
    `;
export type SoftDeleteAlertMutationFn = Apollo.MutationFunction<SoftDeleteAlertMutation, SoftDeleteAlertMutationVariables>;

/**
 * __useSoftDeleteAlertMutation__
 *
 * To run a mutation, you first call `useSoftDeleteAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteAlertMutation, { data, loading, error }] = useSoftDeleteAlertMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSoftDeleteAlertMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteAlertMutation, SoftDeleteAlertMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteAlertMutation, SoftDeleteAlertMutationVariables>(SoftDeleteAlertDocument, options);
      }
export type SoftDeleteAlertMutationHookResult = ReturnType<typeof useSoftDeleteAlertMutation>;
export type SoftDeleteAlertMutationResult = Apollo.MutationResult<SoftDeleteAlertMutation>;
export type SoftDeleteAlertMutationOptions = Apollo.BaseMutationOptions<SoftDeleteAlertMutation, SoftDeleteAlertMutationVariables>;
export const DeleteAlertDocument = gql`
    mutation DeleteAlert($id: ID!) {
  deleteAlert(id: $id)
}
    `;
export type DeleteAlertMutationFn = Apollo.MutationFunction<DeleteAlertMutation, DeleteAlertMutationVariables>;

/**
 * __useDeleteAlertMutation__
 *
 * To run a mutation, you first call `useDeleteAlertMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAlertMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAlertMutation, { data, loading, error }] = useDeleteAlertMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteAlertMutation(baseOptions?: Apollo.MutationHookOptions<DeleteAlertMutation, DeleteAlertMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteAlertMutation, DeleteAlertMutationVariables>(DeleteAlertDocument, options);
      }
export type DeleteAlertMutationHookResult = ReturnType<typeof useDeleteAlertMutation>;
export type DeleteAlertMutationResult = Apollo.MutationResult<DeleteAlertMutation>;
export type DeleteAlertMutationOptions = Apollo.BaseMutationOptions<DeleteAlertMutation, DeleteAlertMutationVariables>;
export const BatchesDocument = gql`
    query Batches($filter: BatchFilterInput, $sort: BatchSortInput) {
  batches(filter: $filter, sort: $sort) {
    ...BatchFields
  }
}
    ${BatchFieldsFragmentDoc}`;

/**
 * __useBatchesQuery__
 *
 * To run a query within a React component, call `useBatchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useBatchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBatchesQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      sort: // value for 'sort'
 *   },
 * });
 */
export function useBatchesQuery(baseOptions?: Apollo.QueryHookOptions<BatchesQuery, BatchesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BatchesQuery, BatchesQueryVariables>(BatchesDocument, options);
      }
export function useBatchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BatchesQuery, BatchesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BatchesQuery, BatchesQueryVariables>(BatchesDocument, options);
        }
// @ts-ignore
export function useBatchesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<BatchesQuery, BatchesQueryVariables>): Apollo.UseSuspenseQueryResult<BatchesQuery, BatchesQueryVariables>;
export function useBatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BatchesQuery, BatchesQueryVariables>): Apollo.UseSuspenseQueryResult<BatchesQuery | undefined, BatchesQueryVariables>;
export function useBatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BatchesQuery, BatchesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BatchesQuery, BatchesQueryVariables>(BatchesDocument, options);
        }
export type BatchesQueryHookResult = ReturnType<typeof useBatchesQuery>;
export type BatchesLazyQueryHookResult = ReturnType<typeof useBatchesLazyQuery>;
export type BatchesSuspenseQueryHookResult = ReturnType<typeof useBatchesSuspenseQuery>;
export type BatchesQueryResult = Apollo.QueryResult<BatchesQuery, BatchesQueryVariables>;
export const BatchDocument = gql`
    query Batch($id: ID!) {
  batch(id: $id) {
    ...BatchFields
  }
}
    ${BatchFieldsFragmentDoc}`;

/**
 * __useBatchQuery__
 *
 * To run a query within a React component, call `useBatchQuery` and pass it any options that fit your needs.
 * When your component renders, `useBatchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBatchQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useBatchQuery(baseOptions: Apollo.QueryHookOptions<BatchQuery, BatchQueryVariables> & ({ variables: BatchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BatchQuery, BatchQueryVariables>(BatchDocument, options);
      }
export function useBatchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BatchQuery, BatchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BatchQuery, BatchQueryVariables>(BatchDocument, options);
        }
// @ts-ignore
export function useBatchSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<BatchQuery, BatchQueryVariables>): Apollo.UseSuspenseQueryResult<BatchQuery, BatchQueryVariables>;
export function useBatchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BatchQuery, BatchQueryVariables>): Apollo.UseSuspenseQueryResult<BatchQuery | undefined, BatchQueryVariables>;
export function useBatchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<BatchQuery, BatchQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<BatchQuery, BatchQueryVariables>(BatchDocument, options);
        }
export type BatchQueryHookResult = ReturnType<typeof useBatchQuery>;
export type BatchLazyQueryHookResult = ReturnType<typeof useBatchLazyQuery>;
export type BatchSuspenseQueryHookResult = ReturnType<typeof useBatchSuspenseQuery>;
export type BatchQueryResult = Apollo.QueryResult<BatchQuery, BatchQueryVariables>;
export const HarvestBatchesDocument = gql`
    query HarvestBatches {
  harvestBatches {
    id
    name
    species
    variety
    greenhouse
    plantingDate
    status
    yieldPerPlant
  }
}
    `;

/**
 * __useHarvestBatchesQuery__
 *
 * To run a query within a React component, call `useHarvestBatchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHarvestBatchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHarvestBatchesQuery({
 *   variables: {
 *   },
 * });
 */
export function useHarvestBatchesQuery(baseOptions?: Apollo.QueryHookOptions<HarvestBatchesQuery, HarvestBatchesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HarvestBatchesQuery, HarvestBatchesQueryVariables>(HarvestBatchesDocument, options);
      }
export function useHarvestBatchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HarvestBatchesQuery, HarvestBatchesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HarvestBatchesQuery, HarvestBatchesQueryVariables>(HarvestBatchesDocument, options);
        }
// @ts-ignore
export function useHarvestBatchesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<HarvestBatchesQuery, HarvestBatchesQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestBatchesQuery, HarvestBatchesQueryVariables>;
export function useHarvestBatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestBatchesQuery, HarvestBatchesQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestBatchesQuery | undefined, HarvestBatchesQueryVariables>;
export function useHarvestBatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestBatchesQuery, HarvestBatchesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<HarvestBatchesQuery, HarvestBatchesQueryVariables>(HarvestBatchesDocument, options);
        }
export type HarvestBatchesQueryHookResult = ReturnType<typeof useHarvestBatchesQuery>;
export type HarvestBatchesLazyQueryHookResult = ReturnType<typeof useHarvestBatchesLazyQuery>;
export type HarvestBatchesSuspenseQueryHookResult = ReturnType<typeof useHarvestBatchesSuspenseQuery>;
export type HarvestBatchesQueryResult = Apollo.QueryResult<HarvestBatchesQuery, HarvestBatchesQueryVariables>;
export const CameraLivestreamFeedsDocument = gql`
    query CameraLivestreamFeeds {
  cameraLivestreamFeeds {
    id
    name
    path
    snapshotUrl
    updatedAt
    expiresAt
    available
    error
  }
}
    `;

/**
 * __useCameraLivestreamFeedsQuery__
 *
 * To run a query within a React component, call `useCameraLivestreamFeedsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCameraLivestreamFeedsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCameraLivestreamFeedsQuery({
 *   variables: {
 *   },
 * });
 */
export function useCameraLivestreamFeedsQuery(baseOptions?: Apollo.QueryHookOptions<CameraLivestreamFeedsQuery, CameraLivestreamFeedsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CameraLivestreamFeedsQuery, CameraLivestreamFeedsQueryVariables>(CameraLivestreamFeedsDocument, options);
      }
export function useCameraLivestreamFeedsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CameraLivestreamFeedsQuery, CameraLivestreamFeedsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CameraLivestreamFeedsQuery, CameraLivestreamFeedsQueryVariables>(CameraLivestreamFeedsDocument, options);
        }
// @ts-ignore
export function useCameraLivestreamFeedsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CameraLivestreamFeedsQuery, CameraLivestreamFeedsQueryVariables>): Apollo.UseSuspenseQueryResult<CameraLivestreamFeedsQuery, CameraLivestreamFeedsQueryVariables>;
export function useCameraLivestreamFeedsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CameraLivestreamFeedsQuery, CameraLivestreamFeedsQueryVariables>): Apollo.UseSuspenseQueryResult<CameraLivestreamFeedsQuery | undefined, CameraLivestreamFeedsQueryVariables>;
export function useCameraLivestreamFeedsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CameraLivestreamFeedsQuery, CameraLivestreamFeedsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CameraLivestreamFeedsQuery, CameraLivestreamFeedsQueryVariables>(CameraLivestreamFeedsDocument, options);
        }
export type CameraLivestreamFeedsQueryHookResult = ReturnType<typeof useCameraLivestreamFeedsQuery>;
export type CameraLivestreamFeedsLazyQueryHookResult = ReturnType<typeof useCameraLivestreamFeedsLazyQuery>;
export type CameraLivestreamFeedsSuspenseQueryHookResult = ReturnType<typeof useCameraLivestreamFeedsSuspenseQuery>;
export type CameraLivestreamFeedsQueryResult = Apollo.QueryResult<CameraLivestreamFeedsQuery, CameraLivestreamFeedsQueryVariables>;
export const CameraLivestreamStreamUrlDocument = gql`
    query CameraLivestreamStreamUrl($cameraId: String!) {
  cameraLivestreamStreamUrl(cameraId: $cameraId) {
    cameraId
    url
    expiresAt
    available
    error
  }
}
    `;

/**
 * __useCameraLivestreamStreamUrlQuery__
 *
 * To run a query within a React component, call `useCameraLivestreamStreamUrlQuery` and pass it any options that fit your needs.
 * When your component renders, `useCameraLivestreamStreamUrlQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCameraLivestreamStreamUrlQuery({
 *   variables: {
 *      cameraId: // value for 'cameraId'
 *   },
 * });
 */
export function useCameraLivestreamStreamUrlQuery(baseOptions: Apollo.QueryHookOptions<CameraLivestreamStreamUrlQuery, CameraLivestreamStreamUrlQueryVariables> & ({ variables: CameraLivestreamStreamUrlQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CameraLivestreamStreamUrlQuery, CameraLivestreamStreamUrlQueryVariables>(CameraLivestreamStreamUrlDocument, options);
      }
export function useCameraLivestreamStreamUrlLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CameraLivestreamStreamUrlQuery, CameraLivestreamStreamUrlQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CameraLivestreamStreamUrlQuery, CameraLivestreamStreamUrlQueryVariables>(CameraLivestreamStreamUrlDocument, options);
        }
// @ts-ignore
export function useCameraLivestreamStreamUrlSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CameraLivestreamStreamUrlQuery, CameraLivestreamStreamUrlQueryVariables>): Apollo.UseSuspenseQueryResult<CameraLivestreamStreamUrlQuery, CameraLivestreamStreamUrlQueryVariables>;
export function useCameraLivestreamStreamUrlSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CameraLivestreamStreamUrlQuery, CameraLivestreamStreamUrlQueryVariables>): Apollo.UseSuspenseQueryResult<CameraLivestreamStreamUrlQuery | undefined, CameraLivestreamStreamUrlQueryVariables>;
export function useCameraLivestreamStreamUrlSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CameraLivestreamStreamUrlQuery, CameraLivestreamStreamUrlQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CameraLivestreamStreamUrlQuery, CameraLivestreamStreamUrlQueryVariables>(CameraLivestreamStreamUrlDocument, options);
        }
export type CameraLivestreamStreamUrlQueryHookResult = ReturnType<typeof useCameraLivestreamStreamUrlQuery>;
export type CameraLivestreamStreamUrlLazyQueryHookResult = ReturnType<typeof useCameraLivestreamStreamUrlLazyQuery>;
export type CameraLivestreamStreamUrlSuspenseQueryHookResult = ReturnType<typeof useCameraLivestreamStreamUrlSuspenseQuery>;
export type CameraLivestreamStreamUrlQueryResult = Apollo.QueryResult<CameraLivestreamStreamUrlQuery, CameraLivestreamStreamUrlQueryVariables>;
export const CropsDocument = gql`
    query Crops($greenhouseId: ID) {
  crops(greenhouseId: $greenhouseId) {
    id
    name
  }
}
    `;

/**
 * __useCropsQuery__
 *
 * To run a query within a React component, call `useCropsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCropsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCropsQuery({
 *   variables: {
 *      greenhouseId: // value for 'greenhouseId'
 *   },
 * });
 */
export function useCropsQuery(baseOptions?: Apollo.QueryHookOptions<CropsQuery, CropsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CropsQuery, CropsQueryVariables>(CropsDocument, options);
      }
export function useCropsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CropsQuery, CropsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CropsQuery, CropsQueryVariables>(CropsDocument, options);
        }
// @ts-ignore
export function useCropsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CropsQuery, CropsQueryVariables>): Apollo.UseSuspenseQueryResult<CropsQuery, CropsQueryVariables>;
export function useCropsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CropsQuery, CropsQueryVariables>): Apollo.UseSuspenseQueryResult<CropsQuery | undefined, CropsQueryVariables>;
export function useCropsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CropsQuery, CropsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CropsQuery, CropsQueryVariables>(CropsDocument, options);
        }
export type CropsQueryHookResult = ReturnType<typeof useCropsQuery>;
export type CropsLazyQueryHookResult = ReturnType<typeof useCropsLazyQuery>;
export type CropsSuspenseQueryHookResult = ReturnType<typeof useCropsSuspenseQuery>;
export type CropsQueryResult = Apollo.QueryResult<CropsQuery, CropsQueryVariables>;
export const VarietiesDocument = gql`
    query Varieties($cropId: ID!) {
  varieties(cropId: $cropId) {
    id
    name
  }
}
    `;

/**
 * __useVarietiesQuery__
 *
 * To run a query within a React component, call `useVarietiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useVarietiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVarietiesQuery({
 *   variables: {
 *      cropId: // value for 'cropId'
 *   },
 * });
 */
export function useVarietiesQuery(baseOptions: Apollo.QueryHookOptions<VarietiesQuery, VarietiesQueryVariables> & ({ variables: VarietiesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<VarietiesQuery, VarietiesQueryVariables>(VarietiesDocument, options);
      }
export function useVarietiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<VarietiesQuery, VarietiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<VarietiesQuery, VarietiesQueryVariables>(VarietiesDocument, options);
        }
// @ts-ignore
export function useVarietiesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<VarietiesQuery, VarietiesQueryVariables>): Apollo.UseSuspenseQueryResult<VarietiesQuery, VarietiesQueryVariables>;
export function useVarietiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<VarietiesQuery, VarietiesQueryVariables>): Apollo.UseSuspenseQueryResult<VarietiesQuery | undefined, VarietiesQueryVariables>;
export function useVarietiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<VarietiesQuery, VarietiesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<VarietiesQuery, VarietiesQueryVariables>(VarietiesDocument, options);
        }
export type VarietiesQueryHookResult = ReturnType<typeof useVarietiesQuery>;
export type VarietiesLazyQueryHookResult = ReturnType<typeof useVarietiesLazyQuery>;
export type VarietiesSuspenseQueryHookResult = ReturnType<typeof useVarietiesSuspenseQuery>;
export type VarietiesQueryResult = Apollo.QueryResult<VarietiesQuery, VarietiesQueryVariables>;
export const FarmConfigDocument = gql`
    query FarmConfig($tenantId: ID) {
  farmConfig(tenantId: $tenantId) {
    id
    tenantId
    bayCount
    polesMax
    chambersCount
    updatedAt
  }
}
    `;

/**
 * __useFarmConfigQuery__
 *
 * To run a query within a React component, call `useFarmConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useFarmConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFarmConfigQuery({
 *   variables: {
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useFarmConfigQuery(baseOptions?: Apollo.QueryHookOptions<FarmConfigQuery, FarmConfigQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FarmConfigQuery, FarmConfigQueryVariables>(FarmConfigDocument, options);
      }
export function useFarmConfigLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FarmConfigQuery, FarmConfigQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FarmConfigQuery, FarmConfigQueryVariables>(FarmConfigDocument, options);
        }
// @ts-ignore
export function useFarmConfigSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<FarmConfigQuery, FarmConfigQueryVariables>): Apollo.UseSuspenseQueryResult<FarmConfigQuery, FarmConfigQueryVariables>;
export function useFarmConfigSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FarmConfigQuery, FarmConfigQueryVariables>): Apollo.UseSuspenseQueryResult<FarmConfigQuery | undefined, FarmConfigQueryVariables>;
export function useFarmConfigSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FarmConfigQuery, FarmConfigQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FarmConfigQuery, FarmConfigQueryVariables>(FarmConfigDocument, options);
        }
export type FarmConfigQueryHookResult = ReturnType<typeof useFarmConfigQuery>;
export type FarmConfigLazyQueryHookResult = ReturnType<typeof useFarmConfigLazyQuery>;
export type FarmConfigSuspenseQueryHookResult = ReturnType<typeof useFarmConfigSuspenseQuery>;
export type FarmConfigQueryResult = Apollo.QueryResult<FarmConfigQuery, FarmConfigQueryVariables>;
export const FeaturesDocument = gql`
    query Features {
  features {
    id
    key
    name
    description
    category
    isActive
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useFeaturesQuery__
 *
 * To run a query within a React component, call `useFeaturesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeaturesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFeaturesQuery({
 *   variables: {
 *   },
 * });
 */
export function useFeaturesQuery(baseOptions?: Apollo.QueryHookOptions<FeaturesQuery, FeaturesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FeaturesQuery, FeaturesQueryVariables>(FeaturesDocument, options);
      }
export function useFeaturesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FeaturesQuery, FeaturesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FeaturesQuery, FeaturesQueryVariables>(FeaturesDocument, options);
        }
// @ts-ignore
export function useFeaturesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<FeaturesQuery, FeaturesQueryVariables>): Apollo.UseSuspenseQueryResult<FeaturesQuery, FeaturesQueryVariables>;
export function useFeaturesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FeaturesQuery, FeaturesQueryVariables>): Apollo.UseSuspenseQueryResult<FeaturesQuery | undefined, FeaturesQueryVariables>;
export function useFeaturesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FeaturesQuery, FeaturesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FeaturesQuery, FeaturesQueryVariables>(FeaturesDocument, options);
        }
export type FeaturesQueryHookResult = ReturnType<typeof useFeaturesQuery>;
export type FeaturesLazyQueryHookResult = ReturnType<typeof useFeaturesLazyQuery>;
export type FeaturesSuspenseQueryHookResult = ReturnType<typeof useFeaturesSuspenseQuery>;
export type FeaturesQueryResult = Apollo.QueryResult<FeaturesQuery, FeaturesQueryVariables>;
export const FeaturesWithTenantStatusDocument = gql`
    query FeaturesWithTenantStatus($tenantId: ID) {
  featuresWithTenantStatus(tenantId: $tenantId) {
    id
    key
    name
    description
    category
    isActive
    enabledForTenant
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useFeaturesWithTenantStatusQuery__
 *
 * To run a query within a React component, call `useFeaturesWithTenantStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeaturesWithTenantStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFeaturesWithTenantStatusQuery({
 *   variables: {
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useFeaturesWithTenantStatusQuery(baseOptions?: Apollo.QueryHookOptions<FeaturesWithTenantStatusQuery, FeaturesWithTenantStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FeaturesWithTenantStatusQuery, FeaturesWithTenantStatusQueryVariables>(FeaturesWithTenantStatusDocument, options);
      }
export function useFeaturesWithTenantStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FeaturesWithTenantStatusQuery, FeaturesWithTenantStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FeaturesWithTenantStatusQuery, FeaturesWithTenantStatusQueryVariables>(FeaturesWithTenantStatusDocument, options);
        }
// @ts-ignore
export function useFeaturesWithTenantStatusSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<FeaturesWithTenantStatusQuery, FeaturesWithTenantStatusQueryVariables>): Apollo.UseSuspenseQueryResult<FeaturesWithTenantStatusQuery, FeaturesWithTenantStatusQueryVariables>;
export function useFeaturesWithTenantStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FeaturesWithTenantStatusQuery, FeaturesWithTenantStatusQueryVariables>): Apollo.UseSuspenseQueryResult<FeaturesWithTenantStatusQuery | undefined, FeaturesWithTenantStatusQueryVariables>;
export function useFeaturesWithTenantStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FeaturesWithTenantStatusQuery, FeaturesWithTenantStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FeaturesWithTenantStatusQuery, FeaturesWithTenantStatusQueryVariables>(FeaturesWithTenantStatusDocument, options);
        }
export type FeaturesWithTenantStatusQueryHookResult = ReturnType<typeof useFeaturesWithTenantStatusQuery>;
export type FeaturesWithTenantStatusLazyQueryHookResult = ReturnType<typeof useFeaturesWithTenantStatusLazyQuery>;
export type FeaturesWithTenantStatusSuspenseQueryHookResult = ReturnType<typeof useFeaturesWithTenantStatusSuspenseQuery>;
export type FeaturesWithTenantStatusQueryResult = Apollo.QueryResult<FeaturesWithTenantStatusQuery, FeaturesWithTenantStatusQueryVariables>;
export const FeatureDocument = gql`
    query Feature($id: ID!) {
  feature(id: $id) {
    id
    key
    name
    description
    category
    isActive
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useFeatureQuery__
 *
 * To run a query within a React component, call `useFeatureQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeatureQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFeatureQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFeatureQuery(baseOptions: Apollo.QueryHookOptions<FeatureQuery, FeatureQueryVariables> & ({ variables: FeatureQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FeatureQuery, FeatureQueryVariables>(FeatureDocument, options);
      }
export function useFeatureLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FeatureQuery, FeatureQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FeatureQuery, FeatureQueryVariables>(FeatureDocument, options);
        }
// @ts-ignore
export function useFeatureSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<FeatureQuery, FeatureQueryVariables>): Apollo.UseSuspenseQueryResult<FeatureQuery, FeatureQueryVariables>;
export function useFeatureSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FeatureQuery, FeatureQueryVariables>): Apollo.UseSuspenseQueryResult<FeatureQuery | undefined, FeatureQueryVariables>;
export function useFeatureSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FeatureQuery, FeatureQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FeatureQuery, FeatureQueryVariables>(FeatureDocument, options);
        }
export type FeatureQueryHookResult = ReturnType<typeof useFeatureQuery>;
export type FeatureLazyQueryHookResult = ReturnType<typeof useFeatureLazyQuery>;
export type FeatureSuspenseQueryHookResult = ReturnType<typeof useFeatureSuspenseQuery>;
export type FeatureQueryResult = Apollo.QueryResult<FeatureQuery, FeatureQueryVariables>;
export const TenantFeaturesDocument = gql`
    query TenantFeatures($tenantId: ID) {
  tenantFeatures(tenantId: $tenantId) {
    id
    tenantId
    featureId
    enabled
    createdAt
    updatedAt
    feature {
      id
      key
      name
      description
      category
      isActive
    }
  }
}
    `;

/**
 * __useTenantFeaturesQuery__
 *
 * To run a query within a React component, call `useTenantFeaturesQuery` and pass it any options that fit your needs.
 * When your component renders, `useTenantFeaturesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTenantFeaturesQuery({
 *   variables: {
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useTenantFeaturesQuery(baseOptions?: Apollo.QueryHookOptions<TenantFeaturesQuery, TenantFeaturesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TenantFeaturesQuery, TenantFeaturesQueryVariables>(TenantFeaturesDocument, options);
      }
export function useTenantFeaturesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TenantFeaturesQuery, TenantFeaturesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TenantFeaturesQuery, TenantFeaturesQueryVariables>(TenantFeaturesDocument, options);
        }
// @ts-ignore
export function useTenantFeaturesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TenantFeaturesQuery, TenantFeaturesQueryVariables>): Apollo.UseSuspenseQueryResult<TenantFeaturesQuery, TenantFeaturesQueryVariables>;
export function useTenantFeaturesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TenantFeaturesQuery, TenantFeaturesQueryVariables>): Apollo.UseSuspenseQueryResult<TenantFeaturesQuery | undefined, TenantFeaturesQueryVariables>;
export function useTenantFeaturesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TenantFeaturesQuery, TenantFeaturesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TenantFeaturesQuery, TenantFeaturesQueryVariables>(TenantFeaturesDocument, options);
        }
export type TenantFeaturesQueryHookResult = ReturnType<typeof useTenantFeaturesQuery>;
export type TenantFeaturesLazyQueryHookResult = ReturnType<typeof useTenantFeaturesLazyQuery>;
export type TenantFeaturesSuspenseQueryHookResult = ReturnType<typeof useTenantFeaturesSuspenseQuery>;
export type TenantFeaturesQueryResult = Apollo.QueryResult<TenantFeaturesQuery, TenantFeaturesQueryVariables>;
export const GreenhousesDocument = gql`
    query Greenhouses($tenantId: ID) {
  greenhouses(tenantId: $tenantId) {
    ...GreenhouseFields
  }
}
    ${GreenhouseFieldsFragmentDoc}`;

/**
 * __useGreenhousesQuery__
 *
 * To run a query within a React component, call `useGreenhousesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGreenhousesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGreenhousesQuery({
 *   variables: {
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useGreenhousesQuery(baseOptions?: Apollo.QueryHookOptions<GreenhousesQuery, GreenhousesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GreenhousesQuery, GreenhousesQueryVariables>(GreenhousesDocument, options);
      }
export function useGreenhousesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GreenhousesQuery, GreenhousesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GreenhousesQuery, GreenhousesQueryVariables>(GreenhousesDocument, options);
        }
// @ts-ignore
export function useGreenhousesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GreenhousesQuery, GreenhousesQueryVariables>): Apollo.UseSuspenseQueryResult<GreenhousesQuery, GreenhousesQueryVariables>;
export function useGreenhousesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GreenhousesQuery, GreenhousesQueryVariables>): Apollo.UseSuspenseQueryResult<GreenhousesQuery | undefined, GreenhousesQueryVariables>;
export function useGreenhousesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GreenhousesQuery, GreenhousesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GreenhousesQuery, GreenhousesQueryVariables>(GreenhousesDocument, options);
        }
export type GreenhousesQueryHookResult = ReturnType<typeof useGreenhousesQuery>;
export type GreenhousesLazyQueryHookResult = ReturnType<typeof useGreenhousesLazyQuery>;
export type GreenhousesSuspenseQueryHookResult = ReturnType<typeof useGreenhousesSuspenseQuery>;
export type GreenhousesQueryResult = Apollo.QueryResult<GreenhousesQuery, GreenhousesQueryVariables>;
export const GreenhouseDocument = gql`
    query Greenhouse($id: ID!) {
  greenhouse(id: $id) {
    ...GreenhouseFields
  }
}
    ${GreenhouseFieldsFragmentDoc}`;

/**
 * __useGreenhouseQuery__
 *
 * To run a query within a React component, call `useGreenhouseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGreenhouseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGreenhouseQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGreenhouseQuery(baseOptions: Apollo.QueryHookOptions<GreenhouseQuery, GreenhouseQueryVariables> & ({ variables: GreenhouseQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GreenhouseQuery, GreenhouseQueryVariables>(GreenhouseDocument, options);
      }
export function useGreenhouseLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GreenhouseQuery, GreenhouseQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GreenhouseQuery, GreenhouseQueryVariables>(GreenhouseDocument, options);
        }
// @ts-ignore
export function useGreenhouseSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GreenhouseQuery, GreenhouseQueryVariables>): Apollo.UseSuspenseQueryResult<GreenhouseQuery, GreenhouseQueryVariables>;
export function useGreenhouseSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GreenhouseQuery, GreenhouseQueryVariables>): Apollo.UseSuspenseQueryResult<GreenhouseQuery | undefined, GreenhouseQueryVariables>;
export function useGreenhouseSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GreenhouseQuery, GreenhouseQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GreenhouseQuery, GreenhouseQueryVariables>(GreenhouseDocument, options);
        }
export type GreenhouseQueryHookResult = ReturnType<typeof useGreenhouseQuery>;
export type GreenhouseLazyQueryHookResult = ReturnType<typeof useGreenhouseLazyQuery>;
export type GreenhouseSuspenseQueryHookResult = ReturnType<typeof useGreenhouseSuspenseQuery>;
export type GreenhouseQueryResult = Apollo.QueryResult<GreenhouseQuery, GreenhouseQueryVariables>;
export const GetHarvestBatchesDocument = gql`
    query GetHarvestBatches {
  harvestBatches {
    id
    name
    species
    variety
    greenhouse
    plantingDate
    status
    yieldPerPlant
  }
}
    `;

/**
 * __useGetHarvestBatchesQuery__
 *
 * To run a query within a React component, call `useGetHarvestBatchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHarvestBatchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHarvestBatchesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetHarvestBatchesQuery(baseOptions?: Apollo.QueryHookOptions<GetHarvestBatchesQuery, GetHarvestBatchesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHarvestBatchesQuery, GetHarvestBatchesQueryVariables>(GetHarvestBatchesDocument, options);
      }
export function useGetHarvestBatchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHarvestBatchesQuery, GetHarvestBatchesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHarvestBatchesQuery, GetHarvestBatchesQueryVariables>(GetHarvestBatchesDocument, options);
        }
// @ts-ignore
export function useGetHarvestBatchesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetHarvestBatchesQuery, GetHarvestBatchesQueryVariables>): Apollo.UseSuspenseQueryResult<GetHarvestBatchesQuery, GetHarvestBatchesQueryVariables>;
export function useGetHarvestBatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHarvestBatchesQuery, GetHarvestBatchesQueryVariables>): Apollo.UseSuspenseQueryResult<GetHarvestBatchesQuery | undefined, GetHarvestBatchesQueryVariables>;
export function useGetHarvestBatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHarvestBatchesQuery, GetHarvestBatchesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetHarvestBatchesQuery, GetHarvestBatchesQueryVariables>(GetHarvestBatchesDocument, options);
        }
export type GetHarvestBatchesQueryHookResult = ReturnType<typeof useGetHarvestBatchesQuery>;
export type GetHarvestBatchesLazyQueryHookResult = ReturnType<typeof useGetHarvestBatchesLazyQuery>;
export type GetHarvestBatchesSuspenseQueryHookResult = ReturnType<typeof useGetHarvestBatchesSuspenseQuery>;
export type GetHarvestBatchesQueryResult = Apollo.QueryResult<GetHarvestBatchesQuery, GetHarvestBatchesQueryVariables>;
export const GetHarvestDashboardDocument = gql`
    query GetHarvestDashboard($filter: DashboardFilterInput) {
  harvestDashboard(filter: $filter) {
    species
    variety
    harvestCount
    totalYield
    averageBrix
    averageFruitWeight
    yieldPerPlant
    yieldPerMeter
    marketablePercent
    wastePercent
    wasteTotal
    classBTotal
    classCTotal
    criticalAlerts
    daysActive
    yieldOverTime {
      date
      yield
    }
    yieldPerMeterTrend {
      date
      yieldPerMeter
    }
    classDistribution {
      date
      marketable
      classB
      classC
      waste
    }
    brixTrend {
      date
      brix
    }
    fruitWeightTrend {
      date
      weight
    }
    cumulativeYield {
      date
      cumulativeClassA
      cumulativeClassB
      cumulativeClassC
      cumulativeWaste
    }
  }
}
    `;

/**
 * __useGetHarvestDashboardQuery__
 *
 * To run a query within a React component, call `useGetHarvestDashboardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHarvestDashboardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHarvestDashboardQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetHarvestDashboardQuery(baseOptions?: Apollo.QueryHookOptions<GetHarvestDashboardQuery, GetHarvestDashboardQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHarvestDashboardQuery, GetHarvestDashboardQueryVariables>(GetHarvestDashboardDocument, options);
      }
export function useGetHarvestDashboardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHarvestDashboardQuery, GetHarvestDashboardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHarvestDashboardQuery, GetHarvestDashboardQueryVariables>(GetHarvestDashboardDocument, options);
        }
// @ts-ignore
export function useGetHarvestDashboardSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetHarvestDashboardQuery, GetHarvestDashboardQueryVariables>): Apollo.UseSuspenseQueryResult<GetHarvestDashboardQuery, GetHarvestDashboardQueryVariables>;
export function useGetHarvestDashboardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHarvestDashboardQuery, GetHarvestDashboardQueryVariables>): Apollo.UseSuspenseQueryResult<GetHarvestDashboardQuery | undefined, GetHarvestDashboardQueryVariables>;
export function useGetHarvestDashboardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHarvestDashboardQuery, GetHarvestDashboardQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetHarvestDashboardQuery, GetHarvestDashboardQueryVariables>(GetHarvestDashboardDocument, options);
        }
export type GetHarvestDashboardQueryHookResult = ReturnType<typeof useGetHarvestDashboardQuery>;
export type GetHarvestDashboardLazyQueryHookResult = ReturnType<typeof useGetHarvestDashboardLazyQuery>;
export type GetHarvestDashboardSuspenseQueryHookResult = ReturnType<typeof useGetHarvestDashboardSuspenseQuery>;
export type GetHarvestDashboardQueryResult = Apollo.QueryResult<GetHarvestDashboardQuery, GetHarvestDashboardQueryVariables>;
export const GetHarvestDashboardWithVariablesDocument = gql`
    query GetHarvestDashboardWithVariables($filter: DashboardFilterInput, $tenantId: ID, $species: String, $variety: String, $batch: String, $dateFrom: String, $dateTo: String, $greenhouseId: ID) {
  harvestDashboard(
    filter: {tenantId: $tenantId, species: $species, variety: $variety, batch: $batch, dateFrom: $dateFrom, dateTo: $dateTo, greenhouseId: $greenhouseId}
  ) {
    species
    variety
    harvestCount
    totalYield
    averageBrix
    averageFruitWeight
    yieldPerPlant
    yieldPerMeter
    marketablePercent
    wastePercent
    wasteTotal
    classBTotal
    classCTotal
    criticalAlerts
    daysActive
    yieldOverTime {
      date
      yield
    }
    yieldPerMeterTrend {
      date
      yieldPerMeter
    }
    classDistribution {
      date
      marketable
      classB
      classC
      waste
    }
    brixTrend {
      date
      brix
    }
    fruitWeightTrend {
      date
      weight
    }
    cumulativeYield {
      date
      cumulativeClassA
      cumulativeClassB
      cumulativeClassC
      cumulativeWaste
    }
  }
}
    `;

/**
 * __useGetHarvestDashboardWithVariablesQuery__
 *
 * To run a query within a React component, call `useGetHarvestDashboardWithVariablesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHarvestDashboardWithVariablesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHarvestDashboardWithVariablesQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      tenantId: // value for 'tenantId'
 *      species: // value for 'species'
 *      variety: // value for 'variety'
 *      batch: // value for 'batch'
 *      dateFrom: // value for 'dateFrom'
 *      dateTo: // value for 'dateTo'
 *      greenhouseId: // value for 'greenhouseId'
 *   },
 * });
 */
export function useGetHarvestDashboardWithVariablesQuery(baseOptions?: Apollo.QueryHookOptions<GetHarvestDashboardWithVariablesQuery, GetHarvestDashboardWithVariablesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHarvestDashboardWithVariablesQuery, GetHarvestDashboardWithVariablesQueryVariables>(GetHarvestDashboardWithVariablesDocument, options);
      }
export function useGetHarvestDashboardWithVariablesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHarvestDashboardWithVariablesQuery, GetHarvestDashboardWithVariablesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHarvestDashboardWithVariablesQuery, GetHarvestDashboardWithVariablesQueryVariables>(GetHarvestDashboardWithVariablesDocument, options);
        }
// @ts-ignore
export function useGetHarvestDashboardWithVariablesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetHarvestDashboardWithVariablesQuery, GetHarvestDashboardWithVariablesQueryVariables>): Apollo.UseSuspenseQueryResult<GetHarvestDashboardWithVariablesQuery, GetHarvestDashboardWithVariablesQueryVariables>;
export function useGetHarvestDashboardWithVariablesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHarvestDashboardWithVariablesQuery, GetHarvestDashboardWithVariablesQueryVariables>): Apollo.UseSuspenseQueryResult<GetHarvestDashboardWithVariablesQuery | undefined, GetHarvestDashboardWithVariablesQueryVariables>;
export function useGetHarvestDashboardWithVariablesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHarvestDashboardWithVariablesQuery, GetHarvestDashboardWithVariablesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetHarvestDashboardWithVariablesQuery, GetHarvestDashboardWithVariablesQueryVariables>(GetHarvestDashboardWithVariablesDocument, options);
        }
export type GetHarvestDashboardWithVariablesQueryHookResult = ReturnType<typeof useGetHarvestDashboardWithVariablesQuery>;
export type GetHarvestDashboardWithVariablesLazyQueryHookResult = ReturnType<typeof useGetHarvestDashboardWithVariablesLazyQuery>;
export type GetHarvestDashboardWithVariablesSuspenseQueryHookResult = ReturnType<typeof useGetHarvestDashboardWithVariablesSuspenseQuery>;
export type GetHarvestDashboardWithVariablesQueryResult = Apollo.QueryResult<GetHarvestDashboardWithVariablesQuery, GetHarvestDashboardWithVariablesQueryVariables>;
export const GetHarvestMetricsDocument = gql`
    query GetHarvestMetrics($filter: DashboardFilterInput) {
  harvestDashboard(filter: $filter) {
    species
    variety
    harvestCount
    totalYield
    averageBrix
    averageFruitWeight
    yieldPerPlant
    marketablePercent
    wastePercent
    wasteTotal
    classBTotal
    classCTotal
    criticalAlerts
    daysActive
  }
}
    `;

/**
 * __useGetHarvestMetricsQuery__
 *
 * To run a query within a React component, call `useGetHarvestMetricsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHarvestMetricsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHarvestMetricsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetHarvestMetricsQuery(baseOptions?: Apollo.QueryHookOptions<GetHarvestMetricsQuery, GetHarvestMetricsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHarvestMetricsQuery, GetHarvestMetricsQueryVariables>(GetHarvestMetricsDocument, options);
      }
export function useGetHarvestMetricsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHarvestMetricsQuery, GetHarvestMetricsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHarvestMetricsQuery, GetHarvestMetricsQueryVariables>(GetHarvestMetricsDocument, options);
        }
// @ts-ignore
export function useGetHarvestMetricsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetHarvestMetricsQuery, GetHarvestMetricsQueryVariables>): Apollo.UseSuspenseQueryResult<GetHarvestMetricsQuery, GetHarvestMetricsQueryVariables>;
export function useGetHarvestMetricsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHarvestMetricsQuery, GetHarvestMetricsQueryVariables>): Apollo.UseSuspenseQueryResult<GetHarvestMetricsQuery | undefined, GetHarvestMetricsQueryVariables>;
export function useGetHarvestMetricsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHarvestMetricsQuery, GetHarvestMetricsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetHarvestMetricsQuery, GetHarvestMetricsQueryVariables>(GetHarvestMetricsDocument, options);
        }
export type GetHarvestMetricsQueryHookResult = ReturnType<typeof useGetHarvestMetricsQuery>;
export type GetHarvestMetricsLazyQueryHookResult = ReturnType<typeof useGetHarvestMetricsLazyQuery>;
export type GetHarvestMetricsSuspenseQueryHookResult = ReturnType<typeof useGetHarvestMetricsSuspenseQuery>;
export type GetHarvestMetricsQueryResult = Apollo.QueryResult<GetHarvestMetricsQuery, GetHarvestMetricsQueryVariables>;
export const GetYieldOverTimeDocument = gql`
    query GetYieldOverTime($filter: DashboardFilterInput) {
  harvestDashboard(filter: $filter) {
    yieldOverTime {
      date
      yield
    }
  }
}
    `;

/**
 * __useGetYieldOverTimeQuery__
 *
 * To run a query within a React component, call `useGetYieldOverTimeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetYieldOverTimeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetYieldOverTimeQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetYieldOverTimeQuery(baseOptions?: Apollo.QueryHookOptions<GetYieldOverTimeQuery, GetYieldOverTimeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetYieldOverTimeQuery, GetYieldOverTimeQueryVariables>(GetYieldOverTimeDocument, options);
      }
export function useGetYieldOverTimeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetYieldOverTimeQuery, GetYieldOverTimeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetYieldOverTimeQuery, GetYieldOverTimeQueryVariables>(GetYieldOverTimeDocument, options);
        }
// @ts-ignore
export function useGetYieldOverTimeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetYieldOverTimeQuery, GetYieldOverTimeQueryVariables>): Apollo.UseSuspenseQueryResult<GetYieldOverTimeQuery, GetYieldOverTimeQueryVariables>;
export function useGetYieldOverTimeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetYieldOverTimeQuery, GetYieldOverTimeQueryVariables>): Apollo.UseSuspenseQueryResult<GetYieldOverTimeQuery | undefined, GetYieldOverTimeQueryVariables>;
export function useGetYieldOverTimeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetYieldOverTimeQuery, GetYieldOverTimeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetYieldOverTimeQuery, GetYieldOverTimeQueryVariables>(GetYieldOverTimeDocument, options);
        }
export type GetYieldOverTimeQueryHookResult = ReturnType<typeof useGetYieldOverTimeQuery>;
export type GetYieldOverTimeLazyQueryHookResult = ReturnType<typeof useGetYieldOverTimeLazyQuery>;
export type GetYieldOverTimeSuspenseQueryHookResult = ReturnType<typeof useGetYieldOverTimeSuspenseQuery>;
export type GetYieldOverTimeQueryResult = Apollo.QueryResult<GetYieldOverTimeQuery, GetYieldOverTimeQueryVariables>;
export const GetClassDistributionDocument = gql`
    query GetClassDistribution($filter: DashboardFilterInput) {
  harvestDashboard(filter: $filter) {
    classDistribution {
      date
      marketable
      classB
      classC
      waste
    }
  }
}
    `;

/**
 * __useGetClassDistributionQuery__
 *
 * To run a query within a React component, call `useGetClassDistributionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClassDistributionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClassDistributionQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetClassDistributionQuery(baseOptions?: Apollo.QueryHookOptions<GetClassDistributionQuery, GetClassDistributionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetClassDistributionQuery, GetClassDistributionQueryVariables>(GetClassDistributionDocument, options);
      }
export function useGetClassDistributionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetClassDistributionQuery, GetClassDistributionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetClassDistributionQuery, GetClassDistributionQueryVariables>(GetClassDistributionDocument, options);
        }
// @ts-ignore
export function useGetClassDistributionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetClassDistributionQuery, GetClassDistributionQueryVariables>): Apollo.UseSuspenseQueryResult<GetClassDistributionQuery, GetClassDistributionQueryVariables>;
export function useGetClassDistributionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClassDistributionQuery, GetClassDistributionQueryVariables>): Apollo.UseSuspenseQueryResult<GetClassDistributionQuery | undefined, GetClassDistributionQueryVariables>;
export function useGetClassDistributionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClassDistributionQuery, GetClassDistributionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetClassDistributionQuery, GetClassDistributionQueryVariables>(GetClassDistributionDocument, options);
        }
export type GetClassDistributionQueryHookResult = ReturnType<typeof useGetClassDistributionQuery>;
export type GetClassDistributionLazyQueryHookResult = ReturnType<typeof useGetClassDistributionLazyQuery>;
export type GetClassDistributionSuspenseQueryHookResult = ReturnType<typeof useGetClassDistributionSuspenseQuery>;
export type GetClassDistributionQueryResult = Apollo.QueryResult<GetClassDistributionQuery, GetClassDistributionQueryVariables>;
export const GetBrixTrendDocument = gql`
    query GetBrixTrend($filter: DashboardFilterInput) {
  harvestDashboard(filter: $filter) {
    brixTrend {
      date
      brix
    }
  }
}
    `;

/**
 * __useGetBrixTrendQuery__
 *
 * To run a query within a React component, call `useGetBrixTrendQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBrixTrendQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBrixTrendQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetBrixTrendQuery(baseOptions?: Apollo.QueryHookOptions<GetBrixTrendQuery, GetBrixTrendQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBrixTrendQuery, GetBrixTrendQueryVariables>(GetBrixTrendDocument, options);
      }
export function useGetBrixTrendLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBrixTrendQuery, GetBrixTrendQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBrixTrendQuery, GetBrixTrendQueryVariables>(GetBrixTrendDocument, options);
        }
// @ts-ignore
export function useGetBrixTrendSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetBrixTrendQuery, GetBrixTrendQueryVariables>): Apollo.UseSuspenseQueryResult<GetBrixTrendQuery, GetBrixTrendQueryVariables>;
export function useGetBrixTrendSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBrixTrendQuery, GetBrixTrendQueryVariables>): Apollo.UseSuspenseQueryResult<GetBrixTrendQuery | undefined, GetBrixTrendQueryVariables>;
export function useGetBrixTrendSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBrixTrendQuery, GetBrixTrendQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBrixTrendQuery, GetBrixTrendQueryVariables>(GetBrixTrendDocument, options);
        }
export type GetBrixTrendQueryHookResult = ReturnType<typeof useGetBrixTrendQuery>;
export type GetBrixTrendLazyQueryHookResult = ReturnType<typeof useGetBrixTrendLazyQuery>;
export type GetBrixTrendSuspenseQueryHookResult = ReturnType<typeof useGetBrixTrendSuspenseQuery>;
export type GetBrixTrendQueryResult = Apollo.QueryResult<GetBrixTrendQuery, GetBrixTrendQueryVariables>;
export const GetFruitWeightTrendDocument = gql`
    query GetFruitWeightTrend($filter: DashboardFilterInput) {
  harvestDashboard(filter: $filter) {
    fruitWeightTrend {
      date
      weight
    }
  }
}
    `;

/**
 * __useGetFruitWeightTrendQuery__
 *
 * To run a query within a React component, call `useGetFruitWeightTrendQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFruitWeightTrendQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFruitWeightTrendQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetFruitWeightTrendQuery(baseOptions?: Apollo.QueryHookOptions<GetFruitWeightTrendQuery, GetFruitWeightTrendQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFruitWeightTrendQuery, GetFruitWeightTrendQueryVariables>(GetFruitWeightTrendDocument, options);
      }
export function useGetFruitWeightTrendLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFruitWeightTrendQuery, GetFruitWeightTrendQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFruitWeightTrendQuery, GetFruitWeightTrendQueryVariables>(GetFruitWeightTrendDocument, options);
        }
// @ts-ignore
export function useGetFruitWeightTrendSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFruitWeightTrendQuery, GetFruitWeightTrendQueryVariables>): Apollo.UseSuspenseQueryResult<GetFruitWeightTrendQuery, GetFruitWeightTrendQueryVariables>;
export function useGetFruitWeightTrendSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFruitWeightTrendQuery, GetFruitWeightTrendQueryVariables>): Apollo.UseSuspenseQueryResult<GetFruitWeightTrendQuery | undefined, GetFruitWeightTrendQueryVariables>;
export function useGetFruitWeightTrendSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFruitWeightTrendQuery, GetFruitWeightTrendQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFruitWeightTrendQuery, GetFruitWeightTrendQueryVariables>(GetFruitWeightTrendDocument, options);
        }
export type GetFruitWeightTrendQueryHookResult = ReturnType<typeof useGetFruitWeightTrendQuery>;
export type GetFruitWeightTrendLazyQueryHookResult = ReturnType<typeof useGetFruitWeightTrendLazyQuery>;
export type GetFruitWeightTrendSuspenseQueryHookResult = ReturnType<typeof useGetFruitWeightTrendSuspenseQuery>;
export type GetFruitWeightTrendQueryResult = Apollo.QueryResult<GetFruitWeightTrendQuery, GetFruitWeightTrendQueryVariables>;
export const GetCumulativeYieldDocument = gql`
    query GetCumulativeYield($filter: DashboardFilterInput) {
  harvestDashboard(filter: $filter) {
    cumulativeYield {
      date
      cumulativeClassA
      cumulativeClassB
      cumulativeClassC
      cumulativeWaste
    }
  }
}
    `;

/**
 * __useGetCumulativeYieldQuery__
 *
 * To run a query within a React component, call `useGetCumulativeYieldQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCumulativeYieldQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCumulativeYieldQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetCumulativeYieldQuery(baseOptions?: Apollo.QueryHookOptions<GetCumulativeYieldQuery, GetCumulativeYieldQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCumulativeYieldQuery, GetCumulativeYieldQueryVariables>(GetCumulativeYieldDocument, options);
      }
export function useGetCumulativeYieldLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCumulativeYieldQuery, GetCumulativeYieldQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCumulativeYieldQuery, GetCumulativeYieldQueryVariables>(GetCumulativeYieldDocument, options);
        }
// @ts-ignore
export function useGetCumulativeYieldSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCumulativeYieldQuery, GetCumulativeYieldQueryVariables>): Apollo.UseSuspenseQueryResult<GetCumulativeYieldQuery, GetCumulativeYieldQueryVariables>;
export function useGetCumulativeYieldSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCumulativeYieldQuery, GetCumulativeYieldQueryVariables>): Apollo.UseSuspenseQueryResult<GetCumulativeYieldQuery | undefined, GetCumulativeYieldQueryVariables>;
export function useGetCumulativeYieldSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCumulativeYieldQuery, GetCumulativeYieldQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCumulativeYieldQuery, GetCumulativeYieldQueryVariables>(GetCumulativeYieldDocument, options);
        }
export type GetCumulativeYieldQueryHookResult = ReturnType<typeof useGetCumulativeYieldQuery>;
export type GetCumulativeYieldLazyQueryHookResult = ReturnType<typeof useGetCumulativeYieldLazyQuery>;
export type GetCumulativeYieldSuspenseQueryHookResult = ReturnType<typeof useGetCumulativeYieldSuspenseQuery>;
export type GetCumulativeYieldQueryResult = Apollo.QueryResult<GetCumulativeYieldQuery, GetCumulativeYieldQueryVariables>;
export const GetHarvestSummaryDocument = gql`
    query GetHarvestSummary($filter: HarvestFilterInput) {
  harvests(filter: $filter) {
    id
    date
    createdAt
    batch {
      id
      name
      crop {
        id
        name
      }
      variety {
        id
        name
      }
      status
      greenhouse {
        id
        name
      }
    }
    totals {
      classA
      classB
      classC
      waste
      avgBrix
    }
  }
}
    `;

/**
 * __useGetHarvestSummaryQuery__
 *
 * To run a query within a React component, call `useGetHarvestSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHarvestSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHarvestSummaryQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetHarvestSummaryQuery(baseOptions?: Apollo.QueryHookOptions<GetHarvestSummaryQuery, GetHarvestSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHarvestSummaryQuery, GetHarvestSummaryQueryVariables>(GetHarvestSummaryDocument, options);
      }
export function useGetHarvestSummaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHarvestSummaryQuery, GetHarvestSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHarvestSummaryQuery, GetHarvestSummaryQueryVariables>(GetHarvestSummaryDocument, options);
        }
// @ts-ignore
export function useGetHarvestSummarySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetHarvestSummaryQuery, GetHarvestSummaryQueryVariables>): Apollo.UseSuspenseQueryResult<GetHarvestSummaryQuery, GetHarvestSummaryQueryVariables>;
export function useGetHarvestSummarySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHarvestSummaryQuery, GetHarvestSummaryQueryVariables>): Apollo.UseSuspenseQueryResult<GetHarvestSummaryQuery | undefined, GetHarvestSummaryQueryVariables>;
export function useGetHarvestSummarySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHarvestSummaryQuery, GetHarvestSummaryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetHarvestSummaryQuery, GetHarvestSummaryQueryVariables>(GetHarvestSummaryDocument, options);
        }
export type GetHarvestSummaryQueryHookResult = ReturnType<typeof useGetHarvestSummaryQuery>;
export type GetHarvestSummaryLazyQueryHookResult = ReturnType<typeof useGetHarvestSummaryLazyQuery>;
export type GetHarvestSummarySuspenseQueryHookResult = ReturnType<typeof useGetHarvestSummarySuspenseQuery>;
export type GetHarvestSummaryQueryResult = Apollo.QueryResult<GetHarvestSummaryQuery, GetHarvestSummaryQueryVariables>;
export const HarvestsDocument = gql`
    query Harvests($filter: HarvestFilterInput) {
  harvests(filter: $filter) {
    ...HarvestFields
  }
}
    ${HarvestFieldsFragmentDoc}`;

/**
 * __useHarvestsQuery__
 *
 * To run a query within a React component, call `useHarvestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHarvestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHarvestsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useHarvestsQuery(baseOptions?: Apollo.QueryHookOptions<HarvestsQuery, HarvestsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HarvestsQuery, HarvestsQueryVariables>(HarvestsDocument, options);
      }
export function useHarvestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HarvestsQuery, HarvestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HarvestsQuery, HarvestsQueryVariables>(HarvestsDocument, options);
        }
// @ts-ignore
export function useHarvestsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<HarvestsQuery, HarvestsQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestsQuery, HarvestsQueryVariables>;
export function useHarvestsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestsQuery, HarvestsQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestsQuery | undefined, HarvestsQueryVariables>;
export function useHarvestsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestsQuery, HarvestsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<HarvestsQuery, HarvestsQueryVariables>(HarvestsDocument, options);
        }
export type HarvestsQueryHookResult = ReturnType<typeof useHarvestsQuery>;
export type HarvestsLazyQueryHookResult = ReturnType<typeof useHarvestsLazyQuery>;
export type HarvestsSuspenseQueryHookResult = ReturnType<typeof useHarvestsSuspenseQuery>;
export type HarvestsQueryResult = Apollo.QueryResult<HarvestsQuery, HarvestsQueryVariables>;
export const HarvestDocument = gql`
    query Harvest($id: ID!) {
  harvest(id: $id) {
    ...HarvestFields
  }
}
    ${HarvestFieldsFragmentDoc}`;

/**
 * __useHarvestQuery__
 *
 * To run a query within a React component, call `useHarvestQuery` and pass it any options that fit your needs.
 * When your component renders, `useHarvestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHarvestQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useHarvestQuery(baseOptions: Apollo.QueryHookOptions<HarvestQuery, HarvestQueryVariables> & ({ variables: HarvestQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HarvestQuery, HarvestQueryVariables>(HarvestDocument, options);
      }
export function useHarvestLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HarvestQuery, HarvestQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HarvestQuery, HarvestQueryVariables>(HarvestDocument, options);
        }
// @ts-ignore
export function useHarvestSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<HarvestQuery, HarvestQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestQuery, HarvestQueryVariables>;
export function useHarvestSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestQuery, HarvestQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestQuery | undefined, HarvestQueryVariables>;
export function useHarvestSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestQuery, HarvestQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<HarvestQuery, HarvestQueryVariables>(HarvestDocument, options);
        }
export type HarvestQueryHookResult = ReturnType<typeof useHarvestQuery>;
export type HarvestLazyQueryHookResult = ReturnType<typeof useHarvestLazyQuery>;
export type HarvestSuspenseQueryHookResult = ReturnType<typeof useHarvestSuspenseQuery>;
export type HarvestQueryResult = Apollo.QueryResult<HarvestQuery, HarvestQueryVariables>;
export const HarvestsCsvExportDocument = gql`
    query HarvestsCsvExport($filter: HarvestFilterInput, $columns: [String!]) {
  harvestsCsvExport(filter: $filter, columns: $columns)
}
    `;

/**
 * __useHarvestsCsvExportQuery__
 *
 * To run a query within a React component, call `useHarvestsCsvExportQuery` and pass it any options that fit your needs.
 * When your component renders, `useHarvestsCsvExportQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHarvestsCsvExportQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      columns: // value for 'columns'
 *   },
 * });
 */
export function useHarvestsCsvExportQuery(baseOptions?: Apollo.QueryHookOptions<HarvestsCsvExportQuery, HarvestsCsvExportQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HarvestsCsvExportQuery, HarvestsCsvExportQueryVariables>(HarvestsCsvExportDocument, options);
      }
export function useHarvestsCsvExportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HarvestsCsvExportQuery, HarvestsCsvExportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HarvestsCsvExportQuery, HarvestsCsvExportQueryVariables>(HarvestsCsvExportDocument, options);
        }
// @ts-ignore
export function useHarvestsCsvExportSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<HarvestsCsvExportQuery, HarvestsCsvExportQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestsCsvExportQuery, HarvestsCsvExportQueryVariables>;
export function useHarvestsCsvExportSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestsCsvExportQuery, HarvestsCsvExportQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestsCsvExportQuery | undefined, HarvestsCsvExportQueryVariables>;
export function useHarvestsCsvExportSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestsCsvExportQuery, HarvestsCsvExportQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<HarvestsCsvExportQuery, HarvestsCsvExportQueryVariables>(HarvestsCsvExportDocument, options);
        }
export type HarvestsCsvExportQueryHookResult = ReturnType<typeof useHarvestsCsvExportQuery>;
export type HarvestsCsvExportLazyQueryHookResult = ReturnType<typeof useHarvestsCsvExportLazyQuery>;
export type HarvestsCsvExportSuspenseQueryHookResult = ReturnType<typeof useHarvestsCsvExportSuspenseQuery>;
export type HarvestsCsvExportQueryResult = Apollo.QueryResult<HarvestsCsvExportQuery, HarvestsCsvExportQueryVariables>;
export const HarvestsCountDocument = gql`
    query HarvestsCount($filter: HarvestFilterInput) {
  harvests(filter: $filter) {
    id
    batchId
    date
    batch {
      id
      status
    }
    totals {
      classA
      classB
      classC
      waste
      avgBrix
    }
  }
}
    `;

/**
 * __useHarvestsCountQuery__
 *
 * To run a query within a React component, call `useHarvestsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useHarvestsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHarvestsCountQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useHarvestsCountQuery(baseOptions?: Apollo.QueryHookOptions<HarvestsCountQuery, HarvestsCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HarvestsCountQuery, HarvestsCountQueryVariables>(HarvestsCountDocument, options);
      }
export function useHarvestsCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HarvestsCountQuery, HarvestsCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HarvestsCountQuery, HarvestsCountQueryVariables>(HarvestsCountDocument, options);
        }
// @ts-ignore
export function useHarvestsCountSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<HarvestsCountQuery, HarvestsCountQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestsCountQuery, HarvestsCountQueryVariables>;
export function useHarvestsCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestsCountQuery, HarvestsCountQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestsCountQuery | undefined, HarvestsCountQueryVariables>;
export function useHarvestsCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestsCountQuery, HarvestsCountQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<HarvestsCountQuery, HarvestsCountQueryVariables>(HarvestsCountDocument, options);
        }
export type HarvestsCountQueryHookResult = ReturnType<typeof useHarvestsCountQuery>;
export type HarvestsCountLazyQueryHookResult = ReturnType<typeof useHarvestsCountLazyQuery>;
export type HarvestsCountSuspenseQueryHookResult = ReturnType<typeof useHarvestsCountSuspenseQuery>;
export type HarvestsCountQueryResult = Apollo.QueryResult<HarvestsCountQuery, HarvestsCountQueryVariables>;
export const HarvestImagesDocument = gql`
    query HarvestImages($folder: String) {
  images(input: {folder: $folder}) {
    path
    filename
    mimeType
    url
  }
}
    `;

/**
 * __useHarvestImagesQuery__
 *
 * To run a query within a React component, call `useHarvestImagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHarvestImagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHarvestImagesQuery({
 *   variables: {
 *      folder: // value for 'folder'
 *   },
 * });
 */
export function useHarvestImagesQuery(baseOptions?: Apollo.QueryHookOptions<HarvestImagesQuery, HarvestImagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HarvestImagesQuery, HarvestImagesQueryVariables>(HarvestImagesDocument, options);
      }
export function useHarvestImagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HarvestImagesQuery, HarvestImagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HarvestImagesQuery, HarvestImagesQueryVariables>(HarvestImagesDocument, options);
        }
// @ts-ignore
export function useHarvestImagesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<HarvestImagesQuery, HarvestImagesQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestImagesQuery, HarvestImagesQueryVariables>;
export function useHarvestImagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestImagesQuery, HarvestImagesQueryVariables>): Apollo.UseSuspenseQueryResult<HarvestImagesQuery | undefined, HarvestImagesQueryVariables>;
export function useHarvestImagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HarvestImagesQuery, HarvestImagesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<HarvestImagesQuery, HarvestImagesQueryVariables>(HarvestImagesDocument, options);
        }
export type HarvestImagesQueryHookResult = ReturnType<typeof useHarvestImagesQuery>;
export type HarvestImagesLazyQueryHookResult = ReturnType<typeof useHarvestImagesLazyQuery>;
export type HarvestImagesSuspenseQueryHookResult = ReturnType<typeof useHarvestImagesSuspenseQuery>;
export type HarvestImagesQueryResult = Apollo.QueryResult<HarvestImagesQuery, HarvestImagesQueryVariables>;
export const GetBucketDataDocument = gql`
    query GetBucketData($input: GetBucketDataInput!) {
  getBucketData(input: $input) {
    data
  }
}
    `;

/**
 * __useGetBucketDataQuery__
 *
 * To run a query within a React component, call `useGetBucketDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBucketDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBucketDataQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetBucketDataQuery(baseOptions: Apollo.QueryHookOptions<GetBucketDataQuery, GetBucketDataQueryVariables> & ({ variables: GetBucketDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBucketDataQuery, GetBucketDataQueryVariables>(GetBucketDataDocument, options);
      }
export function useGetBucketDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBucketDataQuery, GetBucketDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBucketDataQuery, GetBucketDataQueryVariables>(GetBucketDataDocument, options);
        }
// @ts-ignore
export function useGetBucketDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetBucketDataQuery, GetBucketDataQueryVariables>): Apollo.UseSuspenseQueryResult<GetBucketDataQuery, GetBucketDataQueryVariables>;
export function useGetBucketDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBucketDataQuery, GetBucketDataQueryVariables>): Apollo.UseSuspenseQueryResult<GetBucketDataQuery | undefined, GetBucketDataQueryVariables>;
export function useGetBucketDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBucketDataQuery, GetBucketDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBucketDataQuery, GetBucketDataQueryVariables>(GetBucketDataDocument, options);
        }
export type GetBucketDataQueryHookResult = ReturnType<typeof useGetBucketDataQuery>;
export type GetBucketDataLazyQueryHookResult = ReturnType<typeof useGetBucketDataLazyQuery>;
export type GetBucketDataSuspenseQueryHookResult = ReturnType<typeof useGetBucketDataSuspenseQuery>;
export type GetBucketDataQueryResult = Apollo.QueryResult<GetBucketDataQuery, GetBucketDataQueryVariables>;
export const GetBucketFieldsDocument = gql`
    query GetBucketFields($bucketName: String!, $start: String, $stop: String) {
  getBucketFields(bucketName: $bucketName, start: $start, stop: $stop)
}
    `;

/**
 * __useGetBucketFieldsQuery__
 *
 * To run a query within a React component, call `useGetBucketFieldsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBucketFieldsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBucketFieldsQuery({
 *   variables: {
 *      bucketName: // value for 'bucketName'
 *      start: // value for 'start'
 *      stop: // value for 'stop'
 *   },
 * });
 */
export function useGetBucketFieldsQuery(baseOptions: Apollo.QueryHookOptions<GetBucketFieldsQuery, GetBucketFieldsQueryVariables> & ({ variables: GetBucketFieldsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBucketFieldsQuery, GetBucketFieldsQueryVariables>(GetBucketFieldsDocument, options);
      }
export function useGetBucketFieldsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBucketFieldsQuery, GetBucketFieldsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBucketFieldsQuery, GetBucketFieldsQueryVariables>(GetBucketFieldsDocument, options);
        }
// @ts-ignore
export function useGetBucketFieldsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetBucketFieldsQuery, GetBucketFieldsQueryVariables>): Apollo.UseSuspenseQueryResult<GetBucketFieldsQuery, GetBucketFieldsQueryVariables>;
export function useGetBucketFieldsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBucketFieldsQuery, GetBucketFieldsQueryVariables>): Apollo.UseSuspenseQueryResult<GetBucketFieldsQuery | undefined, GetBucketFieldsQueryVariables>;
export function useGetBucketFieldsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBucketFieldsQuery, GetBucketFieldsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBucketFieldsQuery, GetBucketFieldsQueryVariables>(GetBucketFieldsDocument, options);
        }
export type GetBucketFieldsQueryHookResult = ReturnType<typeof useGetBucketFieldsQuery>;
export type GetBucketFieldsLazyQueryHookResult = ReturnType<typeof useGetBucketFieldsLazyQuery>;
export type GetBucketFieldsSuspenseQueryHookResult = ReturnType<typeof useGetBucketFieldsSuspenseQuery>;
export type GetBucketFieldsQueryResult = Apollo.QueryResult<GetBucketFieldsQuery, GetBucketFieldsQueryVariables>;
export const GetBucketFieldMeansLastMinutesDocument = gql`
    query GetBucketFieldMeansLastMinutes($input: GetFieldMeansInput!) {
  getBucketFieldMeansLastMinutes(input: $input) {
    field
    greenhouse
    chamber
    value
  }
}
    `;

/**
 * __useGetBucketFieldMeansLastMinutesQuery__
 *
 * To run a query within a React component, call `useGetBucketFieldMeansLastMinutesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBucketFieldMeansLastMinutesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBucketFieldMeansLastMinutesQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetBucketFieldMeansLastMinutesQuery(baseOptions: Apollo.QueryHookOptions<GetBucketFieldMeansLastMinutesQuery, GetBucketFieldMeansLastMinutesQueryVariables> & ({ variables: GetBucketFieldMeansLastMinutesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBucketFieldMeansLastMinutesQuery, GetBucketFieldMeansLastMinutesQueryVariables>(GetBucketFieldMeansLastMinutesDocument, options);
      }
export function useGetBucketFieldMeansLastMinutesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBucketFieldMeansLastMinutesQuery, GetBucketFieldMeansLastMinutesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBucketFieldMeansLastMinutesQuery, GetBucketFieldMeansLastMinutesQueryVariables>(GetBucketFieldMeansLastMinutesDocument, options);
        }
// @ts-ignore
export function useGetBucketFieldMeansLastMinutesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetBucketFieldMeansLastMinutesQuery, GetBucketFieldMeansLastMinutesQueryVariables>): Apollo.UseSuspenseQueryResult<GetBucketFieldMeansLastMinutesQuery, GetBucketFieldMeansLastMinutesQueryVariables>;
export function useGetBucketFieldMeansLastMinutesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBucketFieldMeansLastMinutesQuery, GetBucketFieldMeansLastMinutesQueryVariables>): Apollo.UseSuspenseQueryResult<GetBucketFieldMeansLastMinutesQuery | undefined, GetBucketFieldMeansLastMinutesQueryVariables>;
export function useGetBucketFieldMeansLastMinutesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBucketFieldMeansLastMinutesQuery, GetBucketFieldMeansLastMinutesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBucketFieldMeansLastMinutesQuery, GetBucketFieldMeansLastMinutesQueryVariables>(GetBucketFieldMeansLastMinutesDocument, options);
        }
export type GetBucketFieldMeansLastMinutesQueryHookResult = ReturnType<typeof useGetBucketFieldMeansLastMinutesQuery>;
export type GetBucketFieldMeansLastMinutesLazyQueryHookResult = ReturnType<typeof useGetBucketFieldMeansLastMinutesLazyQuery>;
export type GetBucketFieldMeansLastMinutesSuspenseQueryHookResult = ReturnType<typeof useGetBucketFieldMeansLastMinutesSuspenseQuery>;
export type GetBucketFieldMeansLastMinutesQueryResult = Apollo.QueryResult<GetBucketFieldMeansLastMinutesQuery, GetBucketFieldMeansLastMinutesQueryVariables>;
export const GetParDliForTenantDocument = gql`
    query GetParDliForTenant($tenantId: ID, $timezone: String) {
  getParDliForTenant(input: {tenantId: $tenantId, timezone: $timezone}) {
    combined {
      currentPPFD
      currentDLI
      todaysGraphData {
        time
        dli
      }
      lowerEdge {
        hour
        dli
      }
      upperEdge {
        hour
        dli
      }
    }
    greenhouses {
      name
      data {
        currentPPFD
        currentDLI
        todaysGraphData {
          time
          dli
        }
        lowerEdge {
          hour
          dli
        }
        upperEdge {
          hour
          dli
        }
      }
    }
  }
}
    `;

/**
 * __useGetParDliForTenantQuery__
 *
 * To run a query within a React component, call `useGetParDliForTenantQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetParDliForTenantQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetParDliForTenantQuery({
 *   variables: {
 *      tenantId: // value for 'tenantId'
 *      timezone: // value for 'timezone'
 *   },
 * });
 */
export function useGetParDliForTenantQuery(baseOptions?: Apollo.QueryHookOptions<GetParDliForTenantQuery, GetParDliForTenantQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetParDliForTenantQuery, GetParDliForTenantQueryVariables>(GetParDliForTenantDocument, options);
      }
export function useGetParDliForTenantLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetParDliForTenantQuery, GetParDliForTenantQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetParDliForTenantQuery, GetParDliForTenantQueryVariables>(GetParDliForTenantDocument, options);
        }
// @ts-ignore
export function useGetParDliForTenantSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetParDliForTenantQuery, GetParDliForTenantQueryVariables>): Apollo.UseSuspenseQueryResult<GetParDliForTenantQuery, GetParDliForTenantQueryVariables>;
export function useGetParDliForTenantSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetParDliForTenantQuery, GetParDliForTenantQueryVariables>): Apollo.UseSuspenseQueryResult<GetParDliForTenantQuery | undefined, GetParDliForTenantQueryVariables>;
export function useGetParDliForTenantSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetParDliForTenantQuery, GetParDliForTenantQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetParDliForTenantQuery, GetParDliForTenantQueryVariables>(GetParDliForTenantDocument, options);
        }
export type GetParDliForTenantQueryHookResult = ReturnType<typeof useGetParDliForTenantQuery>;
export type GetParDliForTenantLazyQueryHookResult = ReturnType<typeof useGetParDliForTenantLazyQuery>;
export type GetParDliForTenantSuspenseQueryHookResult = ReturnType<typeof useGetParDliForTenantSuspenseQuery>;
export type GetParDliForTenantQueryResult = Apollo.QueryResult<GetParDliForTenantQuery, GetParDliForTenantQueryVariables>;
export const SensorConfigsDocument = gql`
    query SensorConfigs($tenantId: ID) {
  sensorConfigs(tenantId: $tenantId) {
    id
    tenantId
    device
    xPosition
    yPosition
    greenhouseId
    greenhouse
    city
    hiddenInFarmOverview
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useSensorConfigsQuery__
 *
 * To run a query within a React component, call `useSensorConfigsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSensorConfigsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSensorConfigsQuery({
 *   variables: {
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useSensorConfigsQuery(baseOptions?: Apollo.QueryHookOptions<SensorConfigsQuery, SensorConfigsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SensorConfigsQuery, SensorConfigsQueryVariables>(SensorConfigsDocument, options);
      }
export function useSensorConfigsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SensorConfigsQuery, SensorConfigsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SensorConfigsQuery, SensorConfigsQueryVariables>(SensorConfigsDocument, options);
        }
// @ts-ignore
export function useSensorConfigsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SensorConfigsQuery, SensorConfigsQueryVariables>): Apollo.UseSuspenseQueryResult<SensorConfigsQuery, SensorConfigsQueryVariables>;
export function useSensorConfigsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SensorConfigsQuery, SensorConfigsQueryVariables>): Apollo.UseSuspenseQueryResult<SensorConfigsQuery | undefined, SensorConfigsQueryVariables>;
export function useSensorConfigsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SensorConfigsQuery, SensorConfigsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SensorConfigsQuery, SensorConfigsQueryVariables>(SensorConfigsDocument, options);
        }
export type SensorConfigsQueryHookResult = ReturnType<typeof useSensorConfigsQuery>;
export type SensorConfigsLazyQueryHookResult = ReturnType<typeof useSensorConfigsLazyQuery>;
export type SensorConfigsSuspenseQueryHookResult = ReturnType<typeof useSensorConfigsSuspenseQuery>;
export type SensorConfigsQueryResult = Apollo.QueryResult<SensorConfigsQuery, SensorConfigsQueryVariables>;
export const SensorDevicesDocument = gql`
    query SensorDevices($tenantId: ID) {
  sensorDevices(tenantId: $tenantId)
}
    `;

/**
 * __useSensorDevicesQuery__
 *
 * To run a query within a React component, call `useSensorDevicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSensorDevicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSensorDevicesQuery({
 *   variables: {
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useSensorDevicesQuery(baseOptions?: Apollo.QueryHookOptions<SensorDevicesQuery, SensorDevicesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SensorDevicesQuery, SensorDevicesQueryVariables>(SensorDevicesDocument, options);
      }
export function useSensorDevicesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SensorDevicesQuery, SensorDevicesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SensorDevicesQuery, SensorDevicesQueryVariables>(SensorDevicesDocument, options);
        }
// @ts-ignore
export function useSensorDevicesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SensorDevicesQuery, SensorDevicesQueryVariables>): Apollo.UseSuspenseQueryResult<SensorDevicesQuery, SensorDevicesQueryVariables>;
export function useSensorDevicesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SensorDevicesQuery, SensorDevicesQueryVariables>): Apollo.UseSuspenseQueryResult<SensorDevicesQuery | undefined, SensorDevicesQueryVariables>;
export function useSensorDevicesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SensorDevicesQuery, SensorDevicesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SensorDevicesQuery, SensorDevicesQueryVariables>(SensorDevicesDocument, options);
        }
export type SensorDevicesQueryHookResult = ReturnType<typeof useSensorDevicesQuery>;
export type SensorDevicesLazyQueryHookResult = ReturnType<typeof useSensorDevicesLazyQuery>;
export type SensorDevicesSuspenseQueryHookResult = ReturnType<typeof useSensorDevicesSuspenseQuery>;
export type SensorDevicesQueryResult = Apollo.QueryResult<SensorDevicesQuery, SensorDevicesQueryVariables>;
export const GreenhouseOptionsDocument = gql`
    query GreenhouseOptions($tenantId: ID) {
  greenhouseOptions(tenantId: $tenantId)
}
    `;

/**
 * __useGreenhouseOptionsQuery__
 *
 * To run a query within a React component, call `useGreenhouseOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGreenhouseOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGreenhouseOptionsQuery({
 *   variables: {
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useGreenhouseOptionsQuery(baseOptions?: Apollo.QueryHookOptions<GreenhouseOptionsQuery, GreenhouseOptionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GreenhouseOptionsQuery, GreenhouseOptionsQueryVariables>(GreenhouseOptionsDocument, options);
      }
export function useGreenhouseOptionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GreenhouseOptionsQuery, GreenhouseOptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GreenhouseOptionsQuery, GreenhouseOptionsQueryVariables>(GreenhouseOptionsDocument, options);
        }
// @ts-ignore
export function useGreenhouseOptionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GreenhouseOptionsQuery, GreenhouseOptionsQueryVariables>): Apollo.UseSuspenseQueryResult<GreenhouseOptionsQuery, GreenhouseOptionsQueryVariables>;
export function useGreenhouseOptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GreenhouseOptionsQuery, GreenhouseOptionsQueryVariables>): Apollo.UseSuspenseQueryResult<GreenhouseOptionsQuery | undefined, GreenhouseOptionsQueryVariables>;
export function useGreenhouseOptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GreenhouseOptionsQuery, GreenhouseOptionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GreenhouseOptionsQuery, GreenhouseOptionsQueryVariables>(GreenhouseOptionsDocument, options);
        }
export type GreenhouseOptionsQueryHookResult = ReturnType<typeof useGreenhouseOptionsQuery>;
export type GreenhouseOptionsLazyQueryHookResult = ReturnType<typeof useGreenhouseOptionsLazyQuery>;
export type GreenhouseOptionsSuspenseQueryHookResult = ReturnType<typeof useGreenhouseOptionsSuspenseQuery>;
export type GreenhouseOptionsQueryResult = Apollo.QueryResult<GreenhouseOptionsQuery, GreenhouseOptionsQueryVariables>;
export const TenantsDocument = gql`
    query Tenants {
  tenants {
    id
    name
    companyName
    email
    phone
    isActive
    disabledSensorFields
    hiddenHarvestDashboardItems
    greenhouses {
      name
      doorPosition
      xDimension
      yDimension
      bayCount
      isHorizontal
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useTenantsQuery__
 *
 * To run a query within a React component, call `useTenantsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTenantsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTenantsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTenantsQuery(baseOptions?: Apollo.QueryHookOptions<TenantsQuery, TenantsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TenantsQuery, TenantsQueryVariables>(TenantsDocument, options);
      }
export function useTenantsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TenantsQuery, TenantsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TenantsQuery, TenantsQueryVariables>(TenantsDocument, options);
        }
// @ts-ignore
export function useTenantsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TenantsQuery, TenantsQueryVariables>): Apollo.UseSuspenseQueryResult<TenantsQuery, TenantsQueryVariables>;
export function useTenantsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TenantsQuery, TenantsQueryVariables>): Apollo.UseSuspenseQueryResult<TenantsQuery | undefined, TenantsQueryVariables>;
export function useTenantsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TenantsQuery, TenantsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TenantsQuery, TenantsQueryVariables>(TenantsDocument, options);
        }
export type TenantsQueryHookResult = ReturnType<typeof useTenantsQuery>;
export type TenantsLazyQueryHookResult = ReturnType<typeof useTenantsLazyQuery>;
export type TenantsSuspenseQueryHookResult = ReturnType<typeof useTenantsSuspenseQuery>;
export type TenantsQueryResult = Apollo.QueryResult<TenantsQuery, TenantsQueryVariables>;
export const TenantDocument = gql`
    query Tenant($id: ID!) {
  tenant(id: $id) {
    id
    name
    companyName
    email
    phone
    isActive
    disabledSensorFields
    hiddenHarvestDashboardItems
    greenhouses {
      name
      doorPosition
      xDimension
      yDimension
      bayCount
      isHorizontal
    }
    createdAt
    updatedAt
    users {
      id
      firstName
      lastName
      email
      role
    }
  }
}
    `;

/**
 * __useTenantQuery__
 *
 * To run a query within a React component, call `useTenantQuery` and pass it any options that fit your needs.
 * When your component renders, `useTenantQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTenantQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useTenantQuery(baseOptions: Apollo.QueryHookOptions<TenantQuery, TenantQueryVariables> & ({ variables: TenantQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TenantQuery, TenantQueryVariables>(TenantDocument, options);
      }
export function useTenantLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TenantQuery, TenantQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TenantQuery, TenantQueryVariables>(TenantDocument, options);
        }
// @ts-ignore
export function useTenantSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TenantQuery, TenantQueryVariables>): Apollo.UseSuspenseQueryResult<TenantQuery, TenantQueryVariables>;
export function useTenantSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TenantQuery, TenantQueryVariables>): Apollo.UseSuspenseQueryResult<TenantQuery | undefined, TenantQueryVariables>;
export function useTenantSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TenantQuery, TenantQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TenantQuery, TenantQueryVariables>(TenantDocument, options);
        }
export type TenantQueryHookResult = ReturnType<typeof useTenantQuery>;
export type TenantLazyQueryHookResult = ReturnType<typeof useTenantLazyQuery>;
export type TenantSuspenseQueryHookResult = ReturnType<typeof useTenantSuspenseQuery>;
export type TenantQueryResult = Apollo.QueryResult<TenantQuery, TenantQueryVariables>;
export const GetTenantBucketDocument = gql`
    query GetTenantBucket($id: ID!) {
  tenant(id: $id) {
    id
    name
    influxBucketName
  }
}
    `;

/**
 * __useGetTenantBucketQuery__
 *
 * To run a query within a React component, call `useGetTenantBucketQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTenantBucketQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTenantBucketQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTenantBucketQuery(baseOptions: Apollo.QueryHookOptions<GetTenantBucketQuery, GetTenantBucketQueryVariables> & ({ variables: GetTenantBucketQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTenantBucketQuery, GetTenantBucketQueryVariables>(GetTenantBucketDocument, options);
      }
export function useGetTenantBucketLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTenantBucketQuery, GetTenantBucketQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTenantBucketQuery, GetTenantBucketQueryVariables>(GetTenantBucketDocument, options);
        }
// @ts-ignore
export function useGetTenantBucketSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTenantBucketQuery, GetTenantBucketQueryVariables>): Apollo.UseSuspenseQueryResult<GetTenantBucketQuery, GetTenantBucketQueryVariables>;
export function useGetTenantBucketSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTenantBucketQuery, GetTenantBucketQueryVariables>): Apollo.UseSuspenseQueryResult<GetTenantBucketQuery | undefined, GetTenantBucketQueryVariables>;
export function useGetTenantBucketSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTenantBucketQuery, GetTenantBucketQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTenantBucketQuery, GetTenantBucketQueryVariables>(GetTenantBucketDocument, options);
        }
export type GetTenantBucketQueryHookResult = ReturnType<typeof useGetTenantBucketQuery>;
export type GetTenantBucketLazyQueryHookResult = ReturnType<typeof useGetTenantBucketLazyQuery>;
export type GetTenantBucketSuspenseQueryHookResult = ReturnType<typeof useGetTenantBucketSuspenseQuery>;
export type GetTenantBucketQueryResult = Apollo.QueryResult<GetTenantBucketQuery, GetTenantBucketQueryVariables>;
export const TenantGreenhousesDocument = gql`
    query TenantGreenhouses($tenantId: ID) {
  tenantGreenhouses(tenantId: $tenantId)
}
    `;

/**
 * __useTenantGreenhousesQuery__
 *
 * To run a query within a React component, call `useTenantGreenhousesQuery` and pass it any options that fit your needs.
 * When your component renders, `useTenantGreenhousesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTenantGreenhousesQuery({
 *   variables: {
 *      tenantId: // value for 'tenantId'
 *   },
 * });
 */
export function useTenantGreenhousesQuery(baseOptions?: Apollo.QueryHookOptions<TenantGreenhousesQuery, TenantGreenhousesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TenantGreenhousesQuery, TenantGreenhousesQueryVariables>(TenantGreenhousesDocument, options);
      }
export function useTenantGreenhousesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TenantGreenhousesQuery, TenantGreenhousesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TenantGreenhousesQuery, TenantGreenhousesQueryVariables>(TenantGreenhousesDocument, options);
        }
// @ts-ignore
export function useTenantGreenhousesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TenantGreenhousesQuery, TenantGreenhousesQueryVariables>): Apollo.UseSuspenseQueryResult<TenantGreenhousesQuery, TenantGreenhousesQueryVariables>;
export function useTenantGreenhousesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TenantGreenhousesQuery, TenantGreenhousesQueryVariables>): Apollo.UseSuspenseQueryResult<TenantGreenhousesQuery | undefined, TenantGreenhousesQueryVariables>;
export function useTenantGreenhousesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TenantGreenhousesQuery, TenantGreenhousesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TenantGreenhousesQuery, TenantGreenhousesQueryVariables>(TenantGreenhousesDocument, options);
        }
export type TenantGreenhousesQueryHookResult = ReturnType<typeof useTenantGreenhousesQuery>;
export type TenantGreenhousesLazyQueryHookResult = ReturnType<typeof useTenantGreenhousesLazyQuery>;
export type TenantGreenhousesSuspenseQueryHookResult = ReturnType<typeof useTenantGreenhousesSuspenseQuery>;
export type TenantGreenhousesQueryResult = Apollo.QueryResult<TenantGreenhousesQuery, TenantGreenhousesQueryVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    clerkUserId
    email
    firstName
    lastName
    imageUrl
    role
    tenantId
    tenant {
      id
      name
      influxBucketName
      createdAt
      isActive
      updatedAt
      disabledSensorFields
      hiddenHarvestDashboardItems
      greenhouses {
        name
        xDimension
        yDimension
        doorPosition
        bayCount
        isHorizontal
      }
    }
    isActive
    status
    preferredLanguage
    farmOverviewTimeRange
    userSettings {
      harvestView {
        sort {
          field
          direction
        }
        range
        collapsedBatchIds
      }
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
// @ts-ignore
export function useMeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery | undefined, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const UsersDocument = gql`
    query Users {
  users {
    id
    clerkUserId
    email
    firstName
    lastName
    imageUrl
    role
    tenantId
    tenant {
      id
      name
      createdAt
      isActive
      updatedAt
    }
    isActive
    status
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useUsersQuery(baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
      }
export function useUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
        }
// @ts-ignore
export function useUsersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<UsersQuery, UsersQueryVariables>): Apollo.UseSuspenseQueryResult<UsersQuery, UsersQueryVariables>;
export function useUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UsersQuery, UsersQueryVariables>): Apollo.UseSuspenseQueryResult<UsersQuery | undefined, UsersQueryVariables>;
export function useUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
        }
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersSuspenseQueryHookResult = ReturnType<typeof useUsersSuspenseQuery>;
export type UsersQueryResult = Apollo.QueryResult<UsersQuery, UsersQueryVariables>;
export const UserDocument = gql`
    query User($id: ID!) {
  user(id: $id) {
    id
    clerkUserId
    email
    firstName
    lastName
    imageUrl
    role
    tenantId
    isActive
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useUserQuery__
 *
 * To run a query within a React component, call `useUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUserQuery(baseOptions: Apollo.QueryHookOptions<UserQuery, UserQueryVariables> & ({ variables: UserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserQuery, UserQueryVariables>(UserDocument, options);
      }
export function useUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserQuery, UserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserQuery, UserQueryVariables>(UserDocument, options);
        }
// @ts-ignore
export function useUserSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<UserQuery, UserQueryVariables>): Apollo.UseSuspenseQueryResult<UserQuery, UserQueryVariables>;
export function useUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UserQuery, UserQueryVariables>): Apollo.UseSuspenseQueryResult<UserQuery | undefined, UserQueryVariables>;
export function useUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UserQuery, UserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<UserQuery, UserQueryVariables>(UserDocument, options);
        }
export type UserQueryHookResult = ReturnType<typeof useUserQuery>;
export type UserLazyQueryHookResult = ReturnType<typeof useUserLazyQuery>;
export type UserSuspenseQueryHookResult = ReturnType<typeof useUserSuspenseQuery>;
export type UserQueryResult = Apollo.QueryResult<UserQuery, UserQueryVariables>;