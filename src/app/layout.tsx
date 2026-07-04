import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Invoicify — Facturation Nouvelle Génération",
  description: "Plateforme SaaS de facturation, paiements internationaux et supervision financière en temps réel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} h-full antialiased dark`}
    >
      <body className="font-sans min-h-full flex flex-col bg-[#030712] text-slate-100">
        {children}
      </body>
    </html>
  );
}
