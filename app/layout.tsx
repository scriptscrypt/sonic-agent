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
  title: "Espio",
  description: "Espio",
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
