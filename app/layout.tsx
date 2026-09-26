import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/src/lib/utils";
import { SITE_URL, SITE_NAME } from "@/src/lib/site";
import { PUBLICATION } from "@/src/entities/publication/infrastructure/publication.composition";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-roboto",
});


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: PUBLICATION.bio,
  openGraph: {
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: PUBLICATION.bio,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: PUBLICATION.bio,
  },
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
        roboto.variable,
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