import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio Arquitectura - Proyectos de Construcción y Restauración",
  description: "Portafolio profesional de proyectos de arquitectura, construcción y restauración. Descubre nuestros trabajos en construcción residencial, comercial e histórica.",
  keywords: ["arquitectura", "construcción", "restauración", "portfolio", "casas", "proyectos inmobiliarios"],
  authors: [{ name: "Arquitecto" }],
  openGraph: {
    title: "Portfolio Arquitectura",
    description: "Proyectos de construcción y restauración",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
