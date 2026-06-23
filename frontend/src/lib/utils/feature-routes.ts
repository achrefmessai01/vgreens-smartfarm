/**
 * Feature Access Control and Route Mapping
 *
 * This module defines the mapping between features and their routes,
 * and provides utilities for determining accessible routes based on
 * enabled features.
 */

export interface FeatureRoute {
  featureKey: string | null; // null means always accessible
  path: string;
  name: string;
  priority: number; // Lower number = higher priority for fallback redirect
}

/**
 * Feature route configuration
 * This can be extended or replaced with dynamic configuration from backend
 */
interface FeatureRouteConfig {
  featureKey: string | null;
  path: string;
  name: string;
}

/**
 * Base feature route configurations
 * Can be extended by calling registerFeatureRoute()
 */
const baseFeatureRouteConfigs: FeatureRouteConfig[] = [
  {
    featureKey: 'farm_overview',
    path: '/tenant/farm-overview',
    name: 'Farm Overview',
  },
  {
    featureKey: 'harvest_management',
    path: '/tenant/harvest',
    name: 'Harvest',
  },
  {
    featureKey: 'user_management',
    path: '/tenant/users',
    name: 'Users',
  },
  {
    featureKey: 'sensor_alerts',
    path: '/tenant/alerts',
    name: 'Alerts',
  },
  {
    featureKey: 'camera_livestream',
    path: '/tenant/camera-livestream',
    name: 'Camera Livestream',
  },
  {
    featureKey: 'data_analytics',
    path: '/tenant/history',
    name: 'History',
  },
  {
    featureKey: 'device_status',
    path: '/tenant/devices',
    name: 'Device Status',
  },
];

/**
 * Runtime registry for additional feature routes
 */
const additionalFeatureRoutes: FeatureRouteConfig[] = [];

/**
 * Register a new feature route dynamically
 * Useful for plugins or dynamic feature additions
 */
export function registerFeatureRoute(config: FeatureRouteConfig): void {
  // Check if route already exists
  const existingIndex = additionalFeatureRoutes.findIndex(
    (route) => route.path === config.path,
  );

  if (existingIndex >= 0) {
    // Update existing route
    additionalFeatureRoutes[existingIndex] = config;
  } else {
    // Add new route
    additionalFeatureRoutes.push(config);
  }
}

/**
 * Remove a feature route from the registry
 */
export function unregisterFeatureRoute(path: string): void {
  const index = additionalFeatureRoutes.findIndex(
    (route) => route.path === path,
  );
  if (index >= 0) {
    additionalFeatureRoutes.splice(index, 1);
  }
}

/**
 * Get all feature routes with computed priorities
 * Combines base routes and dynamically registered routes
 */
function getAllFeatureRouteConfigs(): FeatureRouteConfig[] {
  return [...baseFeatureRouteConfigs, ...additionalFeatureRoutes];
}

/**
 * Compute priority based on position in the list
 * Routes without feature keys (always accessible) get lowest priority for fallback
 * Feature-based routes get priority based on their order
 */
function computePriority(route: FeatureRouteConfig, index: number): number {
  // Dashboard and other always-accessible routes get very low priority
  if (route.featureKey === null) {
    return 1000 + index;
  }
  // Feature-based routes get priority based on their position
  return index;
}

/**
 * All tenant routes with their associated feature keys
 * Dynamically computed with priorities
 */
export function getFeatureRoutes(): FeatureRoute[] {
  const configs = getAllFeatureRouteConfigs();

  return configs.map((config, index) => ({
    ...config,
    priority: computePriority(config, index),
  }));
}

/**
 * Legacy export for backward compatibility
 * Recommends using getFeatureRoutes() for dynamic updates
 */
export const FEATURE_ROUTES = getFeatureRoutes();

/**
 * Get the feature key required for a given route
 */
export function getFeatureKeyForRoute(path: string): string | null {
  const route = getFeatureRoutes().find((r) => r.path === path);
  return route?.featureKey ?? null;
}

/**
 * Get all accessible routes for the given set of enabled features
 */
export function getAccessibleRoutes(
  enabledFeatures: Set<string>,
): FeatureRoute[] {
  return getFeatureRoutes().filter(
    (route) =>
      route.featureKey === null || enabledFeatures.has(route.featureKey),
  );
}

/**
 * Find the best fallback route when access is denied
 * Prioritizes enabled features over the dashboard
 * Returns the first accessible feature route, or dashboard as last resort
 */
export function findFallbackRoute(enabledFeatures: Set<string>): string | null {
  const accessibleRoutes = getAccessibleRoutes(enabledFeatures);

  if (accessibleRoutes.length === 0) {
    // If no accessible routes, fall back to dashboard (should always be accessible)
    return '/tenant/dashboard';
  }

  // Sort by priority
  const sortedRoutes = accessibleRoutes.sort((a, b) => a.priority - b.priority);

  // Prioritize enabled features over dashboard
  // Find the first route that requires a feature (not null featureKey)
  const firstFeatureRoute = sortedRoutes.find(
    (route) => route.featureKey !== null,
  );

  // If we found an enabled feature, use that; otherwise use the first accessible route (likely dashboard)
  return firstFeatureRoute ? firstFeatureRoute.path : sortedRoutes[0].path;
}

/**
 * Check if a user has access to a specific route
 */
export function canAccessRoute(
  path: string,
  enabledFeatures: Set<string>,
): boolean {
  const featureKey = getFeatureKeyForRoute(path);

  // Routes without feature keys are always accessible
  if (featureKey === null) {
    return true;
  }

  // Check if the required feature is enabled
  return enabledFeatures.has(featureKey);
}

/**
 * Get a user-friendly name for a route
 * Returns a generic label for dashboard to avoid "Admin Dashboard" confusion
 */
export function getRouteDisplayName(path: string): string {
  const route = getFeatureRoutes().find((r) => r.path === path);

  // For dashboard, return generic label
  if (path === '/tenant/dashboard') {
    return 'Available Page';
  }

  return route?.name ?? 'Available Page';
}
