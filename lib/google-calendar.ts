import { logger } from "@/lib/logger";

export async function createCalendarEvent(params: {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
}): Promise<string | null> {
  if (!process.env.GOOGLE_REFRESH_TOKEN) return null;

  try {
    const { google } = await import("googleapis");

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const calendar = google.calendar({ version: "v3", auth });
    const event = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
      requestBody: {
        summary: params.summary,
        description: params.description,
        start: { dateTime: params.startTime.toISOString(), timeZone: "Europe/Zurich" },
        end: { dateTime: params.endTime.toISOString(), timeZone: "Europe/Zurich" },
      },
    });
    return event.data.id ?? null;
  } catch (error) {
    logger.error("Google Calendar error", error);
    return null;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  if (!process.env.GOOGLE_REFRESH_TOKEN) return;

  try {
    const { google } = await import("googleapis");

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
      eventId,
    });
  } catch (error) {
    logger.error("Google Calendar delete error", error);
  }
}
