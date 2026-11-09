# BEACHSIDE BOUTIQUE : site Next.js + Supabase

Le site public (portant 3D, catalogue, avis, FAQ, bouton WhatsApp) et l’espace de gestion caché (`/admin`) tournent avec Next.js. Les articles, avis et questions sont enregistrés dans Supabase : toute personne qui ouvre le site les voit, sans avoir de compte.

## 1. Préparer Supabase
1. Créez un projet sur supabase.com.
2. Ouvrez `supabase/schema.sql`, remplacez `votre@email.com` (dernière ligne) par votre adresse, collez le tout dans **SQL Editor** puis cliquez sur **Run**.
3. **Authentication > Users > Add user** : créez votre compte avec la même adresse et un mot de passe (cochez la confirmation automatique).
4. **Project Settings > API** : copiez l’URL du projet et la clé publique (« anon » ou « publishable » selon l’interface).

## 2. Lancer sur votre ordinateur
```
cp .env.example .env.local     # puis renseignez les deux valeurs copiées à l’étape 1.4
npm install
npm run dev                    # http://localhost:3000
```

## 3. Mettre en ligne (Vercel)
1. Envoyez le dossier sur GitHub.
2. Sur vercel.com, importez le dépôt.
3. Ajoutez les deux variables d’environnement de `.env.example`, puis lancez le déploiement.
4. Pour votre nom de domaine : réglages du projet, section Domains.

## 4. Au quotidien
Allez sur `https://votre-site/admin` et connectez-vous. Trois onglets :
- **Articles** : nom, prix, type (drop du jour ou arrivage), tailles, description, photo. Vous pouvez masquer ou supprimer un article.
- **Avis** : collez les vrais retours de vos clients (nom, note, texte).
- **FAQ** : ajoutez, modifiez ou supprimez vos questions.

Aucun lien ne mène à `/admin` depuis le site, et la page n’est pas indexée par les moteurs de recherche.

## Sécurité
- Seules les adresses listées dans la table `admins` peuvent publier ou supprimer (règles RLS dans `schema.sql`). Même en devinant `/admin`, un visiteur ne peut rien écrire.
- La clé publique (anon) est faite pour être visible. Ne mettez jamais la clé `service_role` dans ce projet.

## Où modifier quoi
- `lib/config.js` : numéro WhatsApp, Instagram, lien Google Maps.
- `app/globals.css` : couleurs et styles.
- `public/hero.mp4` : vidéo de fond. `public/logo.jpg` : logo (aussi `app/icon.jpg`, l’icône de l’onglet).
