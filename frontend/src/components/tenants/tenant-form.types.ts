// Shared types for the tenant-create/edit form. Lives outside `tenant-form.tsx`
// so the field sub-components can import them without pulling in the parent
// (which would create a circular dependency).

export interface TenantFormData {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  /**
   * Whitelist of email domains accepted for users assigned to this tenant.
   * Empty array (or omitted) = unrestricted. Stored bare + lowercase.
   */
  allowedDomains: string[];
  bayCount?: number;
  chambersCount?: number;
}

export interface TenantFormErrors {
  name?: string;
  email?: string;
}
