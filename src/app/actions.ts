'use server'

import { prisma } from '@/lib/prisma'
// import { BUSINESS_RULES } from '@/lib/config/business-rules' // Deprecated
import { preference } from '@/lib/mercadopago'

import { addDays, setHours, setMinutes, startOfDay, endOfDay, isBefore, addMinutes, format, parseISO, getDay, isEqual, subMinutes } from 'date-fns'
import { auth } from '@/auth'

// CONSTANTS
const RESERVATION_TIMEOUT_MINUTES = 15

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
        dbSchedule.forEach((s: any) => {
            config.schedule[s.dayOfWeek] = {
                startTime: s.startTime,
                endTime: s.endTime
            }
        })
    }

    return config
}

import { fromZonedTime, toZonedTime } from 'date-fns-tz'

const TIMEZONE = 'America/Argentina/Buenos_Aires'

export async function getAvailability(dateStr: string) {
  // Input dateStr is UTC midnight from the calendar (e.g., 2023-10-27T00:00:00.000Z)
  // We want to know what day of the week this is IN ARGENTINA.
  // Actually, the calendar sends the date selected. If I select Oct 27, it sends Oct 27.
  // Let's rely on the date string YYYY-MM-DD portion to be the "Target Day" in Argentina.
  
  const dateOnly = dateStr.split('T')[0] // "YYYY-MM-DD"
  
  // Create a Date object representing midnight in Argentina for that day
  const targetDateZoned = fromZonedTime(`${dateOnly}T00:00:00`, TIMEZONE)
  
  const dayOfWeek = getDay(targetDateZoned) // 0-6 based on local time? No, getDay returns local day of week of the machine? 
  // Wait, getDay(date) returns the day of week for the Date object. 
  // If we want the day of week in Argentina, we should use toZonedTime.
  
  const zonedDate = toZonedTime(targetDateZoned, TIMEZONE)
  const dayIndex = getDay(zonedDate) // correct day of week in Argentina
  
  const config = await getSystemConfig(targetDateZoned)
  
  // Check Blockout
  // We check if the day is blocked. We can reuse the UTC check logic if we assume blocks are stored as UTC midnights, 
  // OR we just check if the "YYYY-MM-DD" matches a blocked date's YYYY-MM-DD in Argentina.
  // For now, let's stick to the existing logic but ensure we check the correct "day".
  
  const startUtc = fromZonedTime(`${dateOnly}T00:00:00`, TIMEZONE)
  const endUtc = fromZonedTime(`${dateOnly}T23:59:59.999`, TIMEZONE)
  
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

  const daySchedule = config.schedule[dayIndex]

  if (!daySchedule) {
     return { slots: [] }
  }

  // Parse start/end times "HH:mm"
  const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number)
  const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number)
  
  // Construct absolute start/end times for the slots IN TIMEZONE
  // If schedule says 08:00, it means 08:00 Argentina Time.
  // So we construct string "YYYY-MM-DDT08:00" and parse it as zoned time.
  
  const formatTime = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  
  const startTimeStr = `${dateOnly}T${formatTime(startHour, startMinute)}`
  const endTimeStr = `${dateOnly}T${formatTime(endHour, endMinute)}`
  
  const start = fromZonedTime(startTimeStr, TIMEZONE)
  const end = fromZonedTime(endTimeStr, TIMEZONE)
  
  // Find existing appointments
  const now = new Date()
  const expirationThreshold = subMinutes(now, RESERVATION_TIMEOUT_MINUTES)

  const existingAppointments = await prisma.appointment.findMany({
      where: {
          datetime: {
              gte: start,
              lt: end
          },
          OR: [
              { status: 'CONFIRMED' },
              { 
                  status: 'PENDING',
                  createdAt: { gte: expirationThreshold } 
              }
          ]
      }
  })

  const isSlotFree = (slotDate: Date) => {
      return !existingAppointments.some((app: any) => isEqual(app.datetime, slotDate))
  }

  const slots = []
  let current = start
  
  while (isBefore(current, end)) {
    if (isSlotFree(current)) {
        slots.push(current.toISOString())
    }
    current = addMinutes(current, config.duration)
  }
  
  return { slots }
}

import { randomUUID } from 'crypto'

// Upload file to Google Drive via n8n webhook
async function uploadFileToDrive(file: File, patientName: string, patientPhone: string): Promise<string | null> {
    try {
        const n8nDriveWebhook = process.env.N8N_DRIVE_WEBHOOK_URL
        if (!n8nDriveWebhook) {
            console.warn('N8N_DRIVE_WEBHOOK_URL not configured, skipping Drive upload')
            return null
        }

        const bytes = await file.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')
        const fileExtension = file.name.split('.').pop()
        const fileName = `${Date.now()}-${randomUUID()}.${fileExtension}`

        const response = await fetch(n8nDriveWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'medical_file_upload',
                patientName,
                patientPhone,
                fileName,
                mimeType: file.type,
                fileBase64: base64,
            })
        })

        if (!response.ok) {
            console.error('Drive upload failed:', await response.text())
            return null
        }

        const data = await response.json()
        return data.fileUrl || null
    } catch (err) {
        console.error('Drive upload error:', err)
        return null
    }
}

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
  const type = formData.get('type') as string || 'PRESENTIAL'
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

         // Upload to Google Drive via n8n
         medicalReportUrl = await uploadFileToDrive(medicalFile, name, phone)
     }

     // Re-calculate Deposit
     const depositAmount = config.price * (config.depositPercentage / 100);
     const bookingDate = new Date(date);

     // Transaction: Check availability + Create Appointment atomically
     const appointment = await prisma.$transaction(async (tx: any) => {
        // 1. Strict Availability Check
        // Find any appointment at this EXACT time that is NOT cancelled
        const existing = await tx.appointment.findFirst({
            where: {
                datetime: bookingDate,
                status: { in: ['CONFIRMED', 'PENDING'] }
            }
        });

        if (existing) {
            // Check if it's an expired PENDING appointment
            const isPending = existing.status === 'PENDING'
            const now = new Date()
            const expirationThreshold = subMinutes(now, RESERVATION_TIMEOUT_MINUTES)
            const isExpired = existing.createdAt < expirationThreshold

            if (isPending && isExpired) {
                // Determine it as CANCELLED and proceed
                await tx.appointment.update({
                    where: { id: existing.id },
                    data: { status: 'CANCELLED' }
                })
            } else {
                // It is either CONFIRMED or a FRESH PENDING
                throw new Error('SLOT_TAKEN');
            }
        }

        // 2. Check Blockouts (Manual Blocks)
        // Check if the specific Day is blocked out IN ARGENTINA
        const bookingDateZoned = toZonedTime(bookingDate, TIMEZONE)
        // We need to find if there is a blockout for this "Day"
        // Blockouts are stored as simple Dates (likely 00:00 UTC).
        // Let's use the same Range check as getAvailability to be safe.
        
        // derived "day" string
        const year = bookingDateZoned.getFullYear()
        const month = String(bookingDateZoned.getMonth() + 1).padStart(2, '0')
        const day = String(bookingDateZoned.getDate()).padStart(2, '0')
        const dateOnly = `${year}-${month}-${day}`
        
        const startUtc = fromZonedTime(`${dateOnly}T00:00:00`, TIMEZONE)
        const endUtc = fromZonedTime(`${dateOnly}T23:59:59.999`, TIMEZONE)

        const blockout = await tx.blockoutDate.findFirst({
             where: { 
                 date: {
                     gte: startUtc,
                     lte: endUtc
                 }
             }
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
                type: type as any,
                patientId: userId,
                depositPaid: false,
                patientNotes: patientNotes || null,
                medicalReportUrl: medicalReportUrl
            },
            include: {
                patient: true
            }
        });
     });
     
     // Create Mercado Pago Preference
     const paymentUrl = await createPreferenceForAppointment(appointment, name, session.user.email, depositAmount)
     
     
     return { 
       success: true, 
       paymentUrl: paymentUrl
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

// Separate helper for creating preference
async function createPreferenceForAppointment(appointment: any, payerName: string, payerEmail: string | null | undefined, amount: number) {
     const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'http://localhost:3000';
     
     const preferenceBody = {
        items: [
            {
                id: 'deposit',
                title: `Seña: Sesión de Kinesiología`,
                quantity: 1,
                unit_price: amount,
                currency_id: 'ARS',
            }
        ],
        payer: {
            email: payerEmail || 'unknown@email.com',
            name: payerName
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
        },
        expires: true, // Optional: MP expiration? We handled logic ourselves.
        // expiration_date_to: addMinutes(new Date(), 15).toISOString() // Optional: We could align MP preference expiration too.
     };

     const preferenceResponse = await preference.create({
        body: preferenceBody
     });

     if (!preferenceResponse.init_point) {
        throw new Error('Failed to create payment preference');
     }
     
     return preferenceResponse.init_point;
}

// NEW EXPORT: Generate Payment URL for existing PENDING appointment
export async function getAppointmentPaymentUrl(appointmentId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true }
    })

    if (!appointment) return { success: false, error: 'Appointment not found' }
    
    // Security check: only own appointments
    if (appointment.patientId !== session.user.id) {
         return { success: false, error: 'Unauthorized' }
    }

    if (appointment.status !== 'PENDING') {
         return { success: false, error: 'Appointment is not pending' }
    }

    // Check expiration
    const now = new Date()
    const expirationThreshold = subMinutes(now, RESERVATION_TIMEOUT_MINUTES)
    if (appointment.createdAt < expirationThreshold) {
         return { success: false, error: 'Appointment expired' }
    }

    const config = await getSystemConfig()
    const depositAmount = config.price * (config.depositPercentage / 100);
    
    try {
        const url = await createPreferenceForAppointment(appointment, appointment.patient.name || 'Paciente', appointment.patient.email, depositAmount)
        return { success: true, url }
    } catch (e) {
        return { success: false, error: 'Failed to generate payment link' }
    }
}
