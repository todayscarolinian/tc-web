import type { Metadata } from "next";
import { Open_Sans, Inter, Rajdhani } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/src/lib/utils";
import { PUBLICATION } from "@/src/entities/publication/infrastructure/publication.composition";
import { Toaster } from "@/components/ui/sonner";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-ui" });
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-utility",
});

export const metadata: Metadata = {
  title: "Today's Carolinian",
  description: PUBLICATION.bio,
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        openSans.variable,
        inter.variable,
        rajdhani.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">
        {children} <Toaster richColors />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}