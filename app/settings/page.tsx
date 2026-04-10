import { TopBar } from "@/components/layout/TopBar";

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" />
      <main className="flex-1 p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Profile */}
          <section className="bg-white rounded-xl shadow-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Profile</h2>
            <div className="space-y-3">
              {[
                { label: "Name", defaultValue: "Alex Operator" },
                { label: "Email", defaultValue: "alex@vendor.com", type: "email" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-text-secondary mb-1">{f.label}</label>
                  <input
                    type={f.type ?? "text"}
                    defaultValue={f.defaultValue}
                    className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg text-text-primary outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
              <button className="mt-1 h-8 px-4 text-xs font-medium bg-accent text-white rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-white rounded-xl shadow-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Notifications</h2>
            <div className="space-y-3">
              {[
                { label: "Machine goes offline", description: "Get alerted when a machine loses connection" },
                { label: "Low stock alerts", description: "Notify when any slot drops below 25%" },
                { label: "Daily revenue summary", description: "Daily email with revenue stats" },
                { label: "Error events", description: "Alert on hardware errors or jams" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-text-primary">{item.label}</p>
                    <p className="text-xs text-text-tertiary">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Integrations */}
          <section className="bg-white rounded-xl shadow-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Integrations</h2>
            <div className="space-y-2">
              {[
                { name: "Mapbox", desc: "Machine location map", connected: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN },
                { name: "Redis", desc: "Dashboard caching (5min TTL)", connected: true },
                { name: "PostgreSQL", desc: "Primary database", connected: true },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-tertiary">{item.desc}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.connected ? "bg-green-50 text-success" : "bg-gray-100 text-text-tertiary"
                    }`}
                  >
                    {item.connected ? "Connected" : "Not configured"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
