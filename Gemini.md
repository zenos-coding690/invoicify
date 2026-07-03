# 🏗️ Spécifications & Design System — Invoicify (SaaS de Facturation)

> **Projet** : Invoicify
> **Auteur** : Lead Architect & Design Master Pro
> **Stack** : Next.js 15, Supabase, Vercel, Tailwind CSS

---

## 1. Architecture Technique & Webhooks

L'architecture s'appuie sur **Supabase** comme infrastructure complète (BaaS) pour simplifier le backend et bénéficier d'une intégration Vercel fluide.

- **Frontend** : Next.js 15 (App Router), React 19, Tailwind CSS v4.
- **Backend & Database** : Supabase (PostgreSQL 16, Supabase Auth).
- **Temps Réel** : Supabase Realtime (remplace Socket.io) pour propager les changements.
- **Hébergement** : Vercel.

### 1.1. Gestion des Webhooks NotchPay (Temps Réel)
1. NotchPay envoie un payload de confirmation au webhook exposé par une Next.js Route Handler (`/api/webhooks/notchpay`).
2. Le Route Handler vérifie la signature **HMAC** et valide l'idempotence.
3. Le backend met à jour la table `invoices` (via Supabase Admin Client).
4. **Supabase Realtime** écoute la table `invoices` et propage le changement au client instantanément.
5. L'interface affiche un Skeleton de chargement lors de l'attente d'une action, puis bascule vers l'état de Succès via le Pop-up temps réel.

---

## 2. Modèle Conceptuel de Données (MCD - Supabase)

L'avantage de Supabase est l'intégration de `auth.users` que nous étendons via des tables liées.

- `profiles` : Étend `auth.users` (id, role: ADMIN|EMPLOYEE, full_name).
- `tasks` / `invoice_items` : id, invoice_id (FK), title, unit_price, quantity.
- `invoices` : id, user_id (FK), total_amount, currency, status (PENDING, PAID), country_code, payment_link, notchpay_ref, created_at.
- `payments` : Historique des paiements (webhook logs).

---

## 3. Parcours Utilisateur & Composants UI (Refonte Fintech Premium)

### 3.1. Workflow Employé (Créateur de Factures Multi-Lignes)
1. **Saisie des Prestations (Panier)** : L'employé saisit les tâches (titre, prix, quantité) et les ajoute au brouillon en cours. Les items s'affichent sous forme de liste avec calcul dynamique du sous-total.
2. **Choix du Pays & Devise** : Sélection du pays du client (avec drapeau) qui détermine automatiquement la devise (ex: 🇨🇲 -> XAF).
3. **Génération du Lien** : Clic sur le bouton de génération (avec effet de reflet *shimmer*). Les items sont regroupés sous une seule facture avec le statut *"En attente"* et une pastille orange pulsante.
4. **Paiement (Temps Réel)** : Le client paie. Supabase Realtime déclenche l'animation de toast (`slide-in-from-top-5`, bordure gauche émeraude) et la facture passe au vert.

### 3.2. Workflow Administrateur (Supervision CA)
1. **KPI Cards Premium** : Dashboard avec 3 métriques (CA, Employés, Taux de conversion) agrémentées de mini-graphiques de tendance (Sparklines SVG) et de halos de lumière d'arrière-plan.
2. **Tableau "Dribbble-Style"** : Remplacement des grilles brutes par des lignes indépendantes sous forme de cartes flottantes avec ombres diffuses.

---

## 4. Maquettes Textuelles (Skeletons & Classes Tailwind v4)

Voici la structure de code type reflétant scrupuleusement notre **Design System**.

### 4.1. Configuration Globale (`globals.css`)
```css
@theme inline {
  --color-primary: #1062FE;
  --color-sidebar: #E5F0FF;
  --font-sans: var(--font-jakarta), Arial, sans-serif;
  --shadow-premium: 0 10px 40px -10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01);
  --shadow-lux: 0 20px 50px -12px rgba(16, 98, 254, 0.05);
}
```

### 4.2. Layout Principal avec Sidebar Glassmorphic
```html
<div className="flex min-h-screen">
  {/* Sidebar Glassmorphic */}
  <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200/50 flex flex-col min-h-screen">
    <div className="p-6 font-bold text-xl tracking-tight text-slate-900">
      Invoicify<span className="text-[#1062FE]">.</span>
    </div>
    <nav className="flex-1 px-3 py-6 space-y-1">
      <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-[#1062FE] hover:bg-slate-50">
        Mes Prestations
      </a>
    </nav>
  </aside>
  <main className="flex-1 p-8 overflow-y-auto bg-[#F4F7FB]">
    {/* Contenu */}
  </main>
</div>
```

### 4.3. Carte de Métrique avec Sparkline
```html
<div className="bg-white rounded-2xl p-6 shadow-premium border border-slate-200/50 hover:shadow-lux hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
  <div className="relative z-10">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</p>
    <h3 className="text-3xl font-bold text-slate-900">2 540 000 XAF</h3>
  </div>
  {/* Sparkline SVG */}
  <div className="mt-6 h-12 w-full">
    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
      <path d="M0,25 Q15,15 30,22 T60,5 T85,15 T100,2" fill="none" stroke="#1062FE" strokeWidth="2" />
    </svg>
  </div>
</div>
```

### 4.4. Bouton de Génération avec Reflet Shimmer
```html
<button className="group relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-gradient-to-r from-[#1062FE] to-[#3B82F6] rounded-xl hover:shadow-[0_0_20px_rgba(16,98,254,0.3)] transition-all duration-300">
  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
  Générer le lien
</button>
```

### 4.5. Ligne de Facture "Dribbble-Style" (Carte flottante)
```html
<div className="bg-white rounded-xl p-5 shadow-premium border border-slate-100 hover:border-slate-200/80 transition-all duration-300 flex justify-between items-center">
  <div>
    <h4 className="font-bold text-slate-900 text-sm">INV-2026-003</h4>
    <p className="text-xs text-slate-500">2 prestation(s)</p>
  </div>
  <div className="flex items-center gap-4">
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
      En Attente
    </span>
    <span className="font-bold text-slate-900 text-right whitespace-nowrap">
      1 500 000 XAF
    </span>
  </div>
</div>
```
