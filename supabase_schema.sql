-- ==============================================================
-- SCHEMA SQL POUR INVOICIFY (SUPABASE POSTGRESQL)
-- ==============================================================
-- À copier-coller dans l'éditeur SQL de votre tableau de bord Supabase
-- (SQL Editor -> New Query -> Run)

-- 1. ENUMS & ROLES
CREATE TYPE user_role AS ENUM ('ADMIN', 'EMPLOYEE');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'PENDING', 'PAID', 'CANCELLED', 'OVERDUE');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETE', 'FAILED', 'CANCELLED');

-- 2. TABLE: PROFILES (Étend auth.users de Supabase Auth)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLE: INVOICES (Factures)
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL, -- Format: INV-YYYY-001
    status invoice_status NOT NULL DEFAULT 'DRAFT',
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
    country_code VARCHAR(2) NOT NULL,
    payment_link TEXT,
    notchpay_reference TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLE: INVOICE_ITEMS (Prestations détaillées)
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLE: PAYMENTS (Historique NotchPay)
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    notchpay_transaction_id TEXT UNIQUE,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL,
    status payment_status NOT NULL DEFAULT 'PENDING',
    payment_method TEXT,
    payer_email TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================
-- INDEXES DE PERFORMANCE
-- ==============================================================
CREATE INDEX idx_invoices_user ON public.invoices(user_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);

-- ==============================================================
-- AUTOMATISATION : CREATION DU PROFIL LORS DE L'INSCRIPTION
-- ==============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Utilisateur Invoicify'),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'EMPLOYEE'::user_role)
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================
-- SECURITE : ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================

-- Activation RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Fonctions d'aide pour vérifier les rôles sans récursion infinie
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- POLITIQUES : PROFILES
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil ou les admins peuvent tout voir" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Les admins peuvent modifier les profils (pour assigner des rôles)" 
    ON public.profiles FOR UPDATE 
    USING (public.is_admin(auth.uid()));

-- POLITIQUES : INVOICES
CREATE POLICY "Les employés voient leurs factures et les admins voient tout" 
    ON public.invoices FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Les employés créent pour eux-mêmes et les admins pour tout le monde" 
    ON public.invoices FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Les employés mettent à jour leurs factures en attente et les admins tout" 
    ON public.invoices FOR UPDATE 
    USING (
        (auth.uid() = user_id AND (status = 'PENDING' OR status = 'DRAFT')) 
        OR public.is_admin(auth.uid())
    );

-- POLITIQUES : INVOICE_ITEMS
CREATE POLICY "Lecture des prestations liées aux factures visibles" 
    ON public.invoice_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE invoices.id = invoice_items.invoice_id 
              AND (invoices.user_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );

CREATE POLICY "Insertion des prestations sur factures modifiables" 
    ON public.invoice_items FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE invoices.id = invoice_items.invoice_id 
              AND (invoices.user_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );

-- POLITIQUES : PAYMENTS
CREATE POLICY "Lecture des paiements liés aux factures visibles" 
    ON public.payments FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE invoices.id = payments.invoice_id 
              AND (invoices.user_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );
