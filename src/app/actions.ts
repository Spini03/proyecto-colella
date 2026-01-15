'use server'

import { prisma } from '@/lib/prisma'
import { BUSINESS_RULES } from '@/lib/config/business-rules'
import { addDays, setHours, setMinutes, startOfDay, endOfDay, isBefore, addMinutes, format, parseISO } from 'date-fns'

export async function getAvailability(dateStr: string) {
  // In a real scenario, we would query the database for existing appointments
  // const appointments = await prisma.appointment.findMany(...)
  // const blockouts = await prisma.blockoutDate.findMany(...)
  
  // For now, simpler logic to scaffold the frontend
  const date = parseISO(dateStr)
  const start = setHours(date, 9) // 9 AM
  const end = setHours(date, 18) // 6 PM
  
  const slots = []
  let current = start
  
  while (isBefore(current, end)) {
    // Basic logic: if it's in the past, don't show?
    // for scaffolding, just return slots
    slots.push(current.toISOString())
    current = addMinutes(current, 60) // 1 hour slots
  }
  
  return { slots }
}

export async function bookAppointment(data: { name: string; phone: string; date: string }) {
  const { name, phone, date } = data
  
  // Validate business rules (e.g. 24h notice)
  // const bookingDate = parseISO(date)
  // if (differenceInHours(bookingDate, new Date()) < BUSINESS_RULES.CANCELLATION_MIN_HOURS) ...

  // Transaction
  try {
     // Check if user exists or create
     // const user = await prisma.user.upsert(...)
     
     // Create Appointment
     // await prisma.appointment.create(...)
     
     // For scaffolding without active DB connection, just return success
     console.log('Booking for:', name, phone, date)
     
     return { 
       success: true, 
       paymentUrl: 'https://link.mercadopago.com.ar/mock-payment' 
     }
  } catch (error) {
      console.error(error)
      return { success: false, error: 'Booking failed' }
  }
}
