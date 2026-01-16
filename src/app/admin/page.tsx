import { getAppointments } from "./actions"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, User, Clock, Phone, Mail, CheckCircle, AlertCircle, Clock3 } from "lucide-react"

export default async function AdminDashboard() {
  const appointments = await getAppointments()
  
  const grouped = appointments.reduce((acc, app) => {
    const dateStr = format(parseISO(app.datetime), 'yyyy-MM-dd')
    if (!acc[dateStr]) acc[dateStr] = []
    acc[dateStr].push(app)
    return acc
  }, {} as Record<string, typeof appointments>)

  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold font-display tracking-tight text-gray-900 dark:text-white">Mi Agenda</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Gestión de turnos y pacientes para los próximos días.</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 px-5 py-3 rounded-2xl shadow-sm border dark:border-neutral-700 flex items-center gap-3">
            <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Hoy es</p>
                <p className="text-sm font-bold capitalize">{format(new Date(), "EEEE d 'de' MMMM", { locale: es })}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {sortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-neutral-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-neutral-800">
             <div className="h-16 w-16 bg-gray-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-gray-300" />
             </div>
             <p className="text-gray-400 font-medium text-lg">No hay turnos próximos agendados</p>
             <p className="text-gray-400 text-sm">Los nuevos turnos aparecerán aquí automáticamente</p>
          </div>
        ) : (
            sortedDates.map(dateStr => (
                <div key={dateStr} className="space-y-4">
                    <div className="flex items-center gap-3 ml-2">
                        <div className="h-2 w-2 rounded-full bg-teal-500" />
                        <h3 className="font-bold capitalize text-xl tracking-tight text-gray-800 dark:text-neutral-200">
                            {format(parseISO(dateStr), 'EEEE d "de" MMMM', { locale: es })}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden divide-y dark:divide-neutral-800">
                        {grouped[dateStr].sort((a,b) => a.datetime.localeCompare(b.datetime)).map(app => (
                            <div key={app.id} className="group p-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-teal-50/30 dark:hover:bg-teal-900/5 transition-all">
                                <div className="flex gap-6 items-center">
                                    <div className="flex flex-col items-center justify-center bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-2xl w-20 h-20 shrink-0 border border-teal-100/50 dark:border-teal-800/30 group-hover:scale-105 transition-transform shadow-sm">
                                        <Clock className="h-4 w-4 mb-1 opacity-60" />
                                        <span className="text-xl font-black leading-none tracking-tight">
                                            {format(parseISO(app.datetime), 'HH:mm')}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-extrabold text-xl text-gray-900 dark:text-white leading-tight">
                                                {app.patient.name || 'Sin nombre'}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                            <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                                <Mail className="h-3.5 w-3.5 opacity-60" />
                                                {app.patient.email}
                                            </span>
                                            {app.patient.phoneNumber && (
                                                <span className="flex items-center gap-1.5 text-sm font-bold text-teal-600 dark:text-teal-400">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {app.patient.phoneNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 dark:border-neutral-800">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border
                                        ${app.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200/50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' : 
                                          app.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30' : 
                                          'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30'}`}>
                                        {app.status === 'CONFIRMED' && <CheckCircle className="h-3.5 w-3.5" />}
                                        {app.status === 'PENDING' && <Clock3 className="h-3.5 w-3.5" />}
                                        {app.status === 'CANCELLED' && <AlertCircle className="h-3.5 w-3.5" />}
                                        {app.status}
                                    </div>
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

