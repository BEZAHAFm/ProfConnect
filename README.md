# ProfConnect — application web

ProfConnect est un starter React/Vite avec connexion professeur et sauvegarde permanente via Supabase.

## Fonctionnalités incluses

- Connexion par email et mot de passe.
- Classes et liste des élèves.
- Notes sur 20 avec coefficients.
- Appel : présent, absent, en retard.
- Registre des retards.
- Emploi du temps.
- Cahier de textes / devoirs.
- Politiques de sécurité Supabase pour isoler les données de chaque compte.

## 1. Créer la base de données

1. Crée un projet sur https://supabase.com/.
2. Dans le projet, ouvre **SQL Editor**.
3. Copie et exécute tout le contenu de `supabase/schema.sql`.
4. Dans **Authentication → Users**, crée ton utilisateur professeur avec ton email et un mot de passe. Désactive les inscriptions publiques si tu veux être le seul à pouvoir créer un compte.

## 2. Configurer l'application

Installe Node.js (version LTS), puis à la racine du projet :

```bash
cp .env.example .env
```

Ouvre `.env` et remplace les valeurs par l'URL du projet Supabase et la clé publique `anon` / `publishable`, disponibles dans **Project Settings → API**.

Ne mets jamais la clé `service_role` ou une clé secrète dans le fichier `.env` côté navigateur.

Puis lance :

```bash
npm install
npm run dev
```

Vite affiche une adresse locale à ouvrir dans ton navigateur.

## 3. Publier l'application avec un lien

1. Place le dossier dans un dépôt GitHub privé ou public.
2. Crée un projet sur https://vercel.com/ et importe le dépôt.
3. Dans les paramètres du projet Vercel, ajoute `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` avec les mêmes valeurs que dans `.env`.
4. Déploie. Vercel donnera une URL web.
5. Dans Supabase Authentication, configure l'URL du site et les URL de redirection autorisées avec l'adresse de production.

## Sécurité et limites du prototype

- Les données sont stockées dans Supabase et ne dépendent pas du navigateur.
- La base utilise Row Level Security et associe les enregistrements à l'utilisateur connecté.
- Le tableau de bord est une première version : les moyennes affichées sont des moyennes simples, pas encore pondérées par coefficient.
- L'appel enregistre les statuts individuels. Les modifications sont faites par le compte professeur connecté.
- Avant d'utiliser des données réelles d'élèves, sécurise le compte (mot de passe fort, MFA si possible), vérifie les obligations RGPD et ne publie pas d'informations nominatives inutilement.
- Le site n'est pas encore déployé : il faut connecter tes propres comptes Supabase et Vercel.
