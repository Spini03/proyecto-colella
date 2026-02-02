import { getAppointments } from "./actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "lucide-react"
import { AppointmentManager } from "./AppointmentManager"

export default async function AdminDashboard() {
  const appointments = await getAppointments()
  
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

      <AppointmentManager appointments={appointments} />
    </div>
  )
}

