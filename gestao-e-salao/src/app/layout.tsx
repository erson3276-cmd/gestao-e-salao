import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import { FacebookPixel } from "./components/FacebookPixel";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#5E41FF',
}

export const metadata: Metadata = {
  title: "Gestão E Salão - Sistema para Salões de Beleza",
  description: "O sistema completo para gerenciar seu salão de beleza. Agendamentos, WhatsApp, financeiro e muito mais.",
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'Gestão E Salão',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <GoogleAnalytics />
        <FacebookPixel />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}