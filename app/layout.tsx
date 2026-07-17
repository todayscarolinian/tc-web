import type { Metadata } from "next";
import { Open_Sans, Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PUBLICATION } from "@/lib/publication";

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
