import { z } from "zod";

/**
 * Schéma de validation pour la création d'un rendez-vous (POST /api/appointments).
 * Valide les données reçues du client avant tout traitement serveur.
 */
export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1, "Prestation requise"),
  date: z
    .string()
    .datetime({ message: "Date invalide" })
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: "La date doit être dans le futur",
    }),
  comment: z.string().trim().max(500, "Commentaire trop long").optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
