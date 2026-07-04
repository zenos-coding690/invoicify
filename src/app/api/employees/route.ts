import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Utilisation de la clé Service Role pour avoir les droits d'administration (bypasser RLS et créer un user auth sans connecter)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(req: Request) {
  try {
    const { email, password, full_name } = await req.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Email, mot de passe et nom complet requis." }, { status: 400 });
    }

    // 1. Création de l'utilisateur dans Supabase Auth (auth.users)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // On confirme directement l'email pour simplifier
    });

    if (authError) {
      console.error("Erreur création auth:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Erreur inconnue lors de la création de l'utilisateur." }, { status: 500 });
    }

    // 2. Insérer/Mettre à jour le profil dans la table 'profiles' avec le rôle 'EMPLOYEE'
    // La table profiles peut être déjà déclenchée par un trigger Supabase, ou on l'insère/met à jour manuellement.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: full_name,
        role: 'EMPLOYEE'
      });

    if (profileError) {
      console.error("Erreur création profil:", profileError);
      // Même si le profil échoue, l'utilisateur est créé. Il faudrait dans l'idéal gérer une transaction.
      return NextResponse.json({ error: "Compte créé mais erreur lors de la création du profil." }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: { id: authData.user.id, email, full_name, role: 'EMPLOYEE' } });
  } catch (error: any) {
    console.error("Erreur serveur création employé:", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
