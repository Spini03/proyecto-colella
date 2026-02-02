'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { cancelAppointment } from "./actions"
import { useState } from "react"

interface Appointment {
  id: string
  datetime: Date
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
}

interface AppointmentCardProps {
  appointment: Appointment
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const [isCancelling, setIsCancelling] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Confirmado</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Pendiente</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    const result = await cancelAppointment(appointment.id)
    setIsCancelling(false)

    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const isCancellable = (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && new Date(appointment.datetime) > new Date()

  // Logic to show button only if it is cancellable (future and active)
  // BUT the policy logic (24h) is handled in the backend. 
  // However, for UX, maybe we should also disable or hide if < 24h?
  // User request said: "Si faltan MENOS de 24 horas para el turno: NO permitir cancelar y devolver un error informativo".
  // This implies the button IS clickeable or at least visible, and the error comes from backend?
  // Or maybe we should improve UX by disabling it?
  // Request said: "En la tarjeta de cada turno (solo si el estado es PENDING o CONFIRMED y la fecha es futura), agrega un botón "Cancelar"."
  // So I'll follow that literally. 

  return (
    <Card className="overflow-hidden bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-blue-600 dark:text-blue-400">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              {format(new Date(appointment.datetime), "EEEE d 'de' MMMM", { locale: es })}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {format(new Date(appointment.datetime), "HH:mm")} hs
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-4 justify-between w-full sm:w-auto sm:justify-end">
             {getStatusBadge(appointment.status)}
             <p className="text-xs text-gray-400 font-mono hidden sm:block">ID: {appointment.id.slice(-4)}</p>
          </div>
          
          {isCancellable && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                  Cancelar Turno
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro de cancelar este turno?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ten en cuenta que las cancelaciones deben realizarse con al menos 24 horas de anticipación para no perder la seña. Esta acción es irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Volver</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancel}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
                  >
                    {isCancelling ? "Cancelando..." : "Sí, Cancelar Turno"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </Card>
  )
}
