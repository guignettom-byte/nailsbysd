import twilio from "twilio";
import { format } from "date-fns";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendReminderSMS(
  phone: string,
  firstName: string,
  date: Date,
  serviceName: string
) {
  const timeStr = format(date, "HH:mm");
  const message = `Bonjour ${firstName}, rappel de votre RDV chez Nailsbysd demain à ${timeStr} pour ${serviceName}. À bientôt !`;

  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}
