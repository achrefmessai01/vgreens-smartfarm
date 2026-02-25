# GraphQL API — Frontend Developer Guide

This document describes the VGreens SmartFarm backend GraphQL API so the frontend can integrate with it.

---

## 1. Overview

- **Endpoint:** `POST /graphql` (e.g. `http://localhost:8080/graphql` or deployed backend URL `https://vgreens-backend.fly.dev/graphql`).
- **Schema:** Auto-generated from NestJS resolvers; **introspection is enabled**, so you can use GraphQL Playground or any client (Apollo, urql, etc.) to discover the full schema.
- **Playground:** Apollo Sandbox is available at the same URL (GET) for exploring and testing queries/mutations.

---

## 2. Authentication

All GraphQL operations **require authentication** unless explicitly marked public.

- **Method:** Bearer token (Clerk session token).
- **Header:**  
  `Authorization: Bearer <clerk_session_token>`
- **How to get the token (frontend):** Use Clerk’s `getToken()` from `@clerk/clerk-react` (or equivalent) and send it in the `Authorization` header on every GraphQL request.

**Public operations (no auth):**

- `health` — query that returns `"OK"` (useful for liveness checks).

**Example (conceptual):**

```ts
const token = await getToken();
const res = await fetch(`${API_URL}/graphql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify({ query: '...', variables: {} }),
});
```

---

## 3. CORS & Headers

The backend allows:

- **Origins:** Configured app URLs and `http://localhost:3000`.
- **Methods:** GET, POST, PUT, DELETE, OPTIONS.
- **Headers:** `Content-Type`, `Authorization`, `apollo-require-preflight`, `x-client-url`.
- **Credentials:** Allowed (cookies/credentials can be sent if you use them).

Send `Content-Type: application/json` for GraphQL request bodies.

---

## 4. Error Format

Errors are returned in the standard GraphQL `errors` array. Each error has:

- `message`: string
- `extensions.code`: one of `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_USER_INPUT`, `INTERNAL_SERVER_ERROR`
- `extensions.statusCode`: HTTP-style status code (optional)

Handle at least `UNAUTHENTICATED` (e.g. redirect to login) and `FORBIDDEN` (insufficient role).

---

## 5. Using Apollo Client

Call the API with **Apollo Client** the same way you would with REST: one endpoint, one client, send the Bearer token in the header.

- **Endpoint:** Set `NEXT_PUBLIC_GRAPHQL_ENDPOINT` (e.g. `http://localhost:8080/graphql` or `https://vgreens-backend.fly.dev/graphql`).
- **Auth:** Add `Authorization: Bearer <token>` to every request (e.g. Clerk’s `getToken()`).
- **Queries** = GET-like: use `client.query()` or hooks like `useQuery` / `useAlertsQuery` (if you use codegen).
- **Mutations** = POST-like: use `client.mutate()` or hooks like `useMutation` / `useAcknowledgeAlertMutation`.

Example with the client directly (like a REST call):

```ts
import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    headers: { authorization: token ? `Bearer ${token}` : '' },
  }),
  cache: new InMemoryCache(),
});

// Query (like GET)
const { data } = await client.query({
  query: gql`
    query {
      alerts(filter: { status: "open" }) {
        id
        sensorName
        value
      }
    }
  `,
});

// Mutation (like POST)
await client.mutate({
  mutation: gql`
    mutation ($id: ID!) {
      acknowledgeAlert(id: $id) {
        id
        status
      }
    }
  `,
  variables: { id: alertId },
});
```

Wrap the app in `ApolloProvider` and pass the same token (e.g. from Clerk) into the client so all requests are authenticated.

---

## 6. Roles & Multi-Tenancy

- **Roles:** `VGREENS_ADMIN` | `TENANT_ADMIN` | `TENANT_USER`
- **VGREENS_ADMIN:** Can access all tenants and all admin-only operations.
- **TENANT_ADMIN / TENANT_USER:** Scoped to a single tenant; `tenantId` is derived from the authenticated user. Some operations are admin-only (e.g. create/delete alert, manage users).

Where “Roles” are listed below, only those roles can call that operation. If the user has no tenant (e.g. tenant not set in DB), operations that require tenant context may return an error.

---

## 7. Queries & Mutations Reference

### 7.1 App (Health)

| Operation | Type  | Auth   | Description    |
| --------- | ----- | ------ | -------------- |
| `health`  | Query | Public | Returns `"OK"` |

---

### 7.2 Alerts

**Queries**

| Name     | Returns   | Roles                                    | Arguments                              | Description                                                     |
| -------- | --------- | ---------------------------------------- | -------------------------------------- | --------------------------------------------------------------- |
| `alerts` | `[Alert]` | VGREENS_ADMIN, TENANT_ADMIN, TENANT_USER | `filter: AlertsFilterInput` (optional) | List alerts. Admin: all tenants; tenant users: own tenant only. |
| `alert`  | `Alert`   | VGREENS_ADMIN, TENANT_ADMIN, TENANT_USER | `id: ID!`                              | Single alert by ID (tenant-scoped for non-admin).               |

**Mutations**

| Name                | Returns   | Roles                                    | Arguments                              | Description                                                            |
| ------------------- | --------- | ---------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| `createAlert`       | `Alert`   | VGREENS_ADMIN, TENANT_ADMIN              | `input: CreateAlertInput!`             | Create alert; `tenantId` optional (defaults to current user’s tenant). |
| `updateAlert`       | `Alert`   | VGREENS_ADMIN, TENANT_ADMIN, TENANT_USER | `id: ID!`, `input: UpdateAlertInput!`  | Update alert.                                                          |
| `acknowledgeAlert`  | `Alert`   | VGREENS_ADMIN, TENANT_ADMIN, TENANT_USER | `id: ID!`                              | Set alert to acknowledged, set acknowledgedBy/acknowledgedTime.        |
| `resolveAlert`      | `Alert`   | VGREENS_ADMIN, TENANT_ADMIN, TENANT_USER | `id: ID!`                              | Set alert to resolved, set resolvedBy/resolvedTime.                    |
| `deleteAlert`       | `Boolean` | VGREENS_ADMIN, TENANT_ADMIN              | `id: ID!`                              | Delete alert.                                                          |
| `runThresholdCheck` | `Boolean` | (no role enforced)                       | `tenantId: ID!`, `bucketName: String!` | Run threshold check for a tenant’s bucket (internal/admin use).        |

**AlertsFilterInput** (all optional)

- `search`: string — generic search (sensor name, acknowledged by, resolved by, value)
- `dateFrom`, `dateTo`: ISO date strings — filter by timestamp/createdAt
- `status`: AlertStatus
- `statusIn`: [AlertStatus] — OR of statuses
- `severity`: AlertSeverity
- `severityIn`: [AlertSeverity] — OR of severities
- `acknowledgedById`, `acknowledgedByIdIn`: ID / [ID]
- `resolvedById`, `resolvedByIdIn`: ID / [ID]

**CreateAlertInput**

- Required: `sensorName`, `value`
- Optional: `tenantId`, `tunnelId`, `severity`, `description`, `ruleKey`, `timestamp`, `field`, `measurement`, `device`, `greenhouse`, `city`, `column`, `row`, `profile`

**UpdateAlertInput** (all optional)

- `sensorName`, `value`, `status`, `description`, `field`, `measurement`, `device`, `greenhouse`, `city`, `column`, `row`, `profile`

**Alert** type (main fields)

- `id`, `tenantId`, `tenant`, `tunnelId`, `sensorName`, `value`, `status`, `severity`, `description`, `ruleKey`, `timestamp`
- `field`, `measurement`, `device`, `greenhouse`, `city`, `column`, `row`, `profile`
- `acknowledgedById`, `acknowledgedBy` (User), `acknowledgedTime`
- `resolvedById`, `resolvedBy` (User), `resolvedTime`
- `createdAt`, `updatedAt`

**Enums**

- **AlertStatus:** `open` | `acknowledged` | `resolved`
- **AlertSeverity:** `critical`

---

### 7.3 Tenants

**Queries**

| Name      | Returns    | Roles         | Arguments | Description          |
| --------- | ---------- | ------------- | --------- | -------------------- |
| `tenants` | `[Tenant]` | VGREENS_ADMIN | —         | All tenants.         |
| `tenant`  | `Tenant`   | VGREENS_ADMIN | `id: ID!` | Single tenant by ID. |

**Mutations**

| Name           | Returns   | Roles         | Arguments                              | Description    |
| -------------- | --------- | ------------- | -------------------------------------- | -------------- |
| `createTenant` | `Tenant`  | VGREENS_ADMIN | `input: CreateTenantInput!`            | Create tenant. |
| `updateTenant` | `Tenant`  | VGREENS_ADMIN | `id: ID!`, `input: UpdateTenantInput!` | Update tenant. |
| `deleteTenant` | `Boolean` | VGREENS_ADMIN | `id: ID!`                              | Delete tenant. |

**CreateTenantInput**

- Required: `name`
- Optional: `companyName`, `email`, `phone`, `isActive` (default true)

**UpdateTenantInput**

- Same fields as create, all optional (partial update).

**Tenant** type

- `id`, `name`, `companyName`, `email`, `phone`, `isActive`, `influxBucketName`, `timezone`, `createdAt`, `updatedAt`
- `users`, `tenantFeatures` (relations, optional)

---

### 7.4 Users

**Queries**

| Name    | Returns  | Roles                       | Arguments | Description                                         |
| ------- | -------- | --------------------------- | --------- | --------------------------------------------------- |
| `me`    | `User`   | Any authenticated user      | —         | Current user (from Clerk token).                    |
| `users` | `[User]` | VGREENS_ADMIN, TENANT_ADMIN | —         | All users (admin) or tenant users (tenant admin).   |
| `user`  | `User`   | VGREENS_ADMIN, TENANT_ADMIN | `id: ID!` | Single user by ID (tenant-scoped for tenant admin). |

**Mutations**

| Name         | Returns   | Roles                       | Arguments                            | Description                                                                |
| ------------ | --------- | --------------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| `createUser` | `User`    | VGREENS_ADMIN, TENANT_ADMIN | `input: CreateUserInput!`            | Create user. Tenant admin: only in their tenant, cannot set VGREENS_ADMIN. |
| `updateUser` | `User`    | VGREENS_ADMIN, TENANT_ADMIN | `id: ID!`, `input: UpdateUserInput!` | Update user.                                                               |
| `deleteUser` | `Boolean` | VGREENS_ADMIN, TENANT_ADMIN | `id: ID!`                            | Delete user.                                                               |

**CreateUserInput**

- Required: `email`
- Optional: `clerkUserId`, `firstName`, `lastName`, `imageUrl`, `role`, `tenantId` (admin only; tenant admin’s tenant is auto-set)

**UpdateUserInput**

- Optional: same as create + `isActive`, `role`

**User** type

- `id`, `clerkUserId`, `email`, `firstName`, `lastName`, `imageUrl`, `role`, `tenantId`, `tenant`, `isActive`, `status`, `createdAt`, `updatedAt`

**Enums**

- **UserRole:** `TENANT_USER` | `TENANT_ADMIN` | `VGREENS_ADMIN`
- **UserStatus:** `PENDING` | `ACTIVE` | `INACTIVE`

---

### 7.5 Features

**Queries**

| Name                       | Returns                     | Roles                                    | Arguments                 | Description                                                              |
| -------------------------- | --------------------------- | ---------------------------------------- | ------------------------- | ------------------------------------------------------------------------ |
| `features`                 | `[Feature]`                 | VGREENS_ADMIN                            | —                         | All features.                                                            |
| `featuresWithTenantStatus` | `[FeatureWithTenantStatus]` | VGREENS_ADMIN                            | `tenantId: ID` (optional) | All features with enabled flag for a tenant.                             |
| `feature`                  | `Feature`                   | VGREENS_ADMIN                            | `id: ID!`                 | Single feature by ID.                                                    |
| `tenantFeatures`           | `[TenantFeature]`           | VGREENS_ADMIN, TENANT_ADMIN, TENANT_USER | `tenantId: ID` (optional) | Features enabled for a tenant. If not admin, uses current user’s tenant. |

**Mutations**

| Name                  | Returns         | Roles         | Arguments                               | Description                          |
| --------------------- | --------------- | ------------- | --------------------------------------- | ------------------------------------ |
| `createFeature`       | `Feature`       | VGREENS_ADMIN | `input: CreateFeatureInput!`            | Create feature.                      |
| `updateFeature`       | `Feature`       | VGREENS_ADMIN | `id: ID!`, `input: UpdateFeatureInput!` | Update feature.                      |
| `deleteFeature`       | `Boolean`       | VGREENS_ADMIN | `id: ID!`                               | Delete feature.                      |
| `toggleTenantFeature` | `TenantFeature` | VGREENS_ADMIN | `input: ToggleTenantFeatureInput!`      | Enable/disable feature for a tenant. |

**CreateFeatureInput**

- Required: `key`, `name`
- Optional: `description`, `category`, `isActive`

**UpdateFeatureInput**

- Required: `id`
- Optional: `key`, `name`, `description`, `category`, `isActive`

**ToggleTenantFeatureInput**

- `tenantId: ID!`, `featureId: ID!`, `enabled: Boolean!`

**Feature** type

- `id`, `key`, `name`, `description`, `category`, `isActive`, `createdAt`, `updatedAt`

**FeatureWithTenantStatus** type

- Same as Feature + `enabledForTenant: Boolean` (for the requested tenant).

**TenantFeature** type

- `id`, `tenantId`, `featureId`, `feature`, `enabled`, `createdAt`, `updatedAt`

---

### 7.6 InfluxDB (Sensor / Bucket Data)

**Queries**

| Name                     | Returns          | Roles | Arguments                                         | Description                                                    |
| ------------------------ | ---------------- | ----- | ------------------------------------------------- | -------------------------------------------------------------- |
| `testInfluxDBConnection` | `String`         | Auth  | —                                                 | Test InfluxDB connection; returns success or error message.    |
| `getBuckets`             | `[String]`       | Auth  | —                                                 | List bucket names.                                             |
| `getBucketData`          | `[InfluxDBData]` | Auth  | See below                                         | Query data from a bucket.                                      |
| `getBucketFields`        | `[String]`       | Auth  | `bucketName: String!`, `start`, `stop` (optional) | Unique `_field` values in bucket (e.g. humidity, temperature). |

**getBucketData** arguments

- `bucketName: String!` — e.g. tenant’s `influxBucketName`
- Optional: `start` (default `-1h`), `stop`, `limit` (default 100), `field`, `greenhouse`, `device`, `level`

**InfluxDBData** type

- `data: JSON` — raw object per row (fields/tags from InfluxDB).

Time range: `start`/`stop` use InfluxDB-style relative (e.g. `-1h`) or absolute RFC3339 strings.

---

## 8. Example Operations

**Health (no auth):**

```graphql
query Health {
  health
}
```

**Current user:**

```graphql
query Me {
  me {
    id
    email
    firstName
    lastName
    role
    tenantId
  }
}
```

**Alerts list with filter:**

```graphql
query Alerts($filter: AlertsFilterInput) {
  alerts(filter: $filter) {
    id
    sensorName
    value
    status
    severity
    description
    timestamp
    field
    acknowledgedBy {
      id
      firstName
      lastName
    }
    resolvedBy {
      id
      firstName
      lastName
    }
    acknowledgedTime
    resolvedTime
    createdAt
  }
}
# Variables: { "filter": { "status": "open", "severityIn": ["critical"] } }
```

**Acknowledge alert:**

```graphql
mutation AcknowledgeAlert($id: ID!) {
  acknowledgeAlert(id: $id) {
    id
    status
    acknowledgedTime
  }
}
```

**Tenant list (admin):**

```graphql
query Tenants {
  tenants {
    id
    name
    companyName
    isActive
    influxBucketName
  }
}
```

**InfluxDB bucket data:**

```graphql
query BucketData($bucketName: String!, $start: String, $limit: Int) {
  getBucketData(bucketName: $bucketName, start: $start, limit: $limit) {
    data
  }
}
```

---

## 9. Introspection & Codegen

- **Introspection:** Enabled. Use your backend URL with `POST /graphql` and an introspection query (or Apollo Sandbox) to get the full schema.
- **Codegen:** Point your GraphQL codegen config (e.g. GraphQL Code Generator) at the same endpoint with the same `Authorization` header if required; the schema is the same as used at runtime.

---

## 10. Summary for Frontend

1. Send **Bearer token** (Clerk) in `Authorization` on every request except `health`.
2. Use **POST /graphql** with JSON body: `{ "query": "...", "variables": {} }`.
3. Handle **errors** by `extensions.code` (e.g. `UNAUTHENTICATED`, `FORBIDDEN`).
4. **Tenant scope:** For non–VGREENS_ADMIN users, all alert/user/feature data is scoped to their tenant; no need to pass tenantId for list/read in most cases.
5. Use **introspection** or the Playground to see exact types and required arguments; this doc is a quick reference, not a replacement for the live schema.

If you need more detail on a specific type or input, use the in-app GraphQL Playground or your IDE’s GraphQL plugin against the running backend.
