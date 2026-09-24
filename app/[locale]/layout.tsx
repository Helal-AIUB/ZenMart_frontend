import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import StoreInit from "@/components/StoreInit";
import MetaPixel from "@/components/MetaPixel";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import Navbar from "@/components/Navbar"; 
import ReactQueryProvider from "@/providers/ReactQueryProvider"; 
// 🟢 next-intl ইম্পোর্ট করা হলো
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

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

  // 🟢 গ্লোবাল ট্রান্সলেশন মেসেজ ফেচ করা হলো
  const messages = await getMessages();

  let gaId = null;
  let pixelId = null;
  let gtmId = null;
  let initialSettings = {};
  let initialCategories = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    
    const [settingsRes, categoriesRes] = await Promise.all([
      fetch(`${apiUrl}/store/settings/`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/store/collections/`, { next: { revalidate: 3600 } })
    ]);

    if (settingsRes.ok) {
      const data = await settingsRes.json();
      initialSettings = Array.isArray(data) ? data[0] : data?.results?.[0] || data;

      if (initialSettings) {
        gaId = (initialSettings as any).google_analytics_id;
        pixelId = (initialSettings as any).meta_pixel_id;
        gtmId = (initialSettings as any).gtm_id;
      }
    }

    if (categoriesRes.ok) {
      const catData = await categoriesRes.json();
      initialCategories = Array.isArray(catData) ? catData : catData?.results || [];
    }
  } catch (error) {
    console.error("Failed to fetch global layout data:", error);
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased custom-scrollbar`}>
        <ReactQueryProvider>
          {/* 🟢 NextIntlClientProvider দিয়ে পুরো অ্যাপ র‍্যাপ করা হলো */}
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {pixelId && <MetaPixel pixelId={pixelId} />}
              
              <StoreInit />

              <Navbar initialCategories={initialCategories} initialSettings={initialSettings} />

              {children}

              {gaId && <GoogleAnalytics gaId={gaId} />}
              {gtmId && <GoogleTagManager gtmId={gtmId} />}
            </ThemeProvider>
          </NextIntlClientProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}