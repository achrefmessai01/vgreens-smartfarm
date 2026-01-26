import { PageHeader } from '@/components/layout'

export default function TenantDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Your tenant dashboard overview" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* TODO: Add tenant dashboard metrics */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Active Tunnels</h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Open Warnings</h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Active Alerts</h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">System Health</h3>
          <p className="text-2xl font-bold">-</p>
        </div>
      </div>
    </div>
  )
}
