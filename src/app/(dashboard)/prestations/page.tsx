"use client";

import React, { useState } from 'react';
import { CountrySelect, COUNTRIES } from '@/components/ui/CountrySelect';
import { GenerateButton } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ToastNotification } from '@/components/ui/ToastNotification';
import { Receipt, Search, Plus, Trash2, Globe, FileSpreadsheet, ArrowUpRight } from 'lucide-react';

interface DraftItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

const INITIAL_INVOICES = [
  { id: 'INV-2026-003', itemCount: 2, country: 'CM', status: 'PENDING' as const, amount: 1500000, currency: 'XAF', date: '2026-07-01' },
  { id: 'INV-2026-002', itemCount: 1, country: 'FR', status: 'PAID' as const, amount: 850, currency: 'EUR', date: '2026-06-28' },
  { id: 'INV-2026-001', itemCount: 3, country: 'US', status: 'PAID' as const, amount: 1200, currency: 'USD', date: '2026-06-15' },
];

export default function PrestationsPage() {
  const [showToast, setShowToast] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState('');
  
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  
  // Brouillon (Facture en cours)
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [country, setCountry] = useState('');

  // Champs d'ajout rapide
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  const draftTotal = draftItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const selectedCurrency = COUNTRIES.find(c => c.code === country)?.currency || 'XAF';

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

  const handleGenerate = () => {
    if (draftItems.length === 0) return alert("Ajoutez au moins une prestation à la facture.");
    if (!country) return alert("Veuillez sélectionner le pays du client.");
    
    const countryData = COUNTRIES.find(c => c.code === country);
    const invoiceNumber = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    
    const newInvoice = {
      id: invoiceNumber,
      itemCount: draftItems.length,
      country,
      status: 'PENDING' as const,
      amount: draftTotal,
      currency: countryData?.currency || 'XAF',
      date: new Date().toISOString().split('T')[0]
    };
    
    setInvoices([newInvoice, ...invoices]);
    setDraftItems([]);
    setCountry('');

    // Simulation Temps Réel
    setTimeout(() => {
      setInvoices(prev => prev.map(inv => inv.id === newInvoice.id ? { ...inv, status: 'PAID' } : inv));
      setLastInvoiceId(newInvoice.id);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 8000);
    }, 4000);
  };

  const getCountryFlag = (code: string) => COUNTRIES.find(c => c.code === code)?.flag || '';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      {/* Decorative ambient light leak */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-100/30 rounded-full filter blur-3xl opacity-40 pointer-events-none z-0"></div>

      {showToast && (
        <ToastNotification 
          title="Paiement reçu !" 
          message="La facture a été payée avec succès." 
          invoiceId={lastInvoiceId}
          onClose={() => setShowToast(false)} 
        />
      )}

      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Prestations & Paiements</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Saisissez vos travaux, générez les factures et collectez via NotchPay.</p>
      </div>

      {/* Constructeur de Facture (Stripe/Apple Style Card) */}
      <div className="bg-white rounded-2xl p-6 shadow-premium border border-slate-200/50 relative z-10 overflow-hidden">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-[#1062FE]" /> Éditeur de Facture
        </h2>
        
        {/* Formulaire d'ajout de ligne */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description de la prestation</label>
            <input 
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Création API Node.js" 
              className="w-full bg-white border border-slate-200/60 text-slate-900 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1062FE]/25 focus:border-[#1062FE] transition-all text-sm font-medium"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Prix unitaire</label>
            <input 
              type="number" value={price} onChange={e => setPrice(e.target.value)}
              placeholder="0" 
              className="w-full bg-white border border-slate-200/60 text-slate-900 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1062FE]/25 focus:border-[#1062FE] transition-all text-sm font-medium"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Quantité</label>
            <input 
              type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1"
              className="w-full bg-white border border-slate-200/60 text-slate-900 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1062FE]/25 focus:border-[#1062FE] transition-all text-sm font-medium"
            />
          </div>
          <div className="md:col-span-2">
            <button 
              onClick={handleAddItem}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-all duration-300 text-sm font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>

        {/* Lignes du brouillon */}
        {draftItems.length > 0 ? (
          <div className="mb-6 border border-slate-100 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold text-right">Prix Unitaire</th>
                  <th className="py-3 px-4 font-semibold text-center w-24">Quantité</th>
                  <th className="py-3 px-4 font-semibold text-right">Total</th>
                  <th className="py-3 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {draftItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">{item.title}</td>
                    <td className="py-4 px-4 text-right font-medium text-slate-500">
                      {new Intl.NumberFormat('fr-FR').format(item.price)}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-600 bg-slate-50/30">{item.quantity}</td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">
                      {new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleRemoveItem(item.id)} 
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
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
          <div className="py-10 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 mb-6 text-sm font-medium">
            Aucun élément ajouté pour l'instant. Utilisez le formulaire ci-dessus pour composer votre facture.
          </div>
        )}

        {/* Finalisation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6 border-t border-slate-100">
          <div className="w-full md:w-1/3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Pays du client
            </label>
            <CountrySelect value={country} onChange={e => setCountry(e.target.value)} />
          </div>
          
          <div className="flex items-center gap-8 w-full md:w-auto">
            <div className="text-right flex-1 md:flex-none">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Montant global</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: selectedCurrency }).format(draftTotal)}
              </p>
            </div>
            <GenerateButton onClick={handleGenerate} />
          </div>
        </div>
      </div>

      {/* Tableau d'Historique des Factures (Dribbble Style List) */}
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50/70 border border-blue-100/50 text-[#1062FE] rounded-lg">
              <Receipt className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Historique des factures</h2>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" placeholder="Rechercher..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1062FE]/25 focus:border-[#1062FE] shadow-xs" 
            />
          </div>
        </div>

        <div className="space-y-3">
          {invoices.map((inv) => (
            <div 
              key={inv.id} 
              className="bg-white rounded-xl p-5 shadow-premium border border-slate-100 hover:border-slate-200/80 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-xs text-slate-500 border border-slate-100 group-hover:bg-[#1062FE]/5 group-hover:text-[#1062FE] group-hover:border-[#1062FE]/10 transition-colors">
                  {inv.id.split('-').pop()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {inv.id}
                    <span className="text-[11px] font-normal text-slate-400">• {inv.date}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                    <span>{getCountryFlag(inv.country)}</span>
                    <span className="text-slate-700">{inv.country}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-400">{inv.itemCount} prestation(s)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <StatusBadge status={inv.status} />
                <div className="text-right">
                  <span className="font-bold text-slate-900 whitespace-nowrap text-sm">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: inv.currency }).format(inv.amount)}
                  </span>
                </div>
                <button className="hidden md:flex p-1.5 text-slate-400 hover:text-[#1062FE] hover:bg-slate-50 rounded-lg transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {invoices.length === 0 && (
            <div className="bg-white rounded-xl py-12 border border-slate-100 text-center text-slate-400 text-sm font-medium">
              Aucune facture enregistrée pour le moment.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
