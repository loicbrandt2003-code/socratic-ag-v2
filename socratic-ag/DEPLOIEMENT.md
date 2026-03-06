# 🏛️ Socratic Consensus — Guide de déploiement

## ✅ Étape 1 — Créer un compte GitHub (gratuit)

1. Va sur **https://github.com**
2. Clique **Sign up** → crée un compte avec ton email
3. Vérifie ton email

---

## ✅ Étape 2 — Uploader le code sur GitHub

1. Sur GitHub, clique le bouton vert **"New"** (ou **"+"** en haut à droite → "New repository")
2. Nom du repo : `socratic-consensus`
3. Laisse tout par défaut → clique **"Create repository"**
4. Sur la page suivante, clique **"uploading an existing file"**
5. **Glisse-dépose TOUT le dossier `socratic-ag`** dans la zone de dépôt
6. En bas, clique **"Commit changes"**

---

## ✅ Étape 3 — Créer un compte Vercel (gratuit)

1. Va sur **https://vercel.com**
2. Clique **"Sign Up"** → choisis **"Continue with GitHub"**
3. Autorise Vercel à accéder à ton GitHub

---

## ✅ Étape 4 — Déployer l'app sur Vercel

1. Sur Vercel, clique **"Add New Project"**
2. Tu vois ton repo `socratic-consensus` → clique **"Import"**
3. Dans la configuration :
   - **Framework Preset** : sélectionne `Create React App`
   - **Root Directory** : laisse vide (ou mets `socratic-ag` si nécessaire)
   - Tout le reste : par défaut
4. Clique **"Deploy"** → attends 1-2 minutes ☕
5. Vercel t'affiche une URL du type : **`https://socratic-consensus-xxx.vercel.app`**

🎉 **C'est en ligne !**

---

## ✅ Étape 5 — Utiliser l'app

### Interface admin (toi) :
→ Va sur `https://socratic-consensus-xxx.vercel.app`
→ Crée une session → Ajoute des points → Clique **Démarrer**
→ Le QR code affiché pointe vers l'URL participant réelle

### Interface participant (les membres de l'AG) :
→ Ils scannent le QR code avec leur smartphone
→ L'URL ressemble à : `https://socratic-consensus-xxx.vercel.app/participer/SESSION_ID/POINT_ID`
→ Ils répondent au questionnaire directement sur leur téléphone

---

## ⚠️ Note importante sur les données

Pour l'instant, les données sont stockées dans le **localStorage du navigateur**.  
Cela signifie :
- ✅ Les données persistent si tu recharges la page
- ✅ Parfait pour une AG où admin et participants sont sur le même réseau
- ❌ Les données ne se partagent PAS entre navigateurs/appareils différents

Pour une vraie synchronisation temps réel multi-appareils, il faudrait ajouter **Firebase** (base de données en temps réel). Demande-moi si tu veux qu'on fasse ça !

---

## 🔧 Optionnel — Nom de domaine personnalisé

Sur Vercel → Settings → Domains → tu peux ajouter ton propre domaine (ex: `ag.syndicat.be`)
