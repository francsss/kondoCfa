import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kondo | Transfert Cameroun Chine",
  description:
    "Kondo est une plateforme web de démonstration pour les transferts FCFA vers CNY entre le Cameroun et la Chine."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
