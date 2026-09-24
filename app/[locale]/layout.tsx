import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import StoreInit from "@/components/StoreInit";
import MetaPixel from "@/components/MetaPixel";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

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
  description:
    "Get the best pet food, medicine, and apparel at PetoraBD. Premium quality products for your beloved pets in Bangladesh.",
  keywords: [
    "pet food",
    "pet medicine",
    "pet accessories",
    "dogs",
    "cats",
    "PetoraBD",
    "Bangladesh",
  ],
  openGraph: {
    title: "PetoraBD | Your Ultimate Pet Store",
    description:
      "Premium quality pet food, medicine, and accessories in Bangladesh.",
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
  verification: {
    google: "YRusdO91_EzZT7iOJ5gtsMIC1ZgXA4kYwNBx4csTeAI",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let gaId = null;
  let pixelId = null;
  let gtmId = null;
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const res = await fetch(`${apiUrl}/store/settings/`, {
      next: { revalidate: 3600 }, 
    });

    if (res.ok) {
      const data = await res.json();
      const settings = Array.isArray(data)
        ? data[0]
        : data?.results?.[0] || data;

      if (settings) {
        gaId = settings.google_analytics_id;
        pixelId = settings.meta_pixel_id;
        gtmId = settings.gtm_id;
      }
    }
  } catch (error) {
    console.error("Failed to fetch store settings for Tracking IDs:", error);
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased custom-scrollbar`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {pixelId && <MetaPixel pixelId={pixelId} />}
          
          <StoreInit />

          {children}

          {gaId && <GoogleAnalytics gaId={gaId} />}
          {gtmId && <GoogleTagManager gtmId={gtmId} />}
        </ThemeProvider>
      </body>
    </html>
  );
}