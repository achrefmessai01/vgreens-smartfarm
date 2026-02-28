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
};

export type Alert = {
  __typename?: 'Alert';
  acknowledgedBy?: Maybe<User>;
  acknowledgedById?: Maybe<Scalars['ID']['output']>;
  acknowledgedTime?: Maybe<Scalars['DateTime']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  column?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
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

export type CreateFeatureInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  key: Scalars['String']['input'];
  name: Scalars['String']['input'];
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
  field: Scalars['String']['output'];
  greenhouse?: Maybe<Scalars['String']['output']>;
  time: Scalars['DateTime']['output'];
  value: Scalars['Float']['output'];
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
  windowMinutes?: Scalars['Int']['input'];
};

export type GetParDliTodayInput = {
  bucketName: Scalars['String']['input'];
  greenhouse: Scalars['String']['input'];
};

export type InfluxDbData = {
  __typename?: 'InfluxDBData';
  data: Scalars['JSONObject']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acknowledgeAlert: Alert;
  createAlert: Alert;
  createFeature: Feature;
  createTenant: Tenant;
  createUser: User;
  deleteAlert: Scalars['Boolean']['output'];
  deleteFeature: Scalars['Boolean']['output'];
  deleteTenant: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  resolveAlert: Alert;
  runThresholdCheck: Scalars['Boolean']['output'];
  toggleTenantFeature: TenantFeature;
  updateAlert: Alert;
  updateFeature: Feature;
  updateTenant: Tenant;
  updateUser: User;
};


export type MutationAcknowledgeAlertArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateAlertArgs = {
  input: CreateAlertInput;
};


export type MutationCreateFeatureArgs = {
  input: CreateFeatureInput;
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


export type MutationDeleteFeatureArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTenantArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationResolveAlertArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRunThresholdCheckArgs = {
  bucketName: Scalars['String']['input'];
  tenantId: Scalars['ID']['input'];
};


export type MutationToggleTenantFeatureArgs = {
  input: ToggleTenantFeatureInput;
};


export type MutationUpdateAlertArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAlertInput;
};


export type MutationUpdateFeatureArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFeatureInput;
};


export type MutationUpdateTenantArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTenantInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

export type ParDliPoint = {
  __typename?: 'ParDliPoint';
  dli: Scalars['Float']['output'];
  time: Scalars['DateTime']['output'];
};

export type Query = {
  __typename?: 'Query';
  alert?: Maybe<Alert>;
  alerts: Array<Alert>;
  feature?: Maybe<Feature>;
  features: Array<Feature>;
  featuresWithTenantStatus: Array<FeatureWithTenantStatus>;
  getBucketData: Array<InfluxDbData>;
  getBucketFieldMeansLastMinutes: Array<FieldMeanMetric>;
  getBucketFields: Array<Scalars['String']['output']>;
  getBuckets: Array<Scalars['String']['output']>;
  getParDliToday: Array<ParDliPoint>;
  health: Scalars['String']['output'];
  me?: Maybe<User>;
  tenant?: Maybe<Tenant>;
  tenantFeatures: Array<TenantFeature>;
  tenants: Array<Tenant>;
  testInfluxDBConnection: Scalars['String']['output'];
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryAlertArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAlertsArgs = {
  filter?: InputMaybe<AlertsFilterInput>;
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


export type QueryGetParDliTodayArgs = {
  input: GetParDliTodayInput;
};


export type QueryTenantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTenantFeaturesArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type Tenant = {
  __typename?: 'Tenant';
  companyName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
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

export type UpdateFeatureInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
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

export type User = {
  __typename?: 'User';
  clerkUserId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  role: UserRole;
  status?: Maybe<UserStatus>;
  tenant?: Maybe<Tenant>;
  tenantId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** User role types */
export enum UserRole {
  TenantAdmin = 'TENANT_ADMIN',
  TenantUser = 'TENANT_USER',
  VgreensAdmin = 'VGREENS_ADMIN'
}

/** User invitation and activation status */
export enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

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

export type CreateTenantMutationVariables = Exact<{
  input: CreateTenantInput;
}>;


export type CreateTenantMutation = { __typename?: 'Mutation', createTenant: { __typename?: 'Tenant', id: string, name: string, companyName?: string | null, email?: string | null, phone?: string | null, isActive: boolean, createdAt: any, updatedAt: any } };

export type UpdateTenantMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTenantInput;
}>;


export type UpdateTenantMutation = { __typename?: 'Mutation', updateTenant: { __typename?: 'Tenant', id: string, name: string, companyName?: string | null, email?: string | null, phone?: string | null, isActive: boolean, createdAt: any, updatedAt: any } };

export type DeleteTenantMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTenantMutation = { __typename?: 'Mutation', deleteTenant: boolean };

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

export type DeleteAlertMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteAlertMutation = { __typename?: 'Mutation', deleteAlert: boolean };

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


export type GetBucketFieldMeansLastMinutesQuery = { __typename?: 'Query', getBucketFieldMeansLastMinutes: Array<{ __typename?: 'FieldMeanMetric', field: string, greenhouse?: string | null, value: number }> };

export type GetParDliTodayQueryVariables = Exact<{
  input: GetParDliTodayInput;
}>;


export type GetParDliTodayQuery = { __typename?: 'Query', getParDliToday: Array<{ __typename?: 'ParDliPoint', time: any, dli: number }> };

export type TenantsQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantsQuery = { __typename?: 'Query', tenants: Array<{ __typename?: 'Tenant', id: string, name: string, companyName?: string | null, email?: string | null, phone?: string | null, isActive: boolean, createdAt: any, updatedAt: any }> };

export type TenantQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TenantQuery = { __typename?: 'Query', tenant?: { __typename?: 'Tenant', id: string, name: string, companyName?: string | null, email?: string | null, phone?: string | null, isActive: boolean, createdAt: any, updatedAt: any, users?: Array<{ __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null, role: UserRole }> | null } | null };

export type GetTenantBucketQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTenantBucketQuery = { __typename?: 'Query', tenant?: { __typename?: 'Tenant', id: string, name: string, influxBucketName?: string | null } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, clerkUserId: string, email?: string | null, firstName?: string | null, lastName?: string | null, imageUrl?: string | null, role: UserRole, tenantId?: string | null, isActive: boolean, status?: UserStatus | null, createdAt: any, updatedAt: any, tenant?: { __typename?: 'Tenant', id: string, name: string, influxBucketName?: string | null, createdAt: any, isActive: boolean, updatedAt: any } | null } | null };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, clerkUserId: string, email?: string | null, firstName?: string | null, lastName?: string | null, imageUrl?: string | null, role: UserRole, tenantId?: string | null, isActive: boolean, status?: UserStatus | null, createdAt: any, updatedAt: any, tenant?: { __typename?: 'Tenant', id: string, name: string, createdAt: any, isActive: boolean, updatedAt: any } | null }> };

export type UserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, clerkUserId: string, email?: string | null, firstName?: string | null, lastName?: string | null, imageUrl?: string | null, role: UserRole, tenantId?: string | null, isActive: boolean, createdAt: any, updatedAt: any } | null };


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
export const CreateTenantDocument = gql`
    mutation CreateTenant($input: CreateTenantInput!) {
  createTenant(input: $input) {
    id
    name
    companyName
    email
    phone
    isActive
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
export const GetParDliTodayDocument = gql`
    query GetParDliToday($input: GetParDliTodayInput!) {
  getParDliToday(input: $input) {
    time
    dli
  }
}
    `;

/**
 * __useGetParDliTodayQuery__
 *
 * To run a query within a React component, call `useGetParDliTodayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetParDliTodayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetParDliTodayQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetParDliTodayQuery(baseOptions: Apollo.QueryHookOptions<GetParDliTodayQuery, GetParDliTodayQueryVariables> & ({ variables: GetParDliTodayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetParDliTodayQuery, GetParDliTodayQueryVariables>(GetParDliTodayDocument, options);
      }
export function useGetParDliTodayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetParDliTodayQuery, GetParDliTodayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetParDliTodayQuery, GetParDliTodayQueryVariables>(GetParDliTodayDocument, options);
        }
// @ts-ignore
export function useGetParDliTodaySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetParDliTodayQuery, GetParDliTodayQueryVariables>): Apollo.UseSuspenseQueryResult<GetParDliTodayQuery, GetParDliTodayQueryVariables>;
export function useGetParDliTodaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetParDliTodayQuery, GetParDliTodayQueryVariables>): Apollo.UseSuspenseQueryResult<GetParDliTodayQuery | undefined, GetParDliTodayQueryVariables>;
export function useGetParDliTodaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetParDliTodayQuery, GetParDliTodayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetParDliTodayQuery, GetParDliTodayQueryVariables>(GetParDliTodayDocument, options);
        }
export type GetParDliTodayQueryHookResult = ReturnType<typeof useGetParDliTodayQuery>;
export type GetParDliTodayLazyQueryHookResult = ReturnType<typeof useGetParDliTodayLazyQuery>;
export type GetParDliTodaySuspenseQueryHookResult = ReturnType<typeof useGetParDliTodaySuspenseQuery>;
export type GetParDliTodayQueryResult = Apollo.QueryResult<GetParDliTodayQuery, GetParDliTodayQueryVariables>;
export const TenantsDocument = gql`
    query Tenants {
  tenants {
    id
    name
    companyName
    email
    phone
    isActive
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
    }
    isActive
    status
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