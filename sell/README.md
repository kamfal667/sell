# SellXY Stocks - MVP Étape 9

Ce projet est la huitième étape du MVP SellXY Stocks, une application de gestion de stocks pour les boutiques en ligne et physiques.

## Fonctionnalités

- **Authentification complète** via Supabase (inscription, connexion, déconnexion)
- **Onboarding multi-étapes** pour la configuration de la boutique
- **Dashboard dynamique** basé sur le type de business
- **Sidebar conditionnelle** avec navigation adaptée au type de business
- **Cartes de statistiques** adaptées au type d'activité (E-commerce, Magasin physique, Hybride)
- **Gestion des catégories** avec CRUD complet et color picker
- **Gestion des produits** avec CRUD complet, upload d'images et gestion des stocks
- **Gestion des clients** avec CRUD complet, recherche filtrante et validation stricte
- **Gestion des commandes** avec CRUD complet, liaison client, multi-produits, statuts et calculs automatiques
- **Gestion des ventes en magasin** avec CRUD complet, liaison client facultative, multi-produits et paiement en espèces
- **Module de statistiques** avec graphiques dynamiques, KPIs, filtres temporels et export CSV
- **Module de paramètres** avec gestion du profil utilisateur, configuration de la boutique et thème clair/sombre
- **Design Glassmorphism** avec une interface utilisateur moderne et responsive

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Compte Supabase (gratuit pour commencer)

## Installation

1. Clonez ce dépôt
   ```
   git clone <url-du-repo>
   cd sellxy-stocks
   ```

2. Installez les dépendances
   ```
   npm install
   ```

3. Configurez les variables d'environnement
   - Copiez le fichier `.env.example` vers `.env`
   - Remplissez les valeurs avec vos identifiants Supabase
   ```
   cp .env.example .env
   ```

## Configuration de Supabase

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL et la clé anonyme dans les paramètres du projet
4. Ajoutez ces informations dans votre fichier `.env`

### Configuration de la base de données

Exécutez le script SQL suivant dans l'éditeur SQL de Supabase pour créer la table nécessaire :

```sql
CREATE TABLE user_business_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_boutique TEXT NOT NULL,
  type_business TEXT NOT NULL CHECK (type_business IN ('E-commerce', 'Magasin physique', 'Hybride')),
  telephone_boutique TEXT NOT NULL,
  devise TEXT NOT NULL DEFAULT 'FCFA',
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_business_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage their own config"
  ON user_business_config
  FOR ALL
  USING (auth.uid() = user_id);
  
-- Table des catégories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  couleur TEXT NOT NULL,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage their own categories"
  ON categories
  FOR ALL
  USING (auth.uid() = user_id);
  
-- Table des produits
CREATE TABLE produits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  stock_min INTEGER DEFAULT 0,
  image_url TEXT,
  categorie_id UUID REFERENCES categories(id),
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE produits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage their own produits"
  ON produits
  FOR ALL
  USING (auth.uid() = user_id);
  
-- Table des clients
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT NOT NULL,
  adresse TEXT,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage their own clients"
  ON clients
  FOR ALL
  USING (auth.uid() = user_id);
  
-- Table des commandes
CREATE TABLE commandes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_commande TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  statut TEXT CHECK (statut IN ('en attente', 'confirmée', 'livrée', 'annulée')) DEFAULT 'en attente',
  total DECIMAL(10,2) DEFAULT 0,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, numero_commande)
);

-- Table des ventes
CREATE TABLE ventes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_vente TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  total DECIMAL(10,2) DEFAULT 0,
  date_vente TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, numero_vente)
);

-- Table des produits dans une commande
CREATE TABLE commande_produits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES produits(id),
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  sous_total DECIMAL(10,2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED
);

-- Table des produits dans une vente
CREATE TABLE vente_produits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vente_id UUID REFERENCES ventes(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES produits(id),
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  sous_total DECIMAL(10,2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED
);

ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commande_produits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage their own commandes"
  ON commandes
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "users can manage their own commande_produits"
  ON commande_produits
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM commandes
      WHERE commandes.id = commande_produits.commande_id
      AND commandes.user_id = auth.uid()
    )
  );

ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vente_produits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage their own ventes"
  ON ventes
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "users can manage their own vente_produits"
  ON vente_produits
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ventes
      WHERE ventes.id = vente_produits.vente_id
      AND ventes.user_id = auth.uid()
    )
  );
```

## Démarrage de l'application

```
npm start
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## Structure du projet

```
src/
├── components/       # Composants réutilisables
│   ├── CategoryModal.js     # Modale pour ajouter/modifier une catégorie
│   ├── ProduitModal.js      # Modale pour ajouter/modifier un produit
│   ├── ClientModal.js       # Modale pour ajouter/modifier un client
│   ├── CommandeModal.js     # Modale pour ajouter/modifier une commande
│   ├── VenteModal.js        # Modale pour ajouter/modifier une vente
│   ├── DashboardCard.js     # Carte statistique individuelle
│   ├── DashboardCards.js    # Conteneur de cartes adapté au type de business
│   ├── Loader.js            # Composant de chargement
│   ├── Logout.js            # Bouton de déconnexion
│   └── Sidebar.js           # Barre latérale conditionnelle
├── context/          # Contextes React
│   ├── AuthContext.js       # Gestion de l'authentification
│   └── UserBusinessContext.js # Gestion de la configuration business
├── pages/            # Pages de l'application
│   ├── Categories.js        # Gestion des catégories (CRUD)
│   ├── Clients.js           # Gestion des clients (CRUD)
│   ├── Dashboard.js         # Dashboard dynamique
│   ├── Login.js             # Page de connexion
│   ├── Onboarding.js        # Configuration multi-étapes
│   ├── Produits.js          # Gestion des produits (CRUD)
│   └── Signup.js            # Création de compte
├── styles/           # Fichiers CSS modulaires
├── utils/            # Utilitaires (client Supabase)
└── App.js            # Point d'entrée de l'application
```

## Flux utilisateur

1. **Inscription** (`/signup`)
   - L'utilisateur crée un compte avec prénom, nom, email et mot de passe
   - Redirection vers l'onboarding

2. **Connexion** (`/`)
   - L'utilisateur se connecte avec email et mot de passe
   - Redirection vers le dashboard si déjà configuré, sinon vers l'onboarding

3. **Onboarding** (`/onboarding`)
   - Formulaire en 4 étapes pour configurer la boutique
   - Enregistrement dans la base de données
   - Redirection vers le dashboard

4. **Dashboard** (`/dashboard`)
   - Sidebar conditionnelle selon le type de business
   - Cartes statistiques adaptées au type d'activité:
     - **E-commerce**: CA 30 jours, Nombre de commandes, Taux de conversion
     - **Magasin physique**: Valeur du stock, Articles en rupture, Rotation articles
     - **Hybride**: CA global, Ventes en ligne, Ventes magasin, Valeur du stock
   - Navigation vers les autres modules (Commandes, Ventes, Inventaire, Clients, Paramètres)
   - Bouton de déconnexion
   
5. **Catégories** (`/categories`)
   - Liste des catégories avec couleurs associées
   - Ajout de catégorie via modale avec color picker
   - Modification de catégorie existante
   - Suppression de catégorie avec confirmation
   - Validation des champs obligatoires (nom et couleur)
   - Message "Aucune catégorie" si la liste est vide
   
6. **Produits** (`/produits`)
   - Liste des produits avec images, prix, stock et catégorie
   - Ajout de produit via modale avec upload d'image
   - Modification de produit existant
   - Suppression de produit avec confirmation
   - Validation des champs obligatoires (nom, prix)
   - Alerte visuelle si stock < stock_min
   - Upload et prévisualisation d'images via Supabase Storage
   - Message "Aucun produit" si la liste est vide
   
7. **Clients** (`/clients`)
   - Liste des clients avec informations de contact
   - Recherche filtrante en direct (nom, prénom, email)
   - Ajout de client via modale
   - Modification de client existant
   - Suppression de client avec confirmation
   - Validation des champs obligatoires (prénom, nom, téléphone)
   - Validation du format d'email
   - Message "Aucun client" si la liste est vide
   
8. **Commandes** (`/commandes`)
   - Liste des commandes avec numéro, client, statut et total
   - Ajout de commande via modale avec sélection de client
   - Sélection multiple de produits avec quantités
   - Calcul automatique des sous-totaux et total général
   - Modification de commande existante
   - Changement de statut (en attente, confirmée, livrée, annulée)
   - Suppression de commande avec confirmation
   - Validation des champs obligatoires (client, au moins un produit)
   - Message "Aucune commande" si la liste est vide
   
9. **Ventes** (`/ventes`)
   - Liste des ventes avec numéro, client, date et total
   - Ajout de vente via modale avec sélection de client facultative
   - Sélection multiple de produits avec quantités
   - Calcul automatique des sous-totaux et total général
   - Mode de paiement fixe "Espèces"
   - Modification de vente existante
   - Suppression de vente avec confirmation
   - Validation des champs obligatoires (au moins un produit)
   - Message "Aucune vente" si la liste est vide
   
10. **Statistiques** (`/stats`)
   - Affichage de KPIs clés (CA, bénéfices, clients, ventes, panier moyen)
   - Graphiques dynamiques (courbes, barres) pour l'évolution des ventes
   - Filtres temporels (7 jours, 30 jours, plage personnalisée)
   - Export CSV des données statistiques
   - Adaptation au type de business (E-commerce, Magasin physique, Hybride)
   - Modale pour sélection de plage de dates personnalisée
   - Message "Aucune donnée" si aucune statistique disponible
   
11. **Paramètres** (`/parametres`)
   - Gestion du profil utilisateur (prénom, nom, email, téléphone)
   - Gestion de la configuration boutique (nom, type, téléphone, devise)
   - Changement de thème Dark / Light avec persistance localStorage
   - Modales d'édition avec validation stricte
   - Design glassmorphism adaptatif selon le thème
   - Responsive 360–1920px

## Styles

L'application utilise un design Glassmorphism avec :
- Fond semi-transparent
- Coins arrondis (16px minimum)
- Palette de couleurs : #FF6B35 (orange), #2C3E50 (bleu foncé) et #16A085 (vert)
- CSS modulaire (pas de Tailwind)
- Transitions uniformes (0.3s cubic-bezier)
- Design responsive (360px à 1920px)

## Tests

Points de test à vérifier manuellement :
- Inscription valide/invalide
- Connexion valide/invalide
- Onboarding obligatoire si pas encore configuré
- Blocage onboarding si champ vide
- Dashboard E-commerce affiche les bonnes cartes
- Dashboard Magasin physique affiche les bonnes cartes
- Dashboard Hybride affiche les bonnes cartes
- Sidebar conditionnelle selon le type de business
- Création de catégorie valide
- Création de catégorie invalide (champs manquants)
- Modification de catégorie
- Suppression de catégorie
- Color picker fonctionne correctement
- Message "Aucune catégorie" si liste vide
- Création de produit valide
- Création de produit invalide (champs manquants)
- Modification de produit
- Suppression de produit
- Upload d'image fonctionne correctement
- Alerte stock faible visible si stock < stock_min
- Message "Aucun produit" si liste vide
- Création de client valide
- Création de client invalide (champs manquants)
- Modification de client
- Suppression de client
- Recherche de client fonctionne correctement
- Validation d'email fonctionne correctement
- Message "Aucun client" si liste vide
- Création de commande valide
- Création de commande invalide (client manquant, produits manquants)
- Modification de commande
- Suppression de commande
- Changement de statut fonctionne correctement
- Calcul automatique des sous-totaux et total
- Message "Aucune commande" si liste vide
- Création de vente valide
- Création de vente invalide (produits manquants)
- Modification de vente
- Suppression de vente
- Calcul automatique des sous-totaux et total
- Affichage correct du mode de paiement "Espèces"
- Message "Aucune vente" si liste vide
- Loader visible pendant requêtes
- Toast lisible en cas d'erreur
- Responsive sur différentes tailles d'écran (360px à 1920px)
- Navigation entre les pages fonctionne correctement
- Statistiques affichent les bonnes données selon le type de business
- Filtres temporels (7j, 30j, personnalisé) fonctionnent correctement
- Export CSV génère un fichier valide
- Graphiques s'affichent correctement avec les bonnes données
- Modale de sélection de dates personnalisées fonctionne correctement
- Message "Aucune donnée" s'affiche quand nécessaire
- Édition du profil utilisateur fonctionne correctement
- Édition de la configuration boutique fonctionne correctement
- Changement de thème Dark / Light fonctionne correctement
- Thème persiste après rechargement de la page
- Validation des formulaires fonctionne correctement
- Design glassmorphism s'adapte au thème sélectionné
- Responsive sur différentes tailles d'écran

## Licence

Ce projet est sous licence privée.
