'use server'

import { prisma } from '@/lib/prisma'
// import { BUSINESS_RULES } from '@/lib/config/business-rules' // Deprecated
import { preference } from '@/lib/mercadopago'

import { addDays, setHours, setMinutes, startOfDay, endOfDay, isBefore, addMinutes, format, parseISO, getDay, isEqual } from 'date-fns'
import { auth } from '@/auth'

// Helper to fetch valid configuration
async function getSystemConfig(targetDate?: Date) {
    // defaults
    let config = {
        price: 40000,
        duration: 30,
        depositPercentage: 50,
        schedule: {} as Record<number, { startTime: string, endTime: string }>
    }

    // Fetch Global Settings
    const settings = await prisma.globalSettings.findUnique({ where: { id: 'settings' } })
    if (settings) {
        config.price = Number(settings.currentPrice)
        config.duration = settings.sessionDuration
        config.depositPercentage = settings.depositPercentage
    }

    // Fetch Schedule
    // If targetDate is provided, check for override
    let override = null
    if (targetDate) {
        // Normalize date to start of day for comparison if stored that way? 
        // AvailabilityOverride stores DateTime @unique. 
        // We probably stored it with time? No, usually 00:00:00Z if from date picker?
        // Let's assume we match by day range or strict equality if we normalized input.
        // It's safer to search by range for the day.
        const start = startOfDay(targetDate)
        const end = endOfDay(targetDate)
        
        override = await prisma.availabilityOverride.findFirst({
            where: {
                date: {
                    gte: start,
                    lte: end
                }
            }
        })
    }

    if (override) {
        // Pseudo-schedule for this day
        const dayOfWeek = getDay(targetDate!)
        config.schedule[dayOfWeek] = { 
            startTime: override.startTime, 
            endTime: override.endTime 
        }
    } else {
        // Standard Weekly Schedule
        const dbSchedule = await prisma.workSchedule.findMany({ where: { isActive: true } })
        dbSchedule.forEach(s => {
            config.schedule[s.dayOfWeek] = {
                startTime: s.startTime,
                endTime: s.endTime
            }
        })
    }

    return config
}

export async function getAvailability(dateStr: string) {
  const date = parseISO(dateStr)
  const dayOfWeek = getDay(date)
  
  const config = await getSystemConfig(date)
  const daySchedule = config.schedule[dayOfWeek]

  // Check if fully blocked via BlockoutDate (legacy/manual blocks)
  // Or if no schedule for this day
  if (!daySchedule) {
     // Check if it was explicitly blocked? 
     // We assume if no schedule in map, it's off.
     return { slots: [] }
  }

  // Parse start/end times "HH:mm"
  const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number)
  const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number)

  const start = setMinutes(setHours(date, startHour), startMinute)
  const end = setMinutes(setHours(date, endHour), endMinute)
  
  // Find existing appointments to block slots
  const existingAppointments = await prisma.appointment.findMany({
      where: {
          datetime: {
              gte: start,
              lt: end
          },
          status: {
              not: 'CANCELLED'
          }
      }
  })

  // Helper to check collision
  const isSlotFree = (slotDate: Date) => {
      // Simple check: is there an appointment at this time?
      // Assuming fixed duration slots aligned.
      // Better: check if slotDate overlaps with any appointment.
      // But assuming strict slots for now based on current logic.
      return !existingAppointments.some(app => isEqual(app.datetime, slotDate))
  }

  const slots = []
  let current = start
  
  while (isBefore(current, end)) {
    // Only add if free
    if (isSlotFree(current)) {
        slots.push(current.toISOString())
    }
    current = addMinutes(current, config.duration)
  }
  
  return { slots }
}

export async function bookAppointment(data: { name: string; phone: string; date: string }) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const { name, phone, date } = data
  const userId = session.user.id
  
  // Re-fetch config to get latest price
  const config = await getSystemConfig() 

  try {
     // Update user profile
     await prisma.user.update({
        where: { id: userId },
        data: {
            phoneNumber: phone,
            name: name
        }
     })
     
     // Calculate Deposit
     const depositAmount = config.price * (config.depositPercentage / 100);

     // Create Appointment (PENDING payment)
     const appointment = await prisma.appointment.create({
        data: {
            datetime: new Date(date),
            status: 'PENDING',
            patientId: userId,
            depositPaid: false
        }
     })
     
     // Create Mercado Pago Preference
     const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'http://localhost:3000';
     
     const preferenceBody = {
        items: [
            {
                id: 'deposit',
                title: `Seña: Sesión de Kinesiología`,
                quantity: 1,
                unit_price: depositAmount,
                currency_id: 'ARS',
            }
        ],
        payer: {
            email: session.user.email || 'unknown@email.com',
            name: name
        },
        external_reference: appointment.id,
        back_urls: {
            success: `${appUrl}/booking/success`,
            failure: `${appUrl}/booking/failure`,
            pending: `${appUrl}/booking/pending`
        },
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        metadata: {
            appointment_id: appointment.id
        }
     };

     const preferenceResponse = await preference.create({
        body: preferenceBody
     });

     if (!preferenceResponse.init_point) {
        throw new Error('Failed to create payment preference');
     }
     
     return { 
       success: true, 
       paymentUrl: preferenceResponse.init_point 
     }
  } catch (error) {
      console.error('Book Appointment Error:', error)
      return { success: false, error: 'Booking failed. Please try again.' }
  }
}
