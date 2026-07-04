import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Serveur-side supabase client with Service Role to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Attention: ici on devrait utiliser le SERVICE_ROLE_KEY pour écrire depuis le backend,
// mais vu que nous avons RLS qui autorise l'utilisateur courant, 
// on peut aussi passer le token d'auth du client si on le transmet dans la requête.
// Pour simplifier et être sûr de l'enregistrement, on va utiliser la clé publique, 
// MAIS on aura besoin de passer le jeton d'accès ou d'autoriser l'insertion.
// Le plus simple pour un endpoint /api est d'utiliser la service_role key. 
// Vu qu'on n'en a pas, on va renvoyer les données au frontend qui se chargera d'écrire en base avec son client authentifié.

export async function POST(req: Request) {
  try {
    const { amount, currency, email, name, description, invoice_number } = await req.json();

    if (!amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payload = {
      email: email || "customer@invoicify.com",
      currency: currency,
      amount: amount,
      description: description || "Paiement de facture",
      reference: invoice_number,
      customer: {
        name: name || "Client Invoicify",
        email: email || "customer@invoicify.com"
      }
    };

    const notchPayRes = await fetch('https://api.notchpay.co/payments/initialize', {
      method: 'POST',
      headers: {
        'Authorization': process.env.NEXT_PUBLIC_NOTCHPAY_PUBLIC_KEY || '',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await notchPayRes.json();

    if (!notchPayRes.ok) {
      console.error("NotchPay API Error:", data);
      return NextResponse.json({ error: data.message || "Error from NotchPay" }, { status: notchPayRes.status });
    }

    // data.authorization_url contient le lien de paiement
    // data.transaction.reference contient la référence
    return NextResponse.json({
      payment_url: data.authorization_url,
      reference: data.transaction?.reference || invoice_number,
      raw_data: data
    });

  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
