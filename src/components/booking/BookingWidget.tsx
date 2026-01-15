'use client'

import { useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, isBefore, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useBookingStore } from '@/lib/store/booking-store'
import { getAvailability, bookAppointment } from '@/app/actions'
import { cn } from '@/lib/utils'

import 'react-day-picker/dist/style.css'

export function BookingWidget() {
  const { selectedDate, selectedSlot, step, setDate, setSlot, setStep } = useBookingStore()
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slots, setSlots] = useState<string[]>([])
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true)
      getAvailability(selectedDate.toISOString())
        .then((data) => {
          setSlots(data.slots)
          setLoadingSlots(false)
        })
        .catch(() => setLoadingSlots(false))
    }
  }, [selectedDate])

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedDate || !selectedSlot) return

    setBookingStatus('loading')
    const formData = new FormData(e.currentTarget)
    
    // Append date/slot
    // Actually the server action expects object in my impl
    const data = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        date: selectedSlot
    }

    try {
      const res = await bookAppointment(data)
      if (res.success) {
        setPaymentUrl(res.paymentUrl || null)
        setBookingStatus('success')
        setStep('confirmation')
        if (res.paymentUrl) {
           // Optional: Auto redirect or let user click
           // window.location.href = res.paymentUrl
        }
      } else {
        setBookingStatus('error')
      }
    } catch {
      setBookingStatus('error')
    }
  }

  return (
    <section id="booking" className="py-20 bg-gray-50 dark:bg-neutral-800">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-3xl font-bold font-display text-center mb-12">Agendá tu Sesión</h2>
        
        <div className="grid md:grid-cols-2 gap-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 min-h-[500px]">
          
          {/* Left Column: Calendar */}
          <div className="flex flex-col items-center border-r md:border-r-gray-100 dark:border-r-neutral-800 border-b md:border-b-0 pb-6 md:pb-0">
            <h3 className="tex-lg font-semibold mb-4 text-[var(--color-brand-primary)]">
               Seleccioná una fecha
            </h3>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setDate}
              disabled={{ before: startOfToday() }}
              locale={es}
              className="p-3"
              classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button: cn(
                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
                ),
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: cn(
                  'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent rounded-full'
                ),
                selected: 'bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary)] focus:bg-[var(--color-brand-primary)] rounded-full flex items-center justify-center',
                today: 'text-[var(--color-brand-primary)] font-bold',
                outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                disabled: 'text-muted-foreground opacity-50',
                range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                hidden: 'invisible',
              }}
            />
          </div>

          {/* Right Column: Dynamic Content */}
          <div className="flex flex-col p-4">
             <AnimatePresence mode="wait">
                {step === 'date' && (
                   <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="flex flex-col items-center justify-center h-full text-center text-gray-500"
                   >
                     <p>Por favor seleccioná una fecha disponible en el calendario.</p>
                   </motion.div>
                )}

                {step === 'slot' && (
                    <motion.div
                        key="slots"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col h-full"
                    >
                        <h3 className="text-lg font-semibold mb-4">Horarios Disponibles</h3>
                        {loadingSlots ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="animate-spin h-8 w-8 text-[var(--color-brand-primary)]" />
                            </div>
                        ) : slots.length === 0 ? (
                            <p>No hay horarios disponibles para esta fecha.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[300px]">
                                {slots.map(slot => (
                                    <Button 
                                        key={slot} 
                                        variant="outline" 
                                        onClick={() => setSlot(slot)}
                                        className="w-full"
                                    >
                                        {format(new Date(slot), 'HH:mm')}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {step === 'details' && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col h-full"
                    >
                         <h3 className="text-lg font-semibold mb-4">Tus Datos</h3>
                         <div className="mb-4 p-3 bg-gray-50 dark:bg-neutral-800 rounded text-sm">
                            <p><strong>Fecha:</strong> {selectedDate && format(selectedDate, 'dd/MM/yyyy')}</p>
                            <p><strong>Hora:</strong> {selectedSlot && format(new Date(selectedSlot), 'HH:mm')}</p>
                         </div>
                         
                         <form onSubmit={handleBooking} className="flex flex-col gap-4">
                             <div>
                                 <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                                 <input required name="name" className="w-full p-2 border rounded focus:ring-2 ring-[var(--color-brand-primary)] outline-none" placeholder="Tu nombre" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium mb-1">WhatsApp</label>
                                 <input required name="phone" type="tel" className="w-full p-2 border rounded focus:ring-2 ring-[var(--color-brand-primary)] outline-none" placeholder="+54 9 11..." />
                             </div>
                             
                             <div className="flex gap-2 mt-4">
                                 <Button type="button" variant="ghost" onClick={() => setStep('slot')}>Volver</Button>
                                 <Button type="submit" disabled={bookingStatus === 'loading'}>
                                     {bookingStatus === 'loading' ? <Loader2 className="animate-spin mr-2" /> : null}
                                     Confirmar y Pagar
                                 </Button>
                             </div>
                         </form>
                    </motion.div>
                )}

                {step === 'confirmation' && (
                    <motion.div
                         key="confirmation"
                         initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                         className="flex flex-col items-center justify-center h-full text-center"
                    >
                        <h3 className="text-2xl font-bold text-green-600 mb-2">¡Reserva Iniciada!</h3>
                        <p className="mb-6 text-gray-600">Para confirmar tu turno, realizá el pago de la seña.</p>
                        
                        {paymentUrl && (
                            <Button size="lg" className="w-full" onClick={() => window.open(paymentUrl, '_blank')}>
                                Pagar Ahora (Mercado Pago)
                            </Button>
                        )}
                         <Button variant="link" className="mt-4" onClick={() => setStep('date')}>Nueva Reserva</Button>
                    </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
