import nodemailer from "nodemailer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface AppointmentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceName: string;
  date: Date;
  endTime: Date;
}

const emailStyles = `
  font-family: 'Jost', Helvetica, Arial, sans-serif;
  color: #2a2018;
`;

export async function sendConfirmationEmail(data: AppointmentData) {
  const dateStr = format(data.date, "EEEE d MMMM yyyy", { locale: fr });
  const timeStr = format(data.date, "HH:mm");

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.email,
    subject: `Confirmation de votre rendez-vous chez Nailsbysd`,
    html: `
      <div style="${emailStyles} max-width: 600px; margin: 0 auto; background: #faf6f1; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: Georgia, serif; color: #78716c; font-size: 32px; margin: 0;">Nailsbysd</h1>
          <p style="color: #78716c; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Prothésiste Ongulaire</p>
        </div>
        <div style="background: white; padding: 30px; border-left: 3px solid #78716c;">
          <p>Bonjour ${data.firstName},</p>
          <p>Votre rendez-vous a bien été enregistré. Voici le récapitulatif :</p>
          <table style="width: 100%; margin: 20px 0;">
            <tr><td style="padding: 8px 0; color: #888;">Prestation</td><td style="font-weight: 500;">${data.serviceName}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Date</td><td style="font-weight: 500;">${dateStr}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Heure</td><td style="font-weight: 500;">${timeStr}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Lieu</td><td style="font-weight: 500;">Cheseaux-sur-Lausanne</td></tr>
          </table>
          <p style="background: #faf6f1; padding: 15px; border-radius: 4px; font-size: 14px;">
            En cas d'empêchement, merci de prévenir au moins 24h à l'avance.
          </p>
        </div>
        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
          Nailsbysd — Cheseaux-sur-Lausanne, Suisse<br>
          <a href="https://www.instagram.com/nailsbysd" style="color: #78716c;">@nailsbysd</a>
        </p>
      </div>
    `,
  });
}

export async function sendReminderEmail(data: AppointmentData) {
  const timeStr = format(data.date, "HH:mm");

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.email,
    subject: `Rappel : votre RDV chez Nailsbysd demain à ${timeStr}`,
    html: `
      <div style="${emailStyles} max-width: 600px; margin: 0 auto; background: #faf6f1; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: Georgia, serif; color: #78716c; font-size: 32px; margin: 0;">Nailsbysd</h1>
        </div>
        <div style="background: white; padding: 30px; border-left: 3px solid #78716c;">
          <p>Bonjour ${data.firstName},</p>
          <p>Ceci est un rappel pour votre rendez-vous <strong>demain à ${timeStr}</strong> pour <strong>${data.serviceName}</strong>.</p>
          <p>À très bientôt ✨</p>
        </div>
      </div>
    `,
  });
}

export async function sendAdminNotification(data: AppointmentData) {
  const dateStr = format(data.date, "EEEE d MMMM yyyy à HH:mm", { locale: fr });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `Nouvelle réservation — ${data.firstName} ${data.lastName}`,
    html: `
      <div style="${emailStyles} max-width: 600px; margin: 0 auto; padding: 30px;">
        <h2 style="color: #78716c;">Nouvelle réservation</h2>
        <table style="width: 100%;">
          <tr><td style="padding: 6px 0; color: #888;">Client</td><td>${data.firstName} ${data.lastName}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Email</td><td>${data.email}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Téléphone</td><td>${data.phone}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Prestation</td><td>${data.serviceName}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Date</td><td>${dateStr}</td></tr>
        </table>
        <p><a href="${process.env.NEXTAUTH_URL}/admin" style="background: #78716c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Voir dans l'admin</a></p>
      </div>
    `,
  });
}
