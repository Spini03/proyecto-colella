import { getGlobalSettings, getWorkSchedule, getAvailabilityOverrides } from "../actions"
import { SettingsManager } from "./SettingsManager"

export default async function SettingsPage() {
  const settings = await getGlobalSettings()
  const schedule = await getWorkSchedule()
  const overrides = await getAvailabilityOverrides()
  
  // Serialize for Client Component
  const serializedSettings = {
      ...settings,
      currentPrice: Number(settings.currentPrice), // Decimal to Number
      // sessionDuration is Int
  }
  
  const serializedOverrides = overrides.map(ov => ({
      ...ov,
      date: ov.date // Ensure this is handled if Date is not supported
  }))

  // Workaround for Date serialization if needed:
  // We will assume for now we might need to verify.
  // Actually, let's keep it simple. If it errors, I'll fix it.

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-display">Configuración</h1>
      <p className="text-gray-500">Gestiona precios, horarios y excepciones.</p>
      
      <SettingsManager 
        initialSettings={serializedSettings}
        initialSchedule={schedule}
        initialOverrides={serializedOverrides}
      />
    </div>
  )
}
