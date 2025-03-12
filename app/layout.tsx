import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ChatProvider } from "@/components/chat/SolanaAgentProvider";
import { Providers } from "./providers";
import { ClientLayout } from "./components/ClientLayout";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: 'Espio',
  description: 'The Token Copilot for Sonic',
  keywords: ['solana', 'hackathon', 'ai', 'Espio'],
  authors: [{ name: 'Espio', url: 'https://www.espio.fun' }],
  openGraph: {
    title: 'Espio',
    description: 'The Token Copilot for Sonic',
    url: 'https://espio.fun',
    siteName: "Espio",
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Espio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Espio',
    description: 'The Token Copilot for Sonic',
    images: ['/og.png'],
  },
  metadataBase: new URL('https://espio.fun'),
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <ChatProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
            <Toaster position="top-center" />
          </ChatProvider>
        </Providers>
      </body>
    </html>
  );
}
