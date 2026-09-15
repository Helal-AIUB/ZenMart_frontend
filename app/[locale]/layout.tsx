import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import StoreInit from "@/components/StoreInit";
import MetaPixel from "@/components/MetaPixel";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PetoraBD | Your Ultimate Pet Store",
    template: "%s | PetoraBD",
  },
  description: "Get the best pet food, medicine, and apparel at PetoraBD. Premium quality products for your beloved pets in Bangladesh.",
  keywords: ["pet food", "pet medicine", "pet accessories", "dogs", "cats", "PetoraBD", "Bangladesh"],
  openGraph: {
    title: "PetoraBD | Your Ultimate Pet Store",
    description: "Premium quality pet food, medicine, and accessories in Bangladesh.",
    url: siteUrl,
    siteName: "PetoraBD",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "PetoraBD Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

// 🟢 Fix: Accept params.locale and pass it to HTML tag
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // Update type to Promise
}) {
  // Await the params to get the locale
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <MetaPixel />
        <StoreInit />
        {children}
      </body>
    </html>
  );
}