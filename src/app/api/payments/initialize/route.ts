import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, currency, email, name, description, invoice_number } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // L'URL absolue de notre site pour que PayDunya puisse nous rediriger ou nous envoyer le statut
    // En développement, on prend le host depuis les headers (localhost:3000)
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const payload = {
      invoice: {
        total_amount: amount,
        description: description || "Paiement de facture"
      },
      store: {
        name: "Invoicify",
        website_url: baseUrl
      },
      custom_data: {
        invoice_number: invoice_number
      },
      actions: {
        cancel_url: `${baseUrl}/prestations`,
        return_url: `${baseUrl}/prestations?status=success`,
        callback_url: `${baseUrl}/api/webhooks/paydunya`
      }
    };

    const paydunyaRes = await fetch('https://app.paydunya.com/api/v1/checkout-invoice/create', {
      method: 'POST',
      headers: {
        'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY || '',
        'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY || '',
        'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN || '',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await paydunyaRes.json();

    if (data.response_code !== "00") {
      console.error("PayDunya API Error:", data);
      return NextResponse.json({ error: data.response_text || "Erreur PayDunya" }, { status: 400 });
    }

    // PayDunya renvoie l'URL de la page de paiement dans data.response_text
    // et un token (qui identifie la transaction).
    return NextResponse.json({
      payment_url: data.response_text,
      reference: data.token,
      raw_data: data
    });

  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
