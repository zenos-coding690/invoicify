"use client";

import React, { useState, useEffect } from 'react';
import { CountrySelect, COUNTRIES } from '@/components/ui/CountrySelect';
import { GenerateButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ToastNotification } from '@/components/ui/ToastNotification';
import { createClient } from '@/lib/supabase/client';
import { Receipt, Search, Plus, Trash2, Globe, FileSpreadsheet, ArrowUpRight, ExternalLink, Layers, Wallet, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DraftItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  country: string;
  itemCount: number;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';
  amount: number;
  currency: string;
  payment_link?: string;
}

export default function PrestationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState('');
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [country, setCountry] = useState('');

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  const draftTotal = draftItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const selectedCurrency = COUNTRIES.find(c => c.code === country)?.currency || 'XAF';

  // KPI Employé
  const totalGenerated = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalEarned = invoices.filter(inv => inv.status === 'PAID').reduce((acc, inv) => acc + inv.amount, 0);
  const successRate = invoices.length > 0 ? Math.round((invoices.filter(inv => inv.status === 'PAID').length / invoices.length) * 100) : 0;

  useEffect(() => {
    async function initAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      await loadInvoices(user.id);
      
      const channel = supabase
        .channel('invoices_status_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'invoices',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: any) => {
            const updatedInvoice = payload.new;
            if (updatedInvoice.status === 'PAID') {
              setLastInvoiceId(updatedInvoice.invoice_number);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 8000);
              loadInvoices(user.id);
            } else {
              loadInvoices(user.id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    initAuth();
  }, [router]);

  async function loadInvoices(uid: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(id)')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedInvoices: Invoice[] = data.map((inv: any) => ({
          id: inv.invoice_number,
          invoice_number: inv.invoice_number,
          itemCount: inv.invoice_items ? inv.invoice_items.length : 0,
          country: inv.country_code,
          status: inv.status,
          amount: Number(inv.total_amount),
          currency: inv.currency,
          date: new Date(inv.created_at).toISOString().split('T')[0],
          payment_link: inv.payment_link
        }));
        setInvoices(formattedInvoices);
      }
    } catch (err) {
      console.error("Error loading invoices:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddItem = () => {
    if (!title || !price) return;
    setDraftItems([...draftItems, {
      id: Math.random().toString(36).substr(2, 9),
      title,
      price: Number(price),
      quantity: Number(quantity)
    }]);
    setTitle('');
    setPrice('');
    setQuantity('1');
  };

  const handleRemoveItem = (id: string) => {
    setDraftItems(draftItems.filter(i => i.id !== id));
  };

  const handleGenerate = async () => {
    if (draftItems.length === 0) return alert("Ajoutez au moins une prestation à la facture.");
    if (!country) return alert("Veuillez sélectionner le pays du client.");
    if (!userId) return;
    
    try {
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const invoiceNumber = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}-${randomSuffix}`;
      
      const initResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: draftTotal,
          currency: selectedCurrency,
          invoice_number: invoiceNumber,
          description: `Facture ${invoiceNumber} - ${draftItems.length} prestation(s)`
        })
      });

      const paymentData = await initResponse.json();

      if (!initResponse.ok) {
        throw new Error(paymentData.error || "Erreur lors de l'initialisation du paiement");
      }

      const paymentUrl = paymentData.payment_url;
      const notchpayRef = paymentData.reference;

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          user_id: userId,
          invoice_number: invoiceNumber,
          status: 'PENDING',
          total_amount: draftTotal,
          currency: selectedCurrency,
          country_code: country,
          payment_link: paymentUrl,
          notchpay_reference: notchpayRef
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      if (invoiceData) {
        const itemsToInsert = draftItems.map(item => ({
          invoice_id: invoiceData.id,
          title: item.title,
          unit_price: item.price,
          quantity: item.quantity
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        // Log the creation
        await supabase.from('activity_logs').insert({
          user_id: userId,
          action_type: 'CREATE_INVOICE',
          details: `A généré la facture ${invoiceData.invoice_number} de ${new Intl.NumberFormat('fr-FR').format(draftTotal)} ${selectedCurrency}`
        });
      }

      setDraftItems([]);
      setCountry('');
      await loadInvoices(userId);
      
    } catch (err: any) {
      alert("Erreur lors de la création de la facture : " + err.message);
    }
  };

  const getCountryFlag = (code: string) => COUNTRIES.find(c => c.code === code)?.flag || '';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      {showToast && (
        <ToastNotification 
          title="Paiement reçu !" 
          message="La facture a été payée avec succès." 
          invoiceId={lastInvoiceId}
          onClose={() => setShowToast(false)} 
        />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 border border-indigo-500/20">
              <Layers className="w-6 h-6 text-indigo-400" />
            </div>
            Facturation
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Composez vos factures multi-lignes et encaissez via NotchPay.</p>
        </div>
      </div>

      {/* Employe KPI Bilan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 mb-8">
        <div className="glass-light rounded-xl p-5 border border-indigo-500/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1">Total Généré</p>
            <p className="text-xl font-bold text-white">{new Intl.NumberFormat('fr-FR').format(totalGenerated)} <span className="text-xs text-slate-400">XAF</span></p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-light rounded-xl p-5 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1">Total Encaissé</p>
            <p className="text-xl font-bold text-white">{new Intl.NumberFormat('fr-FR').format(totalEarned)} <span className="text-xs text-slate-400">XAF</span></p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-light rounded-xl p-5 border border-cyan-500/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1">Taux de Succès</p>
            <p className="text-xl font-bold text-white">{successRate}%</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Invoice Builder Card */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        {/* Card internal glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/[0.04] rounded-full filter blur-[60px] pointer-events-none"></div>
        
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2.5 relative z-10">
          <FileSpreadsheet className="w-5 h-5 text-indigo-400" /> Éditeur de Facture
        </h2>
        
        {/* Add Item Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6 bg-slate-800/30 p-5 rounded-xl border border-slate-700/30 relative z-10">
          <div className="md:col-span-5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">Prestation</label>
            <input 
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Développement API Node.js" 
              className="w-full bg-slate-800/60 border border-slate-700/50 text-white py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/40 transition-all text-sm font-medium placeholder:text-slate-600"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">Prix unitaire</label>
            <input 
              type="number" value={price} onChange={e => setPrice(e.target.value)}
              placeholder="0" 
              className="w-full bg-slate-800/60 border border-slate-700/50 text-white py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/40 transition-all text-sm font-medium placeholder:text-slate-600"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">Quantité</label>
            <input 
              type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1"
              className="w-full bg-slate-800/60 border border-slate-700/50 text-white py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/40 transition-all text-sm font-medium placeholder:text-slate-600"
            />
          </div>
          <div className="md:col-span-2">
            <button 
              onClick={handleAddItem}
              className="w-full flex items-center justify-center gap-2 bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 py-2.5 px-4 rounded-xl hover:bg-indigo-500/25 hover:border-indigo-500/40 transition-all duration-300 text-sm font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>

        {/* Draft Items Table */}
        {draftItems.length > 0 ? (
          <div className="mb-6 border border-slate-700/30 rounded-xl overflow-hidden relative z-10">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/40 text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em]">
                <tr>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Prix</th>
                  <th className="py-3.5 px-4 text-center w-24">Qté</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {draftItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4 font-bold text-white">{item.title}</td>
                    <td className="py-4 px-4 text-right font-medium text-slate-400 whitespace-nowrap">
                      {new Intl.NumberFormat('fr-FR').format(item.price)}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-300">{item.quantity}</td>
                    <td className="py-4 px-4 text-right font-bold text-white whitespace-nowrap">
                      {new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleRemoveItem(item.id)} 
                        className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 border border-dashed border-slate-700/40 rounded-xl text-center text-slate-600 mb-6 text-sm font-medium relative z-10">
            Ajoutez des prestations avec le formulaire ci-dessus pour composer votre facture.
          </div>
        )}

        {/* Footer: Country + Total + Generate */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6 border-t border-slate-700/30 relative z-10">
          <div className="w-full md:w-1/3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Pays du client
            </label>
            <CountrySelect value={country} onChange={e => setCountry(e.target.value)} />
          </div>
          
          <div className="flex items-center gap-8 w-full md:w-auto">
            <div className="text-right flex-1 md:flex-none">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">Montant total</p>
              <p className="text-3xl font-extrabold text-white mt-1 tracking-tight whitespace-nowrap">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: selectedCurrency }).format(draftTotal)}
              </p>
            </div>
            <GenerateButton onClick={handleGenerate} />
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Receipt className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-lg font-bold text-white">Historique</h2>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" placeholder="Rechercher..." 
              className="pl-9 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/30 text-sm text-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 placeholder:text-slate-600" 
            />
          </div>
        </div>

        <div className="space-y-3">
          {!loading ? (
            invoices.map((inv) => (
              <div 
                key={inv.id} 
                className="glass-light rounded-xl p-5 hover:border-indigo-500/20 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all">
                    {inv.id.split('-').pop()?.substring(0, 4)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      {inv.id}
                      <span className="text-[11px] font-normal text-slate-500">• {inv.date}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                      <span>{getCountryFlag(inv.country)}</span>
                      <span className="text-slate-400">{inv.country}</span>
                      <span className="text-slate-700">|</span>
                      <span className="text-slate-500">{inv.itemCount} prestation(s)</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5">
                  <StatusBadge status={inv.status} />
                  <div className="text-right flex flex-col gap-1.5 items-end">
                    <span className="font-bold text-white whitespace-nowrap text-sm">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: inv.currency }).format(inv.amount)}
                    </span>
                    {inv.payment_link && inv.status === 'PENDING' && (
                      <a href={inv.payment_link} target="_blank" rel="noopener noreferrer" className="text-[10px] inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-400 px-2.5 py-1 rounded-lg font-semibold hover:bg-indigo-500/25 transition-colors border border-indigo-500/20">
                        <ExternalLink className="w-3 h-3" /> Lien de paiement
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-3">
              <div className="h-20 glass-light rounded-xl animate-pulse"></div>
              <div className="h-20 glass-light rounded-xl animate-pulse"></div>
            </div>
          )}

          {!loading && invoices.length === 0 && (
            <div className="glass-light rounded-xl py-14 text-center text-slate-500 text-sm font-medium">
              Aucune facture enregistrée pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
