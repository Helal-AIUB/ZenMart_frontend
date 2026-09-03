import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreInit from "@/components/StoreInit";

// Font Optimization (Zero Layout Shift)
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Global SEO Metadata
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <StoreInit />
        {children}
      </body>
    </html>
  );
}