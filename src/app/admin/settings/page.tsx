"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, X } from "lucide-react";

type BusinessSettings = {
  paymentMethods: {
    cash: boolean;
    card: boolean;
    online: boolean;
    bank_transfer: boolean;
  };
  disabledDays: string[];
  notificationSettings: {
    sameDay: boolean;
    emailOnBooking: boolean;
  };
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>({
    paymentMethods: {
      cash: true,
      card: false,
      online: false,
      bank_transfer: false,
    },
    disabledDays: [],
    notificationSettings: {
      sameDay: true,
      emailOnBooking: true,
    },
  });
  const [newDisabledDay, setNewDisabledDay] = useState("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/login");
      return;
    }
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  const addDisabledDay = () => {
    if (newDisabledDay && !settings.disabledDays.includes(newDisabledDay)) {
      setSettings({
        ...settings,
        disabledDays: [...settings.disabledDays, newDisabledDay].sort(),
      });
      setNewDisabledDay("");
    }
  };

  const removeDisabledDay = (day: string) => {
    setSettings({
      ...settings,
      disabledDays: settings.disabledDays.filter(d => d !== day),
    });
  };

  const togglePaymentMethod = (method: keyof typeof settings.paymentMethods) => {
    setSettings({
      ...settings,
      paymentMethods: {
        ...settings.paymentMethods,
        [method]: !settings.paymentMethods[method],
      },
    });
  };

  if (loading) return <div className="container section text-center">Loading...</div>;

  return (
    <div className="section container">
      <h1 className="mb-lg">Business Settings</h1>

      <div className="grid-2" style={{ gap: "2rem" }}>
        {/* Payment Methods */}
        <div className="card">
          <h2 className="mb-md">Payment Methods</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
            Select which payment methods customers can use
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {Object.entries(settings.paymentMethods).map(([method, enabled]) => (
              <label key={method} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => togglePaymentMethod(method as keyof typeof settings.paymentMethods)}
                  style={{ cursor: "pointer", width: "18px", height: "18px" }}
                />
                <span style={{ textTransform: "capitalize" }}>
                  {method.replace("_", " ")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Disabled Days */}
        <div className="card">
          <h2 className="mb-md">Disabled Booking Days</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
            Select dates when bookings cannot be made
          </p>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <input
              type="date"
              value={newDisabledDay}
              onChange={(e) => setNewDisabledDay(e.target.value)}
              style={{ flex: 1 }}
            />
            <button onClick={addDisabledDay} className="btn btn-primary" style={{ padding: "0.5rem 1rem" }}>
              <Plus size={18} />
            </button>
          </div>

          {settings.disabledDays.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {settings.disabledDays.map((day) => (
                <div
                  key={day}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "0.5rem",
                  }}
                >
                  <span>{new Date(day).toLocaleDateString()}</span>
                  <button
                    onClick={() => removeDisabledDay(day)}
                    className="btn btn-secondary"
                    style={{ padding: "0.25rem 0.5rem" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No disabled days set</p>
          )}
        </div>

        {/* Notification Settings */}
        <div className="card">
          <h2 className="mb-md">Notification Settings</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.notificationSettings.sameDay}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notificationSettings: {
                      ...settings.notificationSettings,
                      sameDay: e.target.checked,
                    },
                  })
                }
                style={{ cursor: "pointer", width: "18px", height: "18px" }}
              />
              <span>Send notifications on same day of booking</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.notificationSettings.emailOnBooking}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notificationSettings: {
                      ...settings.notificationSettings,
                      emailOnBooking: e.target.checked,
                    },
                  })
                }
                style={{ cursor: "pointer", width: "18px", height: "18px" }}
              />
              <span>Send email confirmation on booking</span>
            </label>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <button onClick={saveSettings} className="btn btn-primary">
          <Save size={18} /> Save Settings
        </button>
        {saved && (
          <span style={{ color: "var(--success)", fontWeight: "bold", display: "flex", alignItems: "center" }}>
            ✓ Settings saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
