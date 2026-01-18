// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { OrderProvider } from "@/context/OrderContext";
import { CopyTradingProvider } from "@/context/CopyTradingContext";
import { PriceProvider } from "@/context/PriceContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "GMGN.AI Clone",
  description: "A clone of GMGN.AI for an interview assignment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <PriceProvider>
          <AuthProvider>
            <OrderProvider>
              <CopyTradingProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                </div>
                <Toaster />
              </CopyTradingProvider>
            </OrderProvider>
          </AuthProvider>
        </PriceProvider>
      </body>
    </html>
  );
}