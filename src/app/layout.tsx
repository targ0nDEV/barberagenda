import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agende sua consulta",
  description: "Agenda online simples para profissionais e clientes."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
