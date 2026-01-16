'use client'

import { useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, startOfToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Calendar as CalendarIcon, Clock, User, CheckCircle2 } from 'lucide-react'
import { useSession, signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

import { Button } from '@/components/ui/button'
import { useBookingStore } from '@/lib/store/booking-store'
import { getAvailability, bookAppointment } from '@/app/actions'
import { cn } from '@/lib/utils'

import 'react-day-picker/dist/style.css'

export function BookingWidget() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  
  const { selectedDate, selectedSlot, step, setDate, setSlot, setStep } = useBookingStore()
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slots, setSlots] = useState<string[]>([])
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)

  // Restore state from URL if returning from Auth
  useEffect(() => {
    const dateParam = searchParams.get('date')
    const slotParam = searchParams.get('slot')
    
    if (dateParam && slotParam && status === 'authenticated') {
        const date = parseISO(dateParam)
        // Ensure we don't overwrite if already set (e.g. by store hydration if any)
        if (!selectedDate || selectedDate.toISOString() !== date.toISOString()) {
            setDate(date)
            setSlot(slotParam)
            setStep('details')
        }
    }
  }, [searchParams, status, setDate, setSlot, setStep, selectedDate])

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

  const handleSlotClick = (slot: string) => {
    if (status === 'unauthenticated') {
        // Trigger generic sign in, preserving state
        const params = new URLSearchParams()
        if (selectedDate) params.set('date', selectedDate.toISOString())
        params.set('slot', slot)
        
        signIn('google', { 
            callbackUrl: `${window.location.pathname}?${params.toString()}` 
        })
        return
    }
    
    setSlot(slot)
    setStep('details')
  }

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedDate || !selectedSlot) return

    setBookingStatus('loading')
    const formData = new FormData(e.currentTarget)
    
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
      } else {
        setBookingStatus('error')
      }
    } catch {
      setBookingStatus('error')
    }
  }

  return (
    <section id="booking" className="py-24 bg-white dark:bg-[#0a0a0a]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 tracking-tight">Agendá tu Sesión</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Seleccioná el día y horario que mejor te quede para comenzar tu proceso de recuperación.
          </p>
        </div>
        
        <div className="bg-[#f8f9fa] dark:bg-neutral-900/50 border border-gray-100 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] backdrop-blur-sm">
          
          {/* Left Column: Calendar */}
          <div className="w-full md:w-1/2 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 dark:border-neutral-800 bg-white/50 dark:bg-black/20">
            <div className="flex flex-col">
              <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-[var(--color-brand-primary)]">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold font-display">
                    1. Fecha
                  </h3>
                </div>
              </header>

              <div className="calendar-container min-h-[340px] flex items-start justify-center">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setDate}
                  disabled={{ before: startOfToday() }}
                  locale={es}
                  classNames={{
                    month: 'w-full space-y-6 relative',
                    month_caption: 'flex justify-center mb-10 text-lg font-bold capitalize h-8 items-center w-full',
                    nav: 'flex items-center gap-1.5 absolute right-0 top-0 h-8 z-10',
                    button_previous: cn(
                      "h-7 w-7 bg-transparent p-0 transition-all hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg flex items-center justify-center border border-gray-100 dark:border-neutral-800 text-gray-500 dark:text-gray-400 relative z-20 cursor-pointer"
                    ),
                    button_next: cn(
                      "h-7 w-7 bg-transparent p-0 transition-all hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg flex items-center justify-center border border-gray-100 dark:border-neutral-800 text-gray-500 dark:text-gray-400 relative z-20 cursor-pointer"
                    ),
                    month_grid: 'w-full border-collapse',
                    weekdays: 'flex justify-between mb-4',
                    weekday: 'text-gray-400 dark:text-neutral-500 w-10 font-bold text-[0.7rem] uppercase tracking-widest text-center',
                    weeks: 'space-y-1',
                    week: 'flex w-full justify-between',
                    day: cn(
                      "h-10 w-10 p-0 font-medium transition-all hover:bg-[var(--color-brand-accent)] hover:text-[var(--color-brand-primary)] dark:hover:bg-neutral-800 rounded-full flex items-center justify-center relative cursor-pointer"
                    ),
                    day_button: 'h-10 w-10 p-0 font-medium rounded-full flex items-center justify-center',
                    selected: 'bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary)] hover:text-white shadow-lg shadow-teal-500/30',
                    today: 'text-[var(--color-brand-primary)] font-black after:content-[""] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-[var(--color-brand-primary)] after:rounded-full',
                    outside: 'text-gray-300 dark:text-neutral-700 opacity-50',
                    disabled: 'text-gray-200 dark:text-neutral-800 cursor-not-allowed opacity-30',
                  }}
                  style={{ position: 'relative', width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Content */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-white/30 dark:bg-white/5">
             <AnimatePresence mode="wait">
                {step === 'date' && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                     className="flex flex-col items-center justify-center h-full text-center space-y-6"
                   >
                     <div className="w-20 h-20 bg-teal-500/5 dark:bg-teal-500/10 rounded-3xl flex items-center justify-center mb-2 border border-teal-500/10">
                        <CalendarIcon className="w-10 h-10 text-[var(--color-brand-primary)] opacity-40" />
                     </div>
                     <div>
                       <h4 className="text-xl font-bold mb-2">Comenzá tu Reserva</h4>
                       <p className="text-gray-500 dark:text-gray-400">Seleccioná un día disponible en el calendario para ver los horarios.</p>
                     </div>
                   </motion.div>
                )}

                {step === 'slot' && (
                    <motion.div
                        key="slots"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col h-full"
                    >
                        <header className="mb-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-[var(--color-brand-primary)]">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold font-display">
                                2. Horarios
                              </h3>
                              <p className="text-sm text-gray-500 font-medium">
                                {selectedDate && format(selectedDate, "eeee d 'de' MMMM", { locale: es })}
                              </p>
                            </div>
                          </div>
                        </header>

                        {loadingSlots ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <Loader2 className="animate-spin h-10 w-10 text-[var(--color-brand-primary)]" />
                                <p className="text-sm text-gray-400 font-medium tracking-wide">Buscando disponibilidad...</p>
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50/50 dark:bg-black/20 rounded-[2rem] border border-dashed border-gray-200 dark:border-neutral-800">
                                <p className="text-gray-500 font-medium mb-4 text-center">No hay horarios disponibles para esta fecha.</p>
                                <Button variant="outline" onClick={() => setDate(undefined)} className="rounded-xl">Ver otros días</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-2 max-h-[400px]">
                                {slots.map(slot => (
                                    <button 
                                        key={slot} 
                                        onClick={() => handleSlotClick(slot)}
                                        className={cn(
                                          "group relative p-5 rounded-2xl border transition-all duration-300 text-center",
                                          "border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md",
                                          "hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)]"
                                        )}
                                    >
                                        <span className="text-lg font-bold text-gray-700 dark:text-gray-200 group-hover:text-[var(--color-brand-primary)]">
                                          {format(new Date(slot), 'HH:mm')}
                                        </span>
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
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
                         <header className="mb-8">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-[var(--color-brand-primary)]">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold font-display tracking-tight">
                                  3. Tus Datos
                                </h3>
                                <div className="mt-1 flex gap-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
                                   <span className="flex items-center gap-1">
                                      {selectedDate && format(selectedDate, 'dd/MM/yy')}
                                   </span>
                                   <span>•</span>
                                   <span className="flex items-center gap-1">
                                      {selectedSlot && format(new Date(selectedSlot), 'HH:mm')} HS
                                   </span>
                                </div>
                              </div>
                            </div>
                         </header>
                         
                         <form onSubmit={handleBooking} className="flex flex-col gap-6">
                             <div className="space-y-3">
                                 <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Nombre Completo</label>
                                 <div className="relative">
                                   <input 
                                     required 
                                     name="name" 
                                     defaultValue={session?.user?.name || ''}
                                     className="w-full p-4 bg-white dark:bg-black/20 border border-gray-100 dark:border-neutral-800 rounded-2xl focus:ring-2 ring-[var(--color-brand-primary)] outline-none transition-all focus:shadow-lg"
                                     placeholder="Juan Pérez" 
                                   />
                                 </div>
                             </div>
                             <div className="space-y-3">
                                 <label className="block text-xs font-black uppercase tracking-widest text-gray-400">WhatsApp</label>
                                 <div className="relative">
                                   <input 
                                     required 
                                     name="phone" 
                                     type="tel"
                                     defaultValue={session?.user?.phoneNumber || ''}
                                     className="w-full p-4 bg-white dark:bg-black/20 border border-gray-100 dark:border-neutral-800 rounded-2xl focus:ring-2 ring-[var(--color-brand-primary)] outline-none transition-all focus:shadow-lg"
                                     placeholder="+54 9 11 1234 5678" 
                                   />
                                 </div>
                             </div>
                             
                             <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                 <Button type="button" variant="ghost" onClick={() => setStep('slot')} className="flex-1 h-14 rounded-2xl font-bold text-gray-500">
                                     Atrás
                                 </Button>
                                 <Button type="submit" disabled={bookingStatus === 'loading'} className="flex-[2] h-14 rounded-2xl font-bold shadow-xl shadow-teal-500/20">
                                     {bookingStatus === 'loading' ? <Loader2 className="animate-spin mr-2" /> : null}
                                     {session?.user?.phoneNumber ? 'Confirmar Reserva' : 'Guardar y Reservar'}
                                 </Button>
                             </div>
                             <p className="text-[10px] text-center text-gray-400/80 px-4 leading-relaxed italic">
                                Al confirmar, serás redirigido para realizar el pago de la seña y asegurar tu lugar en la agenda.
                             </p>
                         </form>
                    </motion.div>
                )}

                {step === 'confirmation' && (
                    <motion.div
                         key="confirmation"
                         initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                         className="flex flex-col items-center justify-center h-full text-center space-y-10 p-4"
                    >
                        <div className="relative">
                           <div className="absolute inset-0 bg-green-500 blur-[60px] opacity-20 animate-pulse" />
                           <div className="relative w-28 h-28 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/30">
                              <CheckCircle2 className="w-14 h-14 text-green-500" />
                           </div>
                        </div>
                        
                        <div>
                          <h3 className="text-3xl font-bold mb-3 tracking-tight">¡Casi listo!</h3>
                          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                            Hemos reservado tu lugar temporalmente. Completá el pago de la seña para confirmar definitivamente tu turno.
                          </p>
                        </div>
                        
                        <div className="w-full space-y-4">
                          {paymentUrl && (
                              <Button size="lg" className="h-16 w-full text-lg font-bold rounded-2xl shadow-2xl shadow-green-500/20 bg-green-600 hover:bg-green-700 active:scale-95 transition-transform" onClick={() => window.open(paymentUrl, '_blank')}>
                                  Pagar Seña con Mercado Pago
                              </Button>
                          )}
                           <Button variant="ghost" className="w-full text-gray-400 hover:text-gray-600 font-bold" onClick={() => {
                               setDate(undefined);
                               setSlot(null);
                               setStep('date');
                           }}>
                               Empezar de nuevo
                           </Button>
                        </div>
                    </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
