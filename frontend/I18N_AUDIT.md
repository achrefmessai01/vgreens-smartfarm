# i18n Hard-Coded String Audit

_Generated 2026-05-26. Auditor: subagent. Scope: src/app, src/components._

## Summary
- ~85 files reviewed across `src/app/**` and `src/components/**`
- ~32 files with confirmed leaks
- Approximately 220+ hard-coded user-facing strings (excluding dev/internal-only)
- Notable patterns:
  - **All `tenant/*/error.tsx` and `admin/*/error.tsx` pages hard-code their `title`/`description`/`resetLabel`/`backLink.label` strings** (10 files, ~40 strings)
  - **`/app/admin/settings/page.tsx` and `/app/admin/tenants/[tenantId]/page.tsx` use raw English in `PageHeader`** (not wired through i18n)
  - **`/app/tenant/users/page.tsx`** uses raw English for header/dialog (the parallel `/app/admin/users/page.tsx` is fully translated — drift)
  - **System errors module** (`components/admin/system-errors-*.tsx`, `components/system-errors/*.tsx`) is almost entirely hard-coded — table headers, filters, badges, stats labels, dialog
  - **Locale-blind formatters**: 25+ `toLocaleString()`/`toLocaleDateString()`/`Intl.DateTimeFormat('en-US', …)` calls bypass `useLocaleFormatters`
  - **`error-page.tsx`** uses an English-only `"Report Error"` button label not exposed to translation
  - **`global-error.tsx`, `not-found.tsx`, `offline/page.tsx`** are 100% hard-coded (acceptable for `global-error` since it runs without React context, but `not-found` and `offline` should be translated)
  - **`sidebar-navigation.tsx`** hard-codes all admin nav item labels (Tenants, Users, Feature Flags, Reports, System Errors, Settings)
  - **Error reports module** (`error-report-*.tsx`, `report-form.tsx`) hard-codes most labels, placeholders, severity option text

## Findings by area

### Top-level / app shell

#### `src/app/page.tsx`
- Clean. Uses `t.errors.sessionLoad.*`.

#### `src/app/global-error.tsx`
- L24: `<h2>Something went wrong!</h2>` → `errors.global.title` (acceptable to leave hard-coded — outside i18n context)
- L27-29: `<p>The application encountered a critical error. Please try refreshing the page.</p>` → `errors.global.description`
- L38: `Try again` → `common.tryAgain`

#### `src/app/not-found.tsx`
- L17: `<h2>Page Not Found</h2>` → `errors.notFound.title`
- L19: `<p>The page you are looking for doesn't exist or has been moved.</p>` → `errors.notFound.description`
- L30: `Go Home` → `common.goHome`
- L37: `Go Back` → `common.goBack`

#### `src/app/offline/page.tsx`
- L20-22: `<h1>No Internet Connection</h1>` → `errors.offline.title`
- L23-25: `<p>Please check your connection and try again.</p>` → `errors.offline.description`
- L26-28: `<p>Connect to Wi-Fi or mobile data to continue using vGreens Lab.</p>` → `errors.offline.hint`
- L37: `Reload Page` → `common.reloadPage`
- L42: `Make sure you're connected to the internet` → `errors.offline.footer`

#### `src/app/crash-test/page.tsx`
- Internal dev-only test page; no action needed.

### Error pages (tenant/admin section error boundaries)

These all hard-code `title`, `description`, `resetLabel`, and `backLink.label`:

#### `src/app/error.tsx`
- L23: `title="Something went wrong!"` → `errors.app.title`
- L24: `description="An unexpected error occurred. …"` → `errors.app.description`
- L28: `label: 'Go Home'` → `common.goHome`

#### `src/app/tenant/error.tsx`
- L17: `title="Dashboard Error"` → `errors.tenant.title`
- L18: `description="An error occurred in your farm dashboard. …"` → `errors.tenant.description`
- L23: `label: 'Back to Dashboard'` → `common.backToDashboard`

#### `src/app/tenant/alerts/error.tsx`
- L17: `title="Alerts Section Error"` → `errors.alerts.title`
- L18: `description="Something went wrong with the alerts section. …"` → `errors.alerts.description`
- L21: `resetLabel="Reload Alerts"` → `errors.alerts.resetLabel`
- L24: `label: 'Back to Dashboard'` → `common.backToDashboard`

#### `src/app/tenant/camera-livestream/error.tsx`
- L17-24: `Camera Stream Error`, description, `Reconnect Camera`, `Back to Dashboard` → `errors.camera.*`

#### `src/app/tenant/dashboard/error.tsx`
- L17-24: `Dashboard Error`, description, `Reload Dashboard`, `Back to Dashboard` → `errors.dashboard.*`

#### `src/app/tenant/farm-overview/error.tsx`
- L17-24: `Farm Overview Error`, description, `Reload Overview`, `Back to Dashboard` → `errors.farmOverview.*`

#### `src/app/tenant/harvest/error.tsx`
- L17-24: `Harvest Section Error`, description, `Reload Harvest`, `Back to Dashboard` → `errors.harvest.*`

#### `src/app/tenant/history/error.tsx`
- L17-24: `History Section Error`, description, `Reload History`, `Back to Dashboard` → `errors.history.*`

#### `src/app/tenant/users/error.tsx`
- L17-24: `Users Section Error`, description, `Reload Users`, `Back to Dashboard` → `errors.users.*`

#### `src/app/tenant/warnings/error.tsx`
- L17-24: `Warnings Section Error`, description, `Reload Warnings`, `Back to Dashboard` → `errors.warnings.*`

#### `src/app/admin/error.tsx`
- L17-23: `Admin Section Error`, description, `Back to Admin Dashboard` → `errors.admin.*`

#### `src/app/admin/reports/error.tsx`
- L16-17: `Something went wrong!`, `We encountered an error while loading the reports management page.` → `errors.adminReports.*`

#### `src/app/admin/system-errors/error.tsx`
- L17-26: `System Errors Load Failed`, description, `Back to Dashboard`, `Retry Loading` → `errors.adminSystemErrors.*`

#### `src/app/report-status/error.tsx`
- Similar pattern (not deeply inspected, but uses `ErrorPage` with raw English titles).

#### `src/components/ui/error-page.tsx`
- L205: default `title = 'Something went wrong!'` → key needed
- L206: default `description = 'An unexpected error occurred. Please try again.'` → key needed
- L210: default `resetLabel = 'Try again'` → `common.tryAgain`
- L257: `{sectionName} Section` literal "Section" word → `common.sectionSuffix`
- L290: `Report Error` (button) → `common.reportError`

### Navigation / layout

#### `src/components/layout/sidebar-navigation.tsx`
- L28: `label: 'Tenants'` → `navigation.tenants`
- L33: `label: 'Users'` → `navigation.users` (already exists for tenant nav, but admin nav reuses raw)
- L38: `label: 'Feature Flags'` → `navigation.featureFlags`
- L43: `label: 'Reports'` → `navigation.reports`
- L48: `label: 'System Errors'` → `navigation.systemErrors`
- L53: `label: 'Settings'` → `navigation.settings` (alt: `common.settings` exists)

#### `src/components/layout/navbar.tsx`
- L20: fallback `'User'` → `common.user` (when name missing)
- L25-30: `new Date().toLocaleDateString('en-US', { … })` — locale-blind. Use `useLocaleFormatters.formatDate`.

#### `src/components/layout/sidebar-content.tsx`
- L71-73: `<span>vGreens Lab</span>` — brand name, OK to leave hard-coded.

#### `src/components/layout/user-menu.tsx`
- L51, L63, L90, L207: existing `|| 'User'`, `|| 'U'`, `|| 'User menu'`, `|| 'Logout'` fallbacks — minor (defensive only; primary path uses `t.*`).

#### `src/components/language-switcher.tsx`
- L26: `aria-label="Change language"` → `common.changeLanguage`

#### `src/components/network-status-monitor.tsx`
- L32-34: toast title `'Connection restored'` → `common.connectionRestored`
- L33-34: toast description `'You are back online. …'` → `common.connectionRestoredDescription`
- L40: toast title `'No internet connection'` → `common.noInternet`
- L41-42: toast description `'Please turn on Wi-Fi or mobile data to use this application.'` → `common.noInternetDescription`
- L74-76: `<h2>No internet connection</h2>` → `common.noInternet`
- L78-81: `<p>This application requires an active internet connection. …</p>` → `common.noInternetBlocker`
- L85: `Waiting for connection…` → `common.waitingForConnection`

### Admin pages (raw English in PageHeader)

#### `src/app/admin/settings/page.tsx`
- L7: `title="System Settings"` → `pages.admin.settings.title`
- L8: `subtitle="Configure system-wide settings"` → `pages.admin.settings.subtitle`
- L12-13: `<p>System settings interface coming soon...</p>` → `pages.admin.settings.placeholder`

#### `src/app/admin/system-errors/page.tsx`
- L103: `title="System Error History"` → `pages.admin.systemErrors.title`
- L104: `subtitle="Monitor and manage application errors and exceptions"` → `pages.admin.systemErrors.subtitle`
- L114: `<h3>Error History</h3>` → `pages.admin.systemErrors.listTitle`
- L117-119: `{count} filter(s) active` → `pages.admin.systemErrors.filtersActive`

#### `src/app/admin/tenants/[tenantId]/page.tsx`
- L8: `title="Tenant Details"` → `pages.admin.tenants.detailsTitle`
- L9: `subtitle="View and manage tenant details"` → `pages.admin.tenants.detailsSubtitle`

#### `src/app/admin/tenants/[tenantId]/features/page.tsx`
- L86-87: fallback `'Feature Access'` → existing key works, but `||` fallbacks have English literals.
- L89-91: fallback `'Manage which features are enabled for this tenant'` → key exists.

### Tenant pages

#### `src/app/tenant/users/page.tsx` (the tenant-facing variant — diverged from admin version)
- L49: `title="User Management"` → `pages.users.title`
- L50: `subtitle="Manage users for your tenant"` → `pages.users.subtitleTenant`
- L71: `'Edit User'` → `pages.admin.users.editUser` (already exists)
- L71: `'Create User'` → `pages.admin.users.createUser` (already exists)
- L92: `Cancel` → `pages.users.cancel`
- L101-103: `'Update User'`, `'Create User'` → existing keys
- L114: `title="Delete User"` → `pages.admin.users.deleteUser`
- L115: `description="Are you sure you want to delete this user? …"` → `pages.users.confirmDeleteDescription`
- L116: `confirmLabel="Delete"` → `pages.users.delete`
- L117: `cancelLabel="Cancel"` → `pages.users.cancel`
- L130: `'Unknown User'` → `pages.users.unknownUser`

### Tenants (admin)

#### `src/components/tenants/tenant-form.tsx`
- L150: error literal `'Name is required'` → `pages.admin.tenants.nameRequired`
- L152: error literal `'Invalid email format'` → `pages.admin.tenants.emailInvalid`
- L164: error literal `'Each greenhouse requires a name and positive X/Y dimensions'` → `pages.admin.tenants.greenhousesInvalid`
- L255: `<FieldLabel>Name *</FieldLabel>` → existing keys
- L262: `placeholder="Tenant name"` → `pages.admin.tenants.namePlaceholder`
- L271: `<FieldLabel>Company Name</FieldLabel>` → `pages.admin.tenants.companyName`
- L278: `placeholder="Company name"` → `pages.admin.tenants.companyPlaceholder`
- L285: `<FieldLabel>Email</FieldLabel>` → exists
- L292: `placeholder="contact@company.com"` → `pages.admin.tenants.emailPlaceholder`
- L301: `<FieldLabel>Phone</FieldLabel>` → exists
- L308: `placeholder="+1 (555) 123-4567"` → `pages.admin.tenants.phonePlaceholder`
- L325-326: `Active Status` → exists in admin.users; add for tenants
- L336: `<p>Farm Layout</p>` (section heading) → `pages.admin.tenants.farmLayout.title` (already exists, but not used here)
- L346: `Add greenhouse` → `pages.admin.tenants.farmLayout.add` exists
- L352: `<p>No greenhouse added yet.</p>` → `pages.admin.tenants.farmLayout.noGreenhouses` (exists, slight wording drift)
- L363: `<p>Greenhouse {index + 1}</p>` → use `pages.admin.tenants.farmLayout.greenhouseLabel` with interpolation
- L379: `placeholder="Greenhouse name"` → use `farmLayout.namePlaceholder` (exists)
- L388: `placeholder="X dimension"` → use `farmLayout.xDimensionPlaceholder` (exists)
- L397: `placeholder="Y dimension"` → use `farmLayout.yDimensionPlaceholder` (exists)
- L406: `placeholder="Number of bays"` → `pages.admin.tenants.farmLayout.bayCountPlaceholder` (exists but different value)
- L430: `placeholder="Door position"` → use `farmLayout.doorPositionPlaceholder` (exists)

### Users (admin)

#### `src/components/users/confirmation-dialog.tsx`
- L34: default `confirmLabel = 'Confirm'` → `common.confirm`
- L35: default `cancelLabel = 'Cancel'` → `common.cancel`

### Features (admin)

#### `src/components/features/feature-guard.tsx`
- L62: `title="Feature Not Available"` → `pages.admin.features.featureNotAvailableTitle`
- L63-64: `description="This feature is not enabled for your tenant. Please contact your administrator to request access to this feature."` → `pages.admin.features.featureNotAvailableDescription`
- L65: `badgeText="Not Available"` → `pages.admin.features.notAvailableBadge`
- L67: `redirectLabel={\`Go to ${targetRouteName}\`}` (English `Go to`) → `common.goTo` + interpolation

#### `src/components/ui/feature-not-available-card.tsx`
- L23: default `title = 'Feature Not Available'` → key
- L24-25: default description literal → key
- L26: default `badgeText = 'Not Available'` → key
- L27: default `redirectLabel = 'Go to Dashboard'` → key

### Dashboard

#### `src/components/dashboard/dashboard-content.tsx`
- L111: `title="Active Alerts"` → `pages.tenant.dashboard.activeAlerts`
- L119: `'Irrigation Recommendation'` (fallback) → key
- L122-123: `'Delay irrigation for 6 hours in Zone A. Increase drip rate in Zone C by 10%.'` → key

#### `src/components/dashboard/default-dashboard-data.tsx`
- Whole file is placeholder/demo data, but it does render in `app/admin/dashboard/page.tsx`:
- L12-26: KPI labels: `Farms Online`, `All sites reporting`, `Sensors Online`, `98.7% uptime`, `Average Battery`, `Last 24h average`, `Today's Water Usage`, `Estimated` → all need keys.
- L41: `Average Air Temperature` → key
- L43: `Greenhouse zones` → key
- L49: `Crop Health Score`, `AI-based estimate` → keys
- L56-60: `Predicted Weekly Yield`, `Estimated from growth models`, `Capacity used` → keys
- L64-65: `'3'`, `'Critical sensor readings'` → keys
- L69-71: `Irrigation Recommendation`, recommendation description → keys
- L75-88: `Pump #3`, `Battery 76% · Last seen 5m ago`, etc. (mostly demo data; less critical until real data wired)
- L92: `'Sunny'`, `'25°C · Winds 8 km/h'` → keys
- L98-101: trend labels `Air Temperature`, `Water Usage` → keys
- L105-107: maintenance items → keys
- L110-112: zone names `Zone A/B/C` → may be proper nouns; OK
- L115-116: `Edge sync: 98%`, `Buffered: 12 devices` → keys
- L118: `'Last updated: 2 minutes ago'` → key

### System errors module (heavy hard-coding)

#### `src/components/admin/system-error-card.tsx`
- L68: `<p>Component: {error.component}</p>` → `pages.admin.systemErrors.component`
- L69: `<p>Action: {error.action}</p>` → `pages.admin.systemErrors.action`
- L74-75: `<p>User: {…}</p>` → `pages.admin.systemErrors.user`
- L79: `<p>Tenant: {error.tenant.name}</p>` → `pages.admin.systemErrors.tenant`
- L83: `First: … ago` (template literal) → key
- L88: `Last: … ago` (template literal) → key

#### `src/components/admin/system-error-filters.tsx`
- L36: `<CardTitle>Filters</CardTitle>` → `common.filters`
- L43: `placeholder="Search errors..."` → `pages.admin.systemErrors.searchPlaceholder`
- L52: `placeholder="All Severities"` → `pages.admin.systemErrors.allSeverities`
- L55: `<SelectItem value="">All Severities</SelectItem>` → same key
- L56-60: `Critical`, `Urgent`, `High`, `Medium`, `Low` → `pages.admin.reports.severities.*` keys exist
- L66: `placeholder="All Sources"` → `pages.admin.systemErrors.allSources`
- L69-73: `All Sources`, `Frontend`, `Backend`, `Database`, `External API` → keys
- L87: `<label>Show Resolved</label>` → `pages.admin.systemErrors.showResolved`

#### `src/components/admin/system-error-stats-cards.tsx`
- L26: `<CardTitle>Total Errors (24h)</CardTitle>` → `pages.admin.systemErrors.totalErrors24h`
- L37: `<CardTitle>Unresolved</CardTitle>` → `pages.admin.systemErrors.unresolved`
- L49: `<CardTitle>Critical Errors</CardTitle>` → `pages.admin.systemErrors.criticalErrors`

#### `src/components/admin/system-errors-dashboard.tsx`
- L95: resolution notes `'Resolved from admin dashboard'` (mutation payload; not visible to user — OK)
- L119: `<p>Failed to load system errors: {error.message}</p>` → key
- L128: `<h1>System Error Dashboard</h1>` → `pages.admin.systemErrors.dashboardTitle`
- L130: `<p>Monitor and resolve application errors in real-time</p>` → key
- L135: `Refresh` → `common.refresh`

#### `src/components/admin/system-errors-list.tsx`
- L17: `<CardTitle>Recent System Errors ({errors.length})</CardTitle>` → key
- L24: `<p>No errors found matching your filters.</p>` → key

#### `src/components/system-errors/system-errors-stats-filters.tsx`
- L23: `Last 24 Hours` → key
- L29: `Total errors` → key
- L35: `Active Errors` → key
- L41: `Unresolved issues` → key
- L46: `Resolved` → `pages.admin.reports.statuses.resolved` exists
- L53: `Fixed this period` → key
- L58: `Critical` → exists
- L65: `High priority issues` → key
- L101: `<label>Severity</label>` → key (exists)
- L112: `placeholder="All severities"` → key (exists with capital)
- L115: `All severities` → key
- L116-120: `Low`, `Medium`, `High`, `Critical`, `Urgent` → `pages.admin.reports.severities.*` exists
- L126: `<label>Source</label>` → `pages.admin.reports.source` exists
- L137: `placeholder="All sources"` → key
- L140-148: `All sources`, `Frontend`, `Backend`, `Database`, `External API`, `Infrastructure` → keys
- L155: `<label>Status</label>` → exists
- L168: `placeholder="All statuses"` → key (exists in alerts)
- L171-173: `All statuses`, `Active`, `Resolved` → keys
- L185: `Clear All ({activeFiltersCount})` → key

#### `src/components/system-errors/system-error-details-dialog.tsx`
- L41: `<span>Error Details</span>` → key
- L52: `<Badge>Resolved</Badge>` → exists
- L57: `<Badge>Open</Badge>` → `pages.admin.reports.statuses.open` exists
- L68: `'Resolving...'` / `'Resolve'` → keys
- L74: `<h3>Error Message</h3>` → key
- L82: `Type` → exists
- L86: `Source` → exists
- L90: `Severity` → exists
- L99: `Component:` → key
- L105: `Action:` → key
- L113: `User/Tenant` → key
- L122: `Unknown` → `common.unknown`
- L127: `Frequency` → key
- L129-130: `occurrence/occurrences` literals → key with plural
- L136: `ID: {error.id}` → key
- L138: `Created: … ago` → key
- L141-143: `Last occurred: … ago` → key
- L147-148: `Updated: … ago` → key

#### `src/components/system-errors/system-errors-table.tsx`
- L40-49: column headers `Message`, `Component`, `Type`, `Source`, `Severity`, `Count`, `Status`, `Created`, `User`, `Actions` → keys (many duplicates of `pages.admin.reports.*`)
- L65: `emptyState={{ title: 'No system errors found' }}` → key

#### `src/components/system-errors/system-errors-table-rows.tsx`
- L61: `<Badge>Resolved</Badge>` → exists
- L63: `<Badge>Active</Badge>` → key

#### `src/components/system-errors/system-errors-table-cards.tsx`
- L43-46: `Resolved`/`Active` → keys
- L53, L61, L67, L73, L79, L85, L93: card field labels `Component:`, `Type:`, `Source:`, `Severity:`, `Count:`, `Created:`, `User:` → keys
- L109: `View` → key
- L120: `Resolve` → exists

#### `src/components/system-errors/system-error-table-config.tsx`
- L61-65: `Frontend`, `Backend`, `Database`, `External API`, `Infrastructure` → keys (mostly proper nouns / acceptable)
- L81-82: `ErrorType` enum used directly as label (no translation layer)

### Error reports module

#### `src/components/error-reports/error-report-table.tsx`
- L33: `header: 'Error Title'` → `pages.admin.reports.errorTitle` exists
- L45: `header: 'Submitted By'` → exists
- L57: `header: 'Severity'` → exists
- L64: `header: 'Status'` → exists
- L75: `header: 'Created'` → exists
- L80-84: `new Intl.DateTimeFormat('en-US', { … })` — **locale-blind**. Use `useLocaleFormatters`.
- L91: `header: 'Actions'` → exists
- L148-152: another `new Intl.DateTimeFormat('en-US', …)` — same issue.
- L229-233: third occurrence in card renderer.
- L249: `placeholder: 'Search reports by title, user email...'` → exists
- L258-259: `title: 'No error reports found'`, `description: 'No error reports found'` → exists

#### `src/components/error-reports/error-report-details.tsx`
- L86: `<SheetTitle>Error Report Details</SheetTitle>` → `pages.admin.reports.details.title` exists
- L89: `Review and update error report information` → `pages.admin.reports.details.subtitle` exists
- L137: `<h4>Error Description</h4>` → `pages.admin.reports.details.errorDescription` exists
- L151: `<h4>Steps to Reproduce</h4>` → `pages.admin.reports.details.reproductionSteps` exists
- L167: `<h4>Expected vs Actual</h4>` → exists
- L185: `<CardTitle>Admin Controls</CardTitle>` → exists
- L190: `Severity Level` → exists
- L200-210: `<SelectItem>Low</SelectItem>` etc. → use `severities.*` (exists)
- L217: `Admin Notes` → exists
- L223: `placeholder="Add notes about investigation, resolution, etc."` → exists
- L238: `'Loading...'`, `'Update Report'` → use `pages.admin.reports.details.update`
- L247: `Cancel` → exists

#### `src/components/error-reports/error-report-delete-dialog.tsx`
- L45: `<DialogTitle>Delete Error Report</DialogTitle>` → `pages.admin.reports.deleteDialog.title` exists
- L47-49: `Are you sure you want to delete the report "{reportTitle}"? This action cannot be undone.` → exists (close)
- L53: `Cancel` → exists
- L60: `Deleting...` / `Delete` → keys

#### `src/components/error-reports/error-report-quick-actions.tsx`
- L54: `<SelectItem>Open</SelectItem>` → use `pages.admin.reports.statuses.open`
- L55: `<SelectItem>In Progress</SelectItem>` → exists
- L56: `<SelectItem>Resolved</SelectItem>` → exists

#### `src/components/error-reports/report-form.tsx`
- L51: `Back to Dashboard` → `common.backToDashboard`
- L59: `<h1>Report an Error</h1>` → `pages.report.title`
- L62-63: `<p>Help us improve by reporting any issues you've encountered.</p>` → key
- L71: `<label>Your Email (Optional)</label>` → key
- L79: `placeholder="your.email@example.com"` → exists pattern
- L82: `<p>We'll only use this to follow up if needed.</p>` → key
- L89: `<label>Error Title</label>` → key
- L98: `placeholder="Brief description of the issue"` → key
- L105: `<label>Severity Level</label>` → key
- L114-128: `Low - Minor inconvenience`, `Medium - Affects functionality`, `High - Blocks important tasks`, `Critical - System unusable`, `Urgent - Immediate attention required` → keys (new — these compound labels do not exist yet)
- L134: `<label>Affected Section</label>` → key
- L142: `placeholder="e.g., Dashboard, Harvest, Farm Overview"` → key
- L149: `<label>Detailed Description</label>` → key
- L158: `placeholder="Describe what happened, what you expected, and what went wrong..."` → key
- L165: `<label>Steps to Reproduce (Optional)</label>` → key
- L174: placeholder `'1. First I did...\n2. Then I clicked...\n3. The error occurred when...'` → key
- L182: `Screenshots or Images (Optional)` → key
- L192: `Click to upload images` → key
- L195: `Image up to 10MB (Max 3 files)` → key
- L243-251: `Submitting...`, `Submit Report` → keys
- L259-260: `Your report helps us improve the platform for everyone. Thank you for your feedback!` → key

#### `src/components/error-reports/report-success-screen.tsx`
- L26: `<h2>Report Submitted!</h2>` → key
- L28-30: `<p>Thank you for your report. …</p>` → key
- L38: `View Report Status` → key
- L46: `Redirecting to report status in 3 seconds...` → key

### Tenants module (admin)

#### `src/components/tenants/tenant-table-cards.tsx`
- Renderer is fully driven by `translations` prop — clean.

#### `src/components/tenants/tenant-table-rows.tsx`
- Same — uses `translations` prop. Clean.

### Sensor config

#### `src/components/sensor-config/sensor-config-form.tsx`
- L94: `\`Default: ${def.xPosition}\`` (placeholder) → `pages.admin.tenants.sensorConfig.defaultPrefix` + interpolation
- L95: `\`Default: ${def.yPosition}\`` → same
- L209: `placeholder="Select a greenhouse"` → `pages.admin.tenants.sensorConfig.selectGreenhouse`
- L215: `No greenhouses configured for this tenant.` → key
- L217: `—` → OK punctuation

#### `src/components/sensor-config/sensor-config-table.tsx`
- L104, L119: `title="Auto-generated default"` (tooltips) → key
- L133: `<span>Not configured</span>` → key

### Farm overview

#### `src/components/farm-overview/sensor-hover-card.tsx`
- L112: `{new Date(time).toLocaleString()}` — locale-blind. Use `formatDateTime`.
- L118: `{new Date(start).toLocaleString()}` — locale-blind.
- L124: `{new Date(stop).toLocaleString()}` — locale-blind.

#### `src/components/farm-overview/history-drawer.tsx`
- L194: `t.pages.farmOverview.emptyHistoryDrawerPlaceholder` — clean.
- L204-207: `date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })` — **locale-blind**. Use `formatDate`.
- L214: `date.toLocaleString()` — locale-blind. Use `formatDateTime`.

#### `src/components/farm-overview/time-range-selector.tsx`
- L61-66: `new Intl.DateTimeFormat(undefined, …)` — `undefined` falls back to user locale; OK.

#### `src/components/farm-overview/par-graph-header.tsx`
- L40: `umol m^-2 s^-1` (PAR unit) — technical unit, OK per scope.
- L51: `mol m^-2` — technical unit, OK.

#### `src/components/farm-overview/views/view-sensor-map.tsx`
- L503: default `invalidDropTitle = 'Invalid position'` → `pages.farmOverview.invalidDropTitle` (exists)
- L504: default `invalidDropDescription = 'Drop the sensor inside the greenhouse layout.'` → exists
- L742: `<p>Configure greenhouse dimensions to view layout</p>` → key
- L761: `<p>No sensor data</p>` → `pages.farmOverview.noData` exists (close match)

#### `src/components/farm-overview/system-overview.tsx`
- L53: `|| 'System Overview'` (fallback) → key exists; minor.

#### `src/components/farm-overview/empty-state.tsx`
- Renderer is driven by `message` prop. Clean.

### Alerts

#### `src/components/alerts/alert-table-utils.tsx`
- L101: `return date.toLocaleString();` — locale-blind. Use `formatDateTime`.
- L115-124: hard-coded label map for sensor fields: `Temperature`, `Humidity`, `VPD`, `Soil moisture`, `Soil EC`, `Soil temp`, `PAR`, `CO2` → keys (some exist in `pages.farmOverview.*`)

#### `src/components/alerts/alert-sidebar.tsx`
- L81: `return new Date(timestamp).toLocaleString();` — locale-blind.
- L93: `'Just now'` → `common.justNow`
- L94: `\`${diffMins} min ago\`` → key with interpolation
- L95: `\`${diffHours} h ago\`` → key
- L96: `\`${diffDays} days ago\`` → key
- L97: `return d.toLocaleString();` — locale-blind.

#### `src/components/alerts/alert-table-config.tsx`
- Clean: all labels from `t.pages.alerts.*`.

### Warnings

#### `src/components/warnings/warning-sidebar.tsx`
- L66: `new Date(warning.timestamp).toLocaleString()` — locale-blind.

#### `src/components/warnings/warning-table-utils.tsx`
- L59-63: time-ago labels `'Just now'`, `\`${diffMins}m ago\``, `\`${diffHours}h ago\``, `\`${diffDays}d ago\`` → keys
- L63: `return date.toLocaleDateString();` — locale-blind (no locale arg).

### Harvest

#### `src/components/harvest/harvest-export-dialog.tsx`
- L77: `d.toLocaleDateString(undefined, …)` — `undefined` honors user locale; OK.
- All text uses `h?.... || 'fallback'` patterns. Fallbacks ship English text but real path uses i18n. Minor.

#### `src/components/harvest/batch-sidebar/batch-sidebar.tsx`
- L98: template literal `\`${h?.batchDetails ?? 'Batch Details'} for ${currentData.greenhouse.name}\`` — English "for" word → key with interpolation

#### `src/components/harvest/batch-sidebar/fields/batch-sidebar-yield-field.tsx`
- L49-55: `new Date(harvestDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })` — OK (uses `undefined` locale).
- L152: `<span>Show row coordinates</span>` → key
- L173, L197: literal `kg` — OK per scope (technical unit).
- L222-223: literal `rows` → key

#### `src/components/harvest/batch-sidebar/fields/batch-sidebar-brix-field.tsx`
- L61: `<span>Add Brix measurements</span>` → key
- L118: `aria-label="Remove reading"` → key
- L135: `Add Brix reading` → key

#### `src/components/harvest/dashboard/harvest-dashboard.tsx`
- L98-99: `Comparing {n} batch{plural} for {filterLabel}` template → key with interpolation/plural
- L137: `'Try Again'` fallback → `common.retry` (exists)
- L160-162: `<p>Selected batch not found — showing all batches.</p>` → key
- L175: `\`No harvests for ${selectedBatch.name} in ${filterLabel}\`` → key

#### `src/components/harvest/dashboard/harvest-dashboard-filters.tsx`
- L132-133: `'Select batches'`, `\`${n} batch${plural} selected\`` → keys
- L139: `Pick up to {MAX} batches to compare` → key
- L184-187: `'Loading batches...'`, `'All batches'`, `'No batches yet'` → keys
- L193: `All batches` (inline) → key
- L217: `'Exit compare'` / `'Compare'` → keys

#### `src/components/harvest/dashboard/harvest-dashboard-compare.tsx`
- L82: `<p>Select at least 2 batches to compare</p>` → key
- L84-86: `<p>Use the dropdown above to pick up to 4 batches…</p>` → key
- L239: `<p>No harvests in this period</p>` → key

#### `src/components/harvest/create-batch/create-batch-dialog.tsx`
- Uses `h?... || '...'` fallbacks. Real path uses i18n; only English literals in fallbacks (minor).

#### `src/components/harvest/dialogs/edit-harvest-dialog.tsx`
- L62: `'View batch form details.'` — literal-only (no fallback to i18n) → key

#### `src/components/harvest/table/harvest-batch-group.tsx`
- All labels read from `h?.*` with English fallbacks. Real path is translated; only fallbacks ship English. Minor (acceptable).

### History components

#### `src/components/history/revenue-card.tsx`
- L47, L54, L62, L70, L76: `€{data.X.toLocaleString()}` — `toLocaleString()` without locale arg uses runtime default. Use `formatCurrency` / `formatNumber`. Currency symbol `€` is hard-coded — consider `formatCurrency`.

#### `src/components/history/summary-metric-card.tsx`
- L74: `value.toLocaleString()` — locale-blind. Use `formatNumber`.
- L103: literal `'+'` prefix — OK punctuation.

#### `src/components/history/expense-donut-chart.tsx`
- L69: `€{item.value.toLocaleString()}` — locale-blind + hard-coded currency.

### Chart / UI primitives

#### `src/components/ui/chart.tsx`
- L239: `{item.value.toLocaleString()}` — locale-blind. Use `formatNumber`.

#### `src/components/ui/date-range-picker.tsx`
- L23: `d.toLocaleDateString(undefined, …)` — OK (user locale).
- L72-74: `\`From ${formatDate(dateFrom)}\``, `\`Until ${formatDate(dateTo)}\`` — English "From"/"Until" words → use i18n keys
- L97: `<label>From</label>` → `common.from` / existing key
- L108: `<label>To</label>` → `common.to` / existing key
- L120: `Clear` → `common.clear`
- L122: `Apply` → `common.apply`

#### `src/components/ui/coming-soon-card.tsx`
- L24: default `badgeText = 'Coming Soon'` → `common.comingSoon` / `pages.cameraLivestream.comingSoon`

#### `src/components/ui/page-skeleton.tsx`
- L19: `aria-label="Loading"` → `common.loading` (exists)

#### `src/components/ui/content-skeleton.tsx`
- L25: `aria-label="Loading content"` → key

#### `src/components/ui/sidebar-skeleton.tsx`
- L18: `aria-label="Loading sidebar"` → key

#### `src/components/ui/table-skeleton.tsx`
- L40: `aria-label="Loading table"` → key

#### `src/components/ui/toast-provider.tsx`
- L133: `aria-label="Dismiss notification"` → `common.dismissNotification`

#### `src/components/ui/table-pagination.tsx`
- L107, L145: `aria-label="Pagination"` → `common.pagination`

#### `src/components/ui/styled-select.tsx`
- (Not deeply inspected) — placeholder is prop-driven.

### Locale-blind formatters

Collated list of every call that hard-codes a locale or uses `toLocaleString`/`toLocaleDateString` without going through `useLocaleFormatters`:

| File | Line | Pattern |
| --- | --- | --- |
| `src/components/layout/navbar.tsx` | 25 | `new Date().toLocaleDateString('en-US', { … })` — hard-coded `'en-US'` |
| `src/components/error-reports/error-report-table.tsx` | 80, 148, 229 | `new Intl.DateTimeFormat('en-US', { … })` ×3 |
| `src/components/farm-overview/history-drawer.tsx` | 204 | `date.toLocaleDateString('en-US', { … })` |
| `src/components/farm-overview/history-drawer.tsx` | 214 | `date.toLocaleString()` (default locale) |
| `src/components/farm-overview/sensor-hover-card.tsx` | 112, 118, 124 | `new Date(...).toLocaleString()` (no locale) |
| `src/components/alerts/alert-table-utils.tsx` | 101 | `date.toLocaleString()` |
| `src/components/alerts/alert-sidebar.tsx` | 81, 97 | `new Date(...).toLocaleString()` |
| `src/components/warnings/warning-table-utils.tsx` | 63 | `date.toLocaleDateString()` |
| `src/components/warnings/warning-sidebar.tsx` | 66 | `new Date(...).toLocaleString()` |
| `src/components/harvest/batch-sidebar/fields/batch-sidebar-yield-field.tsx` | 49 | `toLocaleDateString(undefined, …)` — OK (uses `undefined`) |
| `src/components/harvest/harvest-export-dialog.tsx` | 77 | `toLocaleDateString(undefined, …)` — OK |
| `src/components/ui/date-range-picker.tsx` | 23 | `toLocaleDateString(undefined, …)` — OK |
| `src/components/ui/chart.tsx` | 239 | `value.toLocaleString()` (no locale) |
| `src/components/history/expense-donut-chart.tsx` | 69 | `item.value.toLocaleString()` |
| `src/components/history/revenue-card.tsx` | 47, 54, 62, 70, 76 | `value.toLocaleString()` ×5 |
| `src/components/history/summary-metric-card.tsx` | 74 | `value.toLocaleString()` |
| `src/components/farm-overview/time-range-selector.tsx` | 61 | `new Intl.DateTimeFormat(undefined, …)` — OK |

The hard-coded `'en-US'` calls in `navbar.tsx`, `error-report-table.tsx`, and `history-drawer.tsx` are the highest-priority — they actively override the active locale.

## Internal-only / dev pages (noted separately)

- `src/app/crash-test/page.tsx` — full of hard-coded English, but it's a developer-only test page. Skip.
- `src/components/examples/user-list-example.tsx` — example/docs component (`Loading users...`, `No users found`, `Users (Example)`, `Role:`, `No email`). Skip.
- `src/components/admin/system-errors-dashboard.tsx` — appears to be a parallel/legacy dashboard, possibly replaced by `app/admin/system-errors/page.tsx`. Worth verifying if it's reachable.

## Notes
- Many components use the pattern `h?.someKey || 'English fallback'`. The real path uses i18n, but the English fallbacks ship in the bundle and would display if the key is ever missing. Optional cleanup: drop fallbacks once English source is verified to cover all keys.
- The biggest cluster of easy wins is the 12 `tenant/admin/*/error.tsx` boundaries — same shape, all hard-coded.
- The next biggest cluster is the entire system-errors module — adding `pages.admin.systemErrors.*` keys would clean up ~8 files at once.
- Locale-blind `toLocaleString()` calls in `history/`, `chart.tsx`, and `summary-metric-card.tsx` should all be replaced with `useLocaleFormatters().formatNumber` / `formatCurrency`.
- The `'en-US'` hard-codes in `navbar.tsx`, `error-report-table.tsx`, and `history-drawer.tsx` are guaranteed locale bugs once the user switches language — they should be the first to fix.

### Files audited but clean (sample)
- `src/i18n/**` (out of scope)
- `src/app/admin/dashboard/page.tsx`, `src/app/admin/users/page.tsx`, `src/app/admin/tenants/page.tsx`, `src/app/admin/reports/page.tsx`, `src/app/admin/feature-flags/page.tsx` — all use `t.*` consistently.
- `src/components/tenants/tenant-table.tsx`, `tenant-details-tabs.tsx`, `tenant-features-tab.tsx` — clean.
- `src/components/users/user-management-form.tsx`, `user-form-fields.tsx`, `user-management-table.tsx` — clean.
- `src/components/features/feature-form.tsx`, `feature-list.tsx`, `feature-table.tsx` — clean.
- `src/components/farm-overview/farm-overview.tsx`, `tunnel-card.tsx`, `par-graph-section.tsx` — clean.
- `src/components/harvest/dialogs/delete-harvest-dialog.tsx`, `create-batch-dialog.tsx`, `harvest-page-header.tsx`, `harvest-table.tsx`, `dashboard/yield-prediction-card.tsx` — translated (with English fallbacks).
- `src/components/alerts/alert-form.tsx`, `alert-hard-delete-dialog.tsx`, `alert-table-config.tsx` — clean.
- `src/components/warnings/warning-sidebar-fields.tsx`, `warning-table-rows.tsx` (driven by prop) — clean.
- `src/components/login-form.tsx` — clean.
- `src/components/farm-config/farm-layout-config.tsx`, `greenhouse-row.tsx` — clean.

### Remaining areas not yet exhaustively audited

Spot-checked but not line-by-line: `src/components/farm-overview/views/*` (other than `view-sensor-map.tsx`), `src/components/farm-overview/combined-greenhouse/*`, `src/components/dashboard/*` (other than `dashboard-content.tsx` and `default-dashboard-data.tsx`), `src/components/harvest/dashboard/charts/*`, `src/components/harvest/dashboard/metric-card/*`, `src/components/history/history-chart.tsx`, `src/components/history/history-table.tsx`, `src/components/history/opex-revenue-chart.tsx`, `src/components/ui/data-table/*` and most other `src/components/ui/*` primitives — these likely contain a few more strings, primarily column headers and aria-labels, but the patterns above (untranslated table headers, status-label maps, `toLocaleString()` calls) repeat.
