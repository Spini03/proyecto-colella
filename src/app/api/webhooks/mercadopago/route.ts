import { NextRequest, NextResponse } from 'next/server';
import { payment } from '@/lib/mercadopago';
import { prisma } from '@/lib/prisma';

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
            where: { id: externalReference }
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
