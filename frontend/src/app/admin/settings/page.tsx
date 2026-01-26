import { PageHeader } from '@/components/layout'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        subtitle="Configure system-wide settings"
      />
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          System settings interface coming soon...
        </p>
      </div>
    </div>
  )
}
