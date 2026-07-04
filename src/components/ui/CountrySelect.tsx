import React from 'react';

export const COUNTRIES = [
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', currency: 'XAF' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', currency: 'XOF' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', currency: 'XOF' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸', currency: 'USD' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', currency: 'XAF' },
  { code: 'CD', name: 'RD Congo', flag: '🇨🇩', currency: 'CDF' },
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯', currency: 'XOF' },
];

interface CountrySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function CountrySelect({ className, ...props }: CountrySelectProps) {
  return (
    <div className="relative">
      <select 
        className={`w-full appearance-none bg-slate-800/50 border border-slate-700/50 text-slate-200 py-3 px-4 pr-10 rounded-xl hover:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-sm text-sm font-medium ${className || ''}`}
        {...props}
      >
        <option value="" disabled>Sélectionner le pays du client</option>
        {COUNTRIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name} ({c.currency})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
