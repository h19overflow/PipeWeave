export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">API Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Backend URL
            </label>
            <input
              type="text"
              defaultValue="http://localhost:8000"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">Theme settings coming soon.</p>
      </div>
    </div>
  );
}
