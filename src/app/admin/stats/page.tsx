'use client'

import { useState, useEffect } from 'react'
import { BarChart2, Save, Loader2 } from 'lucide-react'

type Stat = { icon: string; value: number; suffix: string; label: string }

export default function StatsAdminPage() {
  const [stats, setStats] = useState<Stat[]>([
    { icon: '🏃', value: 500, suffix: '+', label: 'Clientes recuperados' },
    { icon: '📅', value: 1000, suffix: '+', label: 'Sesiones realizadas' },
    { icon: '⭐', value: 98, suffix: '%', label: 'Satisfacción de pacientes' },
    { icon: '🏆', value: 10, suffix: '+', label: 'Años de experiencia' },
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { if (data.stats) setStats(data.stats); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleChange = (i: number, field: keyof Stat, value: string) => {
    setStats(prev => prev.map((s, idx) =>
      idx === i ? { ...s, [field]: field === 'value' ? Number(value) : value } : s
    ))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { alert('Error al guardar') }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="animate-spin h-8 w-8 text-teal-500" />
    </div>
  )

  return (
    <div className="space-y-8 pb-20">
      <div className="border-b border-gray-200 dark:border-neutral-800 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart2 className="h-6 w-6 text-teal-500" />
          <h1 className="text-4xl font-extrabold font-display tracking-tight text-gray-900 dark:text-white">Estadísticas Web</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Editá los números de la home. Los cambios se aplican instantáneamente.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{stat.icon}</span>
              <p className="font-black text-gray-900 dark:text-white text-lg">{stat.value}{stat.suffix} <span className="text-sm font-normal text-gray-400">{stat.label}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Número</label>
                <input type="number" value={stat.value} onChange={e => handleChange(i, 'value', e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm focus:outline-none focus:border-teal-500/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sufijo</label>
                <input type="text" value={stat.suffix} onChange={e => handleChange(i, 'suffix', e.target.value)} placeholder="+ o %"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm focus:outline-none focus:border-teal-500/50" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Etiqueta</label>
              <input type="text" value={stat.label} onChange={e => handleChange(i, 'label', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm focus:outline-none focus:border-teal-500/50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ícono (emoji)</label>
              <input type="text" value={stat.icon} onChange={e => handleChange(i, 'icon', e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm focus:outline-none focus:border-teal-500/50" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved && <p className="text-sm text-teal-400 font-medium">✓ Cambios guardados y aplicados en la home</p>}
      </div>
    </div>
  )
}
