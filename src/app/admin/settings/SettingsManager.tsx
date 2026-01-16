'use client'

import { useState } from 'react'
import { updateGlobalSettings, updateWorkSchedule, addAvailabilityOverride, deleteAvailabilityOverride } from '../actions'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'

type Settings = {
    currentPrice: number
    sessionDuration: number
}

type Schedule = {
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
}

type Override = {
    id: string
    date: Date
    startTime: string
    endTime: string
}

export function SettingsManager({ 
    initialSettings, 
    initialSchedule, 
    initialOverrides 
}: { 
    initialSettings: Settings, 
    initialSchedule: Schedule[],
    initialOverrides: Override[]
}) {
    const router = useRouter()
    
    // -- General Settings --
    const [settings, setSettings] = useState(initialSettings)
    const [isSavingSettings, setIsSavingSettings] = useState(false)

    const saveSettings = async () => {
        setIsSavingSettings(true)
        await updateGlobalSettings({
            currentPrice: Number(settings.currentPrice),
            sessionDuration: Number(settings.sessionDuration)
        })
        setIsSavingSettings(false)
        router.refresh()
    }

    // -- Schedule --
    // Map array to object for easier editing
    const [schedule, setSchedule] = useState(() => {
        const map: Record<number, Schedule> = {}
        // Initialize defaults for all days if not present
        for (let i = 0; i <= 6; i++) {
            const existing = initialSchedule.find(s => s.dayOfWeek === i)
            if (existing) map[i] = existing
            else map[i] = { dayOfWeek: i, startTime: '09:00', endTime: '18:00', isActive: false }
        }
        return map
    })
    const [isSavingSchedule, setIsSavingSchedule] = useState(false)

    const handleScheduleChange = (day: number, field: keyof Schedule, value: any) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }))
    }

    const saveSchedule = async () => {
        setIsSavingSchedule(true)
        await updateWorkSchedule(Object.values(schedule))
        setIsSavingSchedule(false)
        router.refresh()
    }

    const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

    // -- Overrides --
    const [newOverride, setNewOverride] = useState({ date: '', startTime: '09:00', endTime: '18:00' })
    const [isAddingOverride, setIsAddingOverride] = useState(false)

    const addOverride = async () => {
        if (!newOverride.date) return
        setIsAddingOverride(true)
        await addAvailabilityOverride({
            date: new Date(newOverride.date),
            startTime: newOverride.startTime,
            endTime: newOverride.endTime
        })
        setNewOverride({ date: '', startTime: '09:00', endTime: '18:00' })
        setIsAddingOverride(false)
        router.refresh()
    }

    const deleteOverride = async (id: string) => {
        if (!confirm('Eliminar excepción?')) return
        await deleteAvailabilityOverride(id)
        router.refresh()
    }

    return (
        <div className="space-y-12 max-w-4xl">
            
            {/* General Settings */}
            <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border dark:border-neutral-700">
                <h2 className="text-xl font-bold mb-4">Configuración General</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Precio por Sesión ($)</label>
                        <input 
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-700"
                            value={settings.currentPrice}
                            onChange={(e) => setSettings({...settings, currentPrice: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Duración Sesión (minutos)</label>
                        <input 
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-700"
                            value={settings.sessionDuration}
                            onChange={(e) => setSettings({...settings, sessionDuration: Number(e.target.value)})}
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={saveSettings} disabled={isSavingSettings}>
                        {isSavingSettings ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </section>

            {/* Weekly Schedule */}
            <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border dark:border-neutral-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Horarios Semanales</h2>
                    <Button onClick={saveSchedule} disabled={isSavingSchedule}>
                        {isSavingSchedule ? 'Guardando...' : 'Guardar Horarios'}
                    </Button>
                </div>
                <div className="space-y-4">
                    {DAYS.map((dayName, idx) => (
                        <div key={idx} className={`flex items-center gap-4 p-3 rounded-lg border ${schedule[idx].isActive ? 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700' : 'bg-gray-50 dark:bg-neutral-900 border-transparent opacity-75'}`}>
                            <div className="w-32 flex items-center gap-2">
                                <input 
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={schedule[idx].isActive}
                                    onChange={(e) => handleScheduleChange(idx, 'isActive', e.target.checked)}
                                />
                                <span className="font-medium">{dayName}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <input 
                                    type="time" 
                                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={schedule[idx].startTime}
                                    onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                                    disabled={!schedule[idx].isActive}
                                />
                                <span>a</span>
                                <input 
                                    type="time" 
                                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={schedule[idx].endTime}
                                    onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                                    disabled={!schedule[idx].isActive}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Exceptions */}
            <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border dark:border-neutral-700">
                <h2 className="text-xl font-bold mb-4">Días Excepcionales (Overrides)</h2>
                <p className="text-sm text-gray-500 mb-4">Agrega disponibilidad específica para una fecha puntual. Esto sobreescribe (o agrega) al horario semanal.</p>
                
                <div className="flex flex-wrap gap-4 items-end mb-6 bg-gray-50 dark:bg-neutral-900 p-4 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha</label>
                        <input 
                            type="date" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-700"
                            value={newOverride.date}
                            onChange={(e) => setNewOverride({...newOverride, date: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Inicio</label>
                        <input 
                            type="time" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-700"
                            value={newOverride.startTime}
                            onChange={(e) => setNewOverride({...newOverride, startTime: e.target.value})}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Fin</label>
                        <input 
                            type="time" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-700"
                            value={newOverride.endTime}
                            onChange={(e) => setNewOverride({...newOverride, endTime: e.target.value})}
                        />
                    </div>
                    <Button onClick={addOverride} disabled={isAddingOverride}>
                        Agregar
                    </Button>
                </div>

                <div className="space-y-2">
                    {initialOverrides.map(ov => (
                        <div key={ov.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg">
                            <div className="flex gap-4">
                                <span className="font-bold">{format(ov.date, 'dd/MM/yyyy')}</span>
                                <span>{ov.startTime} - {ov.endTime}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteOverride(ov.id)}>
                                Eliminar
                            </Button>
                        </div>
                    ))}
                    {initialOverrides.length === 0 && (
                        <p className="text-gray-400 italic">No hay excepciones configuradas.</p>
                    )}
                </div>
            </section>
        </div>
    )
}
