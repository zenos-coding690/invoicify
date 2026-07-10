import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let data: any = {};
    
    if (contentType.includes('application/json')) {
      data = await req.json();
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      for (const [key, value] of params.entries()) {
        data[key] = value;
      }
    }

    console.log("PayDunya Webhook payload:", data);

    // PayDunya IPN envoie souvent un paramètre "data_hash" qu'il faut vérifier
    const dataHash = data.data_hash || data.hash;
    let invoiceNumber = data.custom_data?.invoice_number || data.invoice?.custom_data?.invoice_number || data.invoice_number;
    let token = data.invoice?.token || data.token;
    let status = data.invoice?.status || data.status;

    // Si on reçoit un data_hash, on doit vérifier la transaction auprès de PayDunya
    if (dataHash) {
      const verifyRes = await fetch(`https://app.paydunya.com/api/v1/checkout-invoice/confirm/${dataHash}`, {
        headers: {
          'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY || '',
          'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY || '',
          'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN || ''
        }
      });
      
      const verifyData = await verifyRes.json();
      console.log("PayDunya Verification Data:", verifyData);

      if (verifyData.response_code === "00") {
        invoiceNumber = verifyData.custom_data?.invoice_number;
        status = verifyData.invoice?.status || verifyData.status;
        token = verifyData.invoice?.token || verifyData.token || dataHash;
      }
    }

    if (!invoiceNumber && !token) {
       return NextResponse.json({ error: "No reference provided" }, { status: 400 });
    }

    if (status === 'completed' || status === 'successful') {
      let query = supabase.from('invoices').update({ status: 'PAID' });
      
      if (invoiceNumber) {
        query = query.eq('invoice_number', invoiceNumber);
      } else if (token) {
        query = query.eq('notchpay_reference', token);
      }

      const { error } = await query;
      
      if (error) {
        console.error("Erreur de mise à jour de la facture (Webhook PayDunya):", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ received: true, message: "Invoice marked as PAID" });
    }

    return NextResponse.json({ received: true, status: status });

  } catch (err: any) {
    console.error("PayDunya Webhook Error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
