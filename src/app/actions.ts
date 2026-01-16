'use server'

import { prisma } from '@/lib/prisma'
import { BUSINESS_RULES } from '@/lib/config/business-rules'
import { preference } from '@/lib/mercadopago'

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

import { auth } from '@/auth'

export async function bookAppointment(data: { name: string; phone: string; date: string }) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const { name, phone, date } = data
  const userId = session.user.id

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
     let depositAmount = 0;
     if (BUSINESS_RULES.DEPOSIT_TYPE === 'PERCENTAGE') {
        depositAmount = BUSINESS_RULES.SERVICE_PRICE * (BUSINESS_RULES.DEPOSIT_PERCENTAGE / 100);
     } else {
        // Fallback or Fixed logic if added later
        depositAmount = BUSINESS_RULES.SERVICE_PRICE; 
     }

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
     // Priority: Defined APP_URL -> NEXT_PUBLIC -> AUTH_URL -> localhost
     const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'http://localhost:3000';
     
     const preferenceBody = {
        items: [
            {
                id: 'deposit',
                title: `Deposit: Kinesiology Session`, // customizable
                quantity: 1,
                unit_price: depositAmount,
                currency_id: 'ARS',
            }
        ],
        payer: {
            email: session.user.email || 'unknown@email.com',
            name: name
        },
        external_reference: appointment.id, // CRITICAL: Link to DB
        back_urls: {
            success: `${appUrl}/booking/success`,
            failure: `${appUrl}/booking/failure`,
            pending: `${appUrl}/booking/pending`
        },
        // auto_return: 'approved',
        notification_url: `${appUrl}/api/webhooks/mercadopago`, // Must be public https in prod (e.g. via ngrok for dev)
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
