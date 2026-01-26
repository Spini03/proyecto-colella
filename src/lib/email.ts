import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(
  to: string, 
  clientName: string, 
  appointmentDate: string,
  appointmentTime: string
) {
  try {
    // --- DEV OVERRIDE ---
    // Resend free tier only allows sending to the verified email.
    // We redirect all emails to santiagospini@gmail.com for testing.
    const DEV_EMAIL = 'santiagospini@gmail.com';
    
    console.log(`[DEV] Redirecting email from ${to} to ${DEV_EMAIL}`);

    const response = await resend.emails.send({
      from: 'Federico Colella <onboarding@resend.dev>',
      to: [DEV_EMAIL], 
      subject: `[TEST] Confirmación de Turno - Federico Colella`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ffe4e6; color: #881337; padding: 10px; margin-bottom: 20px; border-radius: 4px; font-size: 12px; text-align: center;">
            <strong>MODO PRUEBA:</strong> Este correo fue enviado a ${DEV_EMAIL} porque Resend está en modo gratuito.<br/>
            <strong>Destinatario Original:</strong> ${to}
          </div>

          <h1>¡Turno Confirmado!</h1>
          <p>Hola ${clientName},</p>
          <p>Tu turno ha sido confirmado exitosamente.</p>
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Fecha:</strong> ${appointmentDate}</p>
            <p><strong>Hora:</strong> ${appointmentTime}</p>
            <p><strong>Lugar:</strong> Pellegrini 2051, Piso 1</p>
          </div>
          <p>Si necesitas reprogramar o cancelar, por favor contáctanos con al menos 24 horas de anticipación.</p>
          <p>¡Te esperamos!</p>
          <p>Saludos,<br>Federico Colella</p>
        </div>
      `,
    });

    console.log('Resend full response:', response);
    const { data, error } = response;

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception sending email:', error);
    return { success: false, error };
  }
}
