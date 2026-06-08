# CLAUDE.md — NailsbySD

## Contexte du projet

NailsbySD est le site professionnel de SD, prothésiste ongulaire indépendante basée à
Cheseaux-sur-Lausanne (Suisse). Le site sert à la fois de vitrine, d'outil de gestion
de rendez-vous pour les clientes, et d'outil de gestion interne pour SD (agenda,
comptabilité, administration).

**Audience principale :**
- Clientes (grand public, mobile-first, expérience simple et élégante)
- SD elle-même (panel admin, gestion quotidienne)

**Langue du site :** Français (Suisse)
**Fuseau horaire :** Europe/Zurich

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Langage | TypeScript — mode strict activé |
| Styles | Tailwind CSS v3 |
| Base de données | PostgreSQL 16 hébergé sur Neon (neon.tech) — région AWS eu-central-1 Frankfurt |
| ORM | Prisma |
| Auth | À définir (email/password pour SD et les clientes) |
| Stockage fichiers | À définir (photos galerie) |
| Formulaires | React Hook Form + Zod |
| Emails | À définir (confirmations de RDV, rappels) |
| Déploiement | Vercel |

**Prisma Studio (visualiser/modifier les données en local) :**
```bash
cd "C:\Users\Maintenant Pret\OneDrive\Tom prv\nailsbysd"
npm run db:studio
# Ouvre une interface graphique sur localhost:5555
```

---

## Modèle de données — tables existantes (Prisma/PostgreSQL)

| Table | Contenu |
|---|---|
| `User` | Compte admin (SD) |
| `Client` | Comptes des clientes |
| `Appointment` | Tous les rendez-vous |
| `Service` | Les 4 prestations proposées |
| `WorkingHours` | Horaires d'ouverture |
| `BlockedDay` | Jours de congé / formation |
| `Photo` | Galerie de créations |

**Règles Prisma :**
- Toujours utiliser les types générés par Prisma (`@prisma/client`) — jamais de types manuels pour les entités DB
- Les queries Prisma se font uniquement côté serveur (Server Components, Route Handlers, Server Actions)
- Jamais d'accès direct à la DB depuis le client
- Gérer les erreurs Prisma explicitement (`PrismaClientKnownRequestError`, etc.)

---

## Architecture des dossiers (App Router)

```
nailsbysd/
├── app/
│   ├── (public)/          # Pages visibles par les clientes
│   │   ├── page.tsx       # Accueil / vitrine
│   │   ├── galerie/
│   │   └── rendez-vous/
│   ├── (admin)/           # Pages protégées — réservées à SD
│   │   ├── agenda/
│   │   ├── comptabilite/
│   │   └── clients/
│   └── api/               # Route handlers Next.js
├── components/
│   ├── ui/                # Composants génériques réutilisables
│   ├── booking/           # Composants liés aux RDV
│   └── admin/             # Composants du panel admin
├── lib/
│   ├── prisma.ts          # Client Prisma singleton
│   ├── validations/       # Schémas Zod
│   └── utils/             # Fonctions utilitaires pures
├── prisma/
│   └── schema.prisma      # Schéma de la base de données
└── types/                 # Types TypeScript globaux
```

---

## Règles TypeScript (non négociables)

- `strict: true` dans tsconfig — aucune exception
- Zéro `any` — utiliser `unknown` si le type est incertain, puis le narrower
- Toutes les fonctions ont des types de retour explicites
- Les props React sont typées avec des interfaces nommées (pas de types inline)
- Utiliser les types générés par Prisma directement (`Appointment`, `Client`, `Service`…)
- Les résultats de queries Prisma sont toujours gérés avec try/catch

---

## Règles de qualité du code

- **SRP** : un composant = une responsabilité. Si un fichier dépasse 200 lignes, le découper.
- **DRY** : toute logique répétée 2+ fois → extraire dans `lib/utils` ou un hook custom
- **Nommage** : variables et fonctions en anglais, clairs et descriptifs (`getUserAppointments` pas `getData`)
- **Commentaires** : JSDoc sur toutes les fonctions dans `lib/` et `api/`. Pas de commentaires évidents.
- **Pas de console.log** en dehors du développement local. Utiliser un logger structuré en prod.
- **Commits** : format conventionnel — `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`

---

## Sécurité (priorité absolue)

### Authentification & Autorisation
- Le panel admin (`/admin/*`) est protégé par middleware Next.js — vérifier le rôle à chaque requête
- Les clientes doivent créer un compte pour réserver (email/password)
- Une cliente ne peut jamais accéder aux données d'une autre cliente — vérifier l'identité dans chaque query

### Inputs & Données
- Toutes les données utilisateur passent par un schéma **Zod** avant traitement
- Sanitiser les inputs texte libres (nom, message) — protection XSS
- Ne jamais exposer des IDs séquentiels dans les URLs — utiliser des UUIDs ou slugs
- Valider côté serveur dans les Route Handlers, même si déjà validé côté client

### Secrets & Configuration
- Zéro secret dans le code source
- Variables d'environnement : `.env` (jamais committé), `.env.example` (committé, sans valeurs)
- `DATABASE_URL` (Neon) uniquement côté serveur — jamais exposée au client
- Variables publiques uniquement avec le préfixe `NEXT_PUBLIC_`

### RGPD (important — clientes suisses et européennes)
- Collecter le minimum de données nécessaires
- Consentement explicite avant tout email marketing
- Politique de confidentialité accessible
- Données de paiement : ne jamais stocker (déléguer à Stripe si paiement en ligne)

---

## Fonctionnalités — périmètre

### Public (clientes)
- [ ] Authentification clientes : inscription et connexion (email/password)
- [ ] Vitrine : présentation des services, tarifs, localisation
- [ ] Galerie photos : portfolio des réalisations
- [ ] Réservation en ligne : choix du service, date, heure → confirmation par email
- [ ] Espace cliente : historique de ses propres RDV, annulation

### Admin (SD uniquement)
- [ ] Agenda : vue semaine/mois des RDV, ajout manuel, annulation
- [ ] Gestion des disponibilités : horaires (`WorkingHours`), jours de congé (`BlockedDay`)
- [ ] Gestion des clientes : historique, notes
- [ ] Comptabilité simple : revenus par période, export CSV
- [ ] Gestion de la galerie : upload/suppression de photos
- [ ] Paramètres : services proposés (`Service`), tarifs, durées

---

## UX & Design

- **Mobile-first** : les clientes réservent principalement depuis leur téléphone
- **Élégant et épuré** : couleurs neutres/nude, typographie soignée — cohérent avec l'univers nail art
- **Accessible** : WCAG 2.1 AA minimum (contraste, focus visible, ARIA)
- **Performances** : Lighthouse > 90 sur toutes les métriques
- Les images de la galerie sont optimisées avec `next/image`
- Pas d'animations lourdes — légères et subtiles uniquement

---

## Tests

- Tester toutes les fonctions dans `lib/` avec **Vitest**
- Tester les Route Handlers API (cas nominal + cas d'erreur)
- Tester les composants critiques : formulaire de réservation, authentification
- Nommer les tests de façon descriptive : `it('should reject past dates when booking')`
- Coverage minimum cible : **75%** sur `lib/` et `app/api/`

---

## Ce qu'il ne faut jamais faire

- ❌ `any` en TypeScript
- ❌ Accéder à la base de données depuis le client (côté navigateur)
- ❌ Stocker un secret dans le code ou un fichier committé
- ❌ Faire confiance aux données côté client sans re-valider côté serveur
- ❌ Créer un composant qui fait plus d'une chose
- ❌ Oublier les états de loading et d'erreur dans les formulaires
- ❌ Déployer sans tester le flux de réservation complet
- ❌ `console.log` en production
- ❌ Modifier le schéma Prisma sans faire une migration (`prisma migrate dev`)

---

## Avant de coder une nouvelle feature — checklist mentale

1. **Planifier** : quels fichiers sont créés/modifiés ? Quelles tables Prisma sont touchées ?
2. **Sécurité** : qui a accès ? Les inputs sont-ils validés avec Zod ? La query filtre-t-elle par utilisateur ?
3. **Edge cases** : que se passe-t-il si le créneau est déjà pris ? Si l'email échoue ?
4. **Tests** : comment je vérifie que ça marche et que ça ne régresse pas ?
5. **Mobile** : est-ce que ça fonctionne sur un écran de 375px ?
