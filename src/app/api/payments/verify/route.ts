import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    // Appel à PayDunya pour vérifier le statut
    const verifyRes = await fetch(`https://app.paydunya.com/api/v1/checkout-invoice/confirm/${token}`, {
      headers: {
        'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY || '',
        'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY || '',
        'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN || ''
      }
    });
    
    const verifyData = await verifyRes.json();

    if (verifyData.response_code !== "00") {
      return NextResponse.json({ error: "Transaction introuvable chez PayDunya" }, { status: 404 });
    }

    const status = verifyData.invoice?.status || verifyData.status;

    if (status === 'completed' || status === 'successful') {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'PAID' })
        .eq('notchpay_reference', token);
      
      if (error) throw error;
      
      return NextResponse.json({ success: true, status: 'PAID' });
    }

    return NextResponse.json({ success: true, status: 'PENDING', message: "Le paiement n'est pas encore finalisé." });

  } catch (err: any) {
    console.error("Erreur vérification manuelle:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
