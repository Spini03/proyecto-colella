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
  // Ensure we are checking the "Business Day" which is stored as UTC Midnight
  // dateStr is usually YYYY-MM-DD
  const dateOnly = dateStr.split('T')[0] // safety
  const utcDate = new Date(`${dateOnly}T00:00:00Z`)

  // Check BlockoutDate - Search for exact match on UTC Midnight or range covering it?
  // Since we don't know if bot stores 00:00:00Z strictly, let's look for the record 
  // that represents this day. 
  // Safest: Check range of that UTC day.
  const startUtc = new Date(`${dateOnly}T00:00:00Z`)
  const endUtc = new Date(`${dateOnly}T23:59:59Z`)
  
  const blockout = await prisma.blockoutDate.findFirst({
      where: { 
          date: {
              gte: startUtc,
              lte: endUtc
          }
      }
  })
  
  if (blockout) {
      return { slots: [] }
  }

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

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

// Updated signature to accept FormData
export async function bookAppointment(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Extract fields from FormData
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const date = formData.get('date') as string
  const patientNotes = formData.get('patientNotes') as string | null
  const medicalFile = formData.get('medicalFile') as File | null

  if (!name || !phone || !date) {
      return { success: false, error: 'Missing required fields' }
  }

  const userId = session.user.id
  
  // Re-fetch config to get latest price
  const config = await getSystemConfig() 

  try {
     // File Upload Handling
     let medicalReportUrl: string | null = null

     if (medicalFile && medicalFile.size > 0) {
         // Validate File
         const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
         const maxSize = 5 * 1024 * 1024 // 5MB

         if (!validTypes.includes(medicalFile.type)) {
             return { success: false, error: 'Formato de archivo no válido. Solo PDF, JPG o PNG.' }
         }

         if (medicalFile.size > maxSize) {
             return { success: false, error: 'El archivo es demasiado grande (Máx 5MB).' }
         }

         // Create Directory
         const uploadDir = join(process.cwd(), 'public', 'uploads', 'medical')
         await mkdir(uploadDir, { recursive: true })

         // Save File
         const fileExtension = medicalFile.name.split('.').pop()
         const fileName = `${Date.now()}-${randomUUID()}.${fileExtension}`
         const filePath = join(uploadDir, fileName)
         
         const bytes = await medicalFile.arrayBuffer()
         const buffer = Buffer.from(bytes)
         
         await writeFile(filePath, buffer)
         
         // Set Relative Path
         medicalReportUrl = `/uploads/medical/${fileName}`
     }

     // Re-calculate Deposit
     const depositAmount = config.price * (config.depositPercentage / 100);
     const bookingDate = new Date(date);

     // Transaction: Check availability + Create Appointment atomically
     const appointment = await prisma.$transaction(async (tx) => {
        // 1. Strict Availability Check
        // Find any appointment at this EXACT time that is NOT cancelled
        const existing = await tx.appointment.findFirst({
            where: {
                datetime: bookingDate,
                status: { not: 'CANCELLED' }
            }
        });

        if (existing) {
            throw new Error('SLOT_TAKEN');
        }

        // 2. Check Blockouts (Manual Blocks)
        // Check if the specific Day is blocked out
        const blockout = await tx.blockoutDate.findFirst({
             where: { date: startOfDay(bookingDate) }
        });
        
        if (blockout) {
             throw new Error('DATE_BLOCKED');
        }
        
        // 3. Update User Profile (ensure we have latest phone/name)
        await tx.user.update({
            where: { id: userId },
            data: {
                phoneNumber: phone,
                name: name
            }
        });

        // 4. Create Appointment
        return await tx.appointment.create({
            data: {
                datetime: bookingDate,
                status: 'PENDING',
                patientId: userId,
                depositPaid: false,
                patientNotes: patientNotes || null,
                medicalReportUrl: medicalReportUrl
            }
        });
     });
     
     // Create Mercado Pago Preference (Outside Transaction)
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
        // If MP fails, we might want to cancel the appointment we just created?
        // Or leave it as PENDING and let a cleanup job handle it / let user retry payment.
        // For now, throwing error.
        throw new Error('Failed to create payment preference');
     }
     
     return { 
       success: true, 
       paymentUrl: preferenceResponse.init_point 
     }

  } catch (error: any) {
      console.error('Book Appointment Error:', error)
      
      // Handle known errors
      if (error.message === 'SLOT_TAKEN' || error.message === 'DATE_BLOCKED') {
          return { 
              success: false, 
              error: 'Este horario ya ha sido reservado por otra persona o no está disponible. Por favor, selecciona un horario diferente.' 
          }
      }

      return { success: false, error: 'Booking failed. Please try again.' }
  }
}
