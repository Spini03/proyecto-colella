'use client'

import { useState, useEffect } from 'react'
import { updateGlobalSettings, updateWorkSchedule, addAvailabilityOverride, deleteAvailabilityOverride } from '../actions'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'


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
    const [overrides, setOverrides] = useState(initialOverrides)
    const [newOverride, setNewOverride] = useState({ date: '', startTime: '09:00', endTime: '18:00' })
    const [isAddingOverride, setIsAddingOverride] = useState(false)
    const [dateError, setDateError] = useState<string | null>(null)

    // Sync from props if they change (e.g. initial load or subsequent server refresh)
    useEffect(() => {
        setOverrides(initialOverrides)
    }, [initialOverrides])

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value
        setNewOverride({...newOverride, date: dateStr})
        
        if (!dateStr) {
            setDateError(null)
            return
        }

        // Validate date vs today
        const todayStr = format(new Date(), 'yyyy-MM-dd')
         
         if (dateStr < todayStr) {
             setDateError('La fecha no puede ser anterior a hoy.')
         } else {
             setDateError(null)
         }
    }

    const addOverride = async () => {
        if (!newOverride.date || dateError) return
        setIsAddingOverride(true)

        // Parse YYYY-MM-DD manually to local midnight to avoid UTC timezone shift
        const [year, month, day] = newOverride.date.split('-').map(Number)
        const localDate = new Date(year, month - 1, day)

        const savedOverride = await addAvailabilityOverride({
            date: localDate,
            startTime: newOverride.startTime,
            endTime: newOverride.endTime
        })
        
        // Update local state immediately
        setOverrides(prev => {
             const exists = prev.find(o => o.id === savedOverride.id)
             // Ensure date is Date object for client state
             const dateObj = new Date(savedOverride.date)
             
             if (exists) {
                 return prev.map(o => o.id === savedOverride.id ? { ...savedOverride, date: dateObj } : o)
             }
             return [...prev, { ...savedOverride, date: dateObj }]
        })

        setNewOverride({ date: '', startTime: '09:00', endTime: '18:00' })
        setIsAddingOverride(false)
        router.refresh()
    }


    const deleteOverride = async (id: string) => {
        if (!confirm('Eliminar excepción?')) return
        // Optimistic update
        setOverrides(prev => prev.filter(o => o.id !== id))
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
                        <div key={idx} className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border transition-colors ${schedule[idx].isActive ? 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 shadow-sm' : 'bg-gray-50 dark:bg-neutral-900 border-transparent opacity-60'}`}>
                            <div className="flex items-center gap-3 min-w-[140px]">
                                <div className="relative flex items-center">
                                    <input 
                                        type="checkbox"
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white checked:bg-teal-600 checked:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all dark:border-neutral-600 dark:bg-neutral-800"
                                        checked={schedule[idx].isActive}
                                        onChange={(e) => handleScheduleChange(idx, 'isActive', e.target.checked)}
                                    />
                                    <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </div>
                                <span className={cn("font-bold text-base", schedule[idx].isActive ? "text-gray-900 dark:text-white" : "text-gray-500")}>{dayName}</span>
                            </div>
                            
                            {schedule[idx].isActive && (
                                <div className="flex items-center gap-3 flex-1 w-full sm:w-auto pl-8 sm:pl-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="relative flex-1 sm:flex-none">
                                        <input 
                                            type="time" 
                                            className="h-10 w-full sm:w-32 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 transition-all dark:bg-neutral-900 dark:border-neutral-700"
                                            value={schedule[idx].startTime}
                                            onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                                        />
                                    </div>
                                    <span className="text-gray-400 font-medium">a</span>
                                    <div className="relative flex-1 sm:flex-none">
                                        <input 
                                            type="time" 
                                            className="h-10 w-full sm:w-32 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 transition-all dark:bg-neutral-900 dark:border-neutral-700"
                                            value={schedule[idx].endTime}
                                            onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Exceptions */}
            <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border dark:border-neutral-700">
                <h2 className="text-xl font-bold mb-4">Días Excepcionales</h2>
                <p className="text-sm text-gray-500 mb-4">Agrega disponibilidad específica para una fecha puntual. Esto sobreescribe (o agrega) al horario semanal.</p>
                
                <div className="flex flex-wrap gap-4 items-end mb-6 bg-gray-50 dark:bg-neutral-900 p-4 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha</label>
                        <input 
                            type="date" 
                            className={cn(
                                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-700",
                                dateError ? "border-red-500 focus-visible:ring-red-500" : ""
                            )}
                            value={newOverride.date}
                            onChange={handleDateChange}
                        />
                        {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
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
                    <Button onClick={addOverride} disabled={isAddingOverride || !!dateError || !newOverride.date}>
                        Agregar
                    </Button>
                </div>

                <div className="space-y-2">
                    {overrides.map(ov => (
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
                    {overrides.length === 0 && (
                        <p className="text-gray-400 italic">No hay excepciones configuradas.</p>
                    )}
                </div>
            </section>
        </div>
    )
}
