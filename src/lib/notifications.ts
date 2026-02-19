import { formatInTimeZone } from 'date-fns-tz';
import { addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TIMEZONE = 'America/Argentina/Buenos_Aires';

interface AppointmentNotificationData {
  patientName: string;
  patientPhone: string;
  datetime: Date;
  durationMinutes: number;
}

export async function sendTelegramNotification(data: AppointmentNotificationData) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram Notification Skipped: Missing Environment Variables');
    return;
  }

  try {
    const { patientName, patientPhone, datetime, durationMinutes } = data;

    // Format Date: "Viernes 14/02"
    // formatInTimeZone takes: date, timezone, formatStr, options
    const dateFormatted = formatInTimeZone(datetime, TIMEZONE, "EEEE d 'de' MMMM", { locale: es });
    
    // Capitalize first letter
    const dateFinal = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

    // Format Start Time: "HH:mm"
    const startTime = formatInTimeZone(datetime, TIMEZONE, 'HH:mm');

    // Calculate End Time
    // We add minutes to the original UTC date, then format in timezone
    const endDate = addMinutes(datetime, durationMinutes);
    const endTime = formatInTimeZone(endDate, TIMEZONE, 'HH:mm');

    // Prepare Message HTML
    const message = `
<b>✅ ¡Nuevo Turno Agendado!</b>

👤 <b>Paciente:</b> ${patientName}
📅 <b>Fecha:</b> ${dateFinal}
⏰ <b>Horario:</b> ${startTime} - ${endTime} hs
📱 <b>Teléfono:</b> <a href="https://wa.me/${patientPhone.replace(/\D/g, '')}">${patientPhone}</a>
    `.trim();

    // Send Request
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
    });

    if (!response.ok) {
        const errVal = await response.text();
        console.error('Telegram API Error:', errVal);
    } else {
        console.log('Telegram Notification Sent Successfully');
    }

  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}
