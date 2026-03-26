import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Avera — Project Command Center",
  description:
    "Project management tool for Avera resort properties across Karnataka",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
