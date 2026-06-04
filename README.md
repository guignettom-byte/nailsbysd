# Nailsbysd — Site de prise de rendez-vous

Site web complet pour Nailsbysd, prothésiste ongulaire à Cheseaux-sur-Lausanne.

## Stack technique

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** (palette luxe nude/doré)
- **Prisma 5** + SQLite (dev) / PostgreSQL (production)
- **NextAuth v4** — authentification admin
- **Nodemailer** — emails de confirmation et rappel
- **Twilio** — SMS de rappel 24h avant
- **Google Calendar API** — synchronisation des RDV

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Copier les variables d'environnement
cp .env.example .env
# Remplir les valeurs dans .env

# 3. Initialiser la base de données
npm run db:push

# 4. Peupler les données initiales (admin + prestations + horaires)
npm run db:seed

# 5. Lancer en développement
npm run dev
```

Le site est accessible sur http://localhost:3000

## Variables d'environnement

Voir `.env.example` pour toutes les variables requises.

| Variable | Requis | Description |
|---|---|---|
| `DATABASE_URL` | oui | `file:./prisma/dev.db` en dev |
| `NEXTAUTH_SECRET` | oui | Générer avec `openssl rand -base64 32` |
| `SMTP_*` | oui | Configuration SMTP pour les emails |
| `TWILIO_*` | optionnel | SMS de rappel |
| `GOOGLE_*` | optionnel | Synchro Google Calendar |

## Accès admin

Après le seed :
- **URL** : `/admin`
- **Email** : `admin@nailsbysd.ch`
- **Mot de passe** : `nailsbysd2024!` *(à changer en production !)*

## Rappels automatiques

Pour activer les rappels email (48h) et SMS (24h), configurer un cron job qui appelle :

```
POST /api/reminders
Authorization: Bearer <NEXTAUTH_SECRET>
```

Avec **Vercel Cron** (ajouter dans `vercel.json`) :

```json
{
  "crons": [
    {
      "path": "/api/reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## Déploiement sur Vercel

```bash
npm i -g vercel
vercel
```

Configurer les variables d'environnement sur le dashboard Vercel.
Pour la prod, remplacer SQLite par PostgreSQL (Neon, Supabase) et modifier `prisma/schema.prisma` avec `provider = "postgresql"`.

## Structure du projet

```
/app
  /admin              - Interface admin (protégée)
    /login            - Page de connexion
    /appointments     - Gestion des RDV
    /services         - Gestion des prestations
    /blocked-days     - Jours bloqués (congés, formations)
    /working-hours    - Horaires de travail
  /api                - Routes API REST

/components
  /ui                 - Composants de base
  /admin              - Composants admin
  Navbar, HeroSection, ServicesSection, BookingSection, Footer

/lib
  prisma.ts, auth.ts, availability.ts, email.ts, sms.ts, google-calendar.ts

/prisma
  schema.prisma       - Modèles de données
  seed.ts             - Données initiales
```
