import { ThemeToggle } from "@/components/layout/ThemeToggle"

export const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences and settings.</p>
      </div>

      <div className="space-y-4">
        {/* Appearance Settings */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-lg">Appearance</h3>
              <p className="text-sm text-muted-foreground">Customize how the application looks on your device.</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Security Settings (Placeholder) */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 opacity-60">
          <div>
            <h3 className="font-medium text-lg">Account Security</h3>
            <p className="text-sm text-muted-foreground mb-4">Update your password and secure your account.</p>
            <p className="text-sm italic text-muted-foreground">This feature is coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
