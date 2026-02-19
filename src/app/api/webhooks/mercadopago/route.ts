import { NextRequest, NextResponse } from 'next/server';
import { payment } from '@/lib/mercadopago';
import { prisma } from '@/lib/prisma';
import { sendConfirmationEmail } from '@/lib/email';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { sendTelegramNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    // MP sometimes sends data in body
    const body = await request.json().catch(() => ({}));
    const dataId = id || body?.data?.id;
    const type = topic || body?.type;

    if (type === 'payment' && dataId) {
      const paymentData = await payment.get({ id: dataId });
      
      if (paymentData.status === 'approved') {
        const externalReference = paymentData.external_reference;
        
        if (externalReference) {
          // Verify it exists first
          const appointment = await prisma.appointment.findUnique({
            where: { id: externalReference },
            include: { patient: true }
          });

          if (appointment && appointment.status === 'PENDING') {
            await prisma.appointment.update({
              where: { id: externalReference },
              data: {
                status: 'CONFIRMED',
                depositPaid: true
              }
            });
            console.log(`Appointment ${externalReference} confirmed via webhook.`);
            console.log('Patient Info:', {
              email: appointment.patient?.email,
              name: appointment.patient?.name,
              datetime: appointment.datetime
            });

            if (appointment.patient && appointment.patient.email) {
                const formattedDate = format(appointment.datetime, "EEEE d 'de' MMMM", { locale: es });
                const formattedTime = format(appointment.datetime, 'HH:mm', { locale: es });
                
                console.log('Sending email to:', appointment.patient.email);
                const emailResult = await sendConfirmationEmail(
                    appointment.patient.email,
                    appointment.patient.name || 'Paciente',
                    formattedDate,
                    formattedTime
                );
                console.log('Email Result:', emailResult);
                console.warn('Cannot send email: Patient or Email missing', { 
                  hasPatient: !!appointment.patient, 
                  hasEmail: !!appointment.patient?.email 
                });
            }

            // --- Enviar Notificación a Telegram ---
            if (appointment.patient) {
                 // Fetch duration
                 const settings = await prisma.globalSettings.findUnique({ where: { id: 'settings' } });
                 const duration = settings?.sessionDuration || 30;

                 sendTelegramNotification({
                    patientName: appointment.patient.name || 'Sin Nombre',
                    patientPhone: appointment.patient.phoneNumber || 'Sin Teléfono',
                    datetime: appointment.datetime,
                    durationMinutes: duration
                 }).catch(error => console.error('Telegram Notification Error (Webhook):', error));
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    // Always return 200 to MP to stop retries, unless it's a critical logic failure we want to retry
    return NextResponse.json({ success: false }, { status: 200 }); 
  }
}
