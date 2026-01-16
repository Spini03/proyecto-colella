import { getAppointments } from "./actions"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export default async function AdminDashboard() {
  const appointments = await getAppointments() // Defaults to >= today
  
  // Group by date
  const grouped = appointments.reduce((acc, app) => {
    const dateStr = format(parseISO(app.datetime), 'yyyy-MM-dd')
    if (!acc[dateStr]) acc[dateStr] = []
    acc[dateStr].push(app)
    return acc
  }, {} as Record<string, typeof appointments>)

  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-display">Agenda Próxima</h1>
      </div>

      <div className="space-y-8">
        {sortedDates.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No hay turnos próximos agendados.
          </div>
        ) : (
            sortedDates.map(dateStr => (
                <div key={dateStr} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border dark:border-neutral-700 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-neutral-700/50 px-6 py-3 border-b dark:border-neutral-700">
                        <h3 className="font-semibold capitalize text-lg">
                            {format(parseISO(dateStr), 'EEEE d "de" MMMM', { locale: es })}
                        </h3>
                    </div>
                    <div className="divide-y dark:divide-neutral-700">
                        {grouped[dateStr].map(app => (
                            <div key={app.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-neutral-700/30 transition-colors">
                                <div className="flex gap-4 items-center">
                                    <div className="flex flex-col items-center justify-center bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-primary)] rounded-lg w-16 h-16 shrink-0">
                                        <span className="text-xl font-bold leading-none">
                                            {format(parseISO(app.datetime), 'HH:mm')}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{app.patient.name || 'Sin nombre'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{app.patient.email}</p>
                                        {app.patient.phoneNumber && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300">📞 {app.patient.phoneNumber}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border
                                        ${app.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 border-green-200' : 
                                          app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                                          'bg-red-100 text-red-800 border-red-200'}`}>
                                        {app.status}
                                    </span>
                                    {/* Actions could go here (Cancel, Reschedule) */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  )
}
