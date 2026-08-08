export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure CareerPilot AI preferences.
        </p>
      </div>

      <div className="card-premium p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Backend Connection</h2>
        <div>
          <p className="text-xs text-muted-foreground mb-1">API URL</p>
          <code className="text-sm text-primary bg-primary/10 px-3 py-1.5 rounded-lg block">
            {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001"}
          </code>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure via <code className="text-foreground">NEXT_PUBLIC_API_URL</code> in <code className="text-foreground">.env.local</code>
        </p>
      </div>

      <div className="card-premium p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">AI Configuration</h2>
        <p className="text-xs text-muted-foreground">
          The Gemini API key is configured server-side in the backend's <code className="text-foreground">.env</code> file as <code className="text-foreground">GEMINI_API_KEY</code>. It is never exposed to the browser.
        </p>
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-emerald-400">
            ✓ API key is server-side only — secure by design
          </p>
        </div>
      </div>
    </div>
  );
}
