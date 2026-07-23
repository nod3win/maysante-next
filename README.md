# Maysanté — Site public

Site vitrine de [maysante.be](https://maysante.be) : soins infirmiers et garde malade à domicile à Bruxelles. Next.js 16 (App Router, `src/`), Tailwind CSS 4, shadcn/ui, MySQL.

## Architecture

L'écosystème Maysanté tient en **deux projets** qui partagent la base MySQL `maysante_data` :

| Projet | Rôle |
|---|---|
| `maysante-next` (celui-ci) | Site public : vitrine, formulaires, blog, tracking analytics |
| `maysante-admin` | Plateforme privée : demandes, articles + génération IA, statistiques |

## Fonctionnalités

- **Pages vitrine** : accueil, services, soins à domicile (+ pages par commune), à propos, contact.
- **Formulaires** (`/contact`, `/etre-appele`) : validation zod, rate-limit par IP, insertion MySQL (`contacts` / `appels`) et notification email via Resend aux adresses configurées dans l'admin.
- **Blog** : lu depuis la table `articles` (rédigé/généré dans l'admin), rendu en ISR (revalidation 60 s).
- **Analytics maison** : chaque page vue est envoyée à `POST /api/track` puis stockée anonymisée dans `analytics_events` (hash SHA-256 à sel quotidien, sans cookies, sans IP — conforme RGPD). Le tableau de bord est dans l'admin (`/statistiques`).

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                  # http://localhost:3000
```

Le schéma de la base est dans `../schema.sql` (et `../migrations/` pour les évolutions).

## Déploiement

```bash
npm run build
npm start        # ou : pm2 start npm --name maysante-next -- start
```

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Connexion MySQL (`maysante_data`) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Envoi des notifications de demandes |
| `CORP_LOGO_URL` | Logo utilisé dans les emails |
| `ADMIN_URL_PREFIX` | Base des liens vers l'admin dans les emails (obligatoire) |
| `ANALYTICS_SECRET` | Sel du hash visiteur de l'analytics maison |
