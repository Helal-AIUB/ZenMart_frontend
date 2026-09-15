import ReactQueryProvider from "@/providers/ReactQueryProvider";
import NavbarWrapper from "@/components/NavbarWrapper";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import "@/app/globals.css";
import { Toaster } from "react-hot-toast";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import WhatsAppWidget from "@/components/WhatsAppWidget";

async function getStoreSettings() {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const res = await fetch(`${apiUrl}/store/settings/`, {
      // next: { revalidate: 60 }
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data[0] : data?.results?.[0] || data || {};
    }
  } catch (error) {
    console.error("Failed to fetch store settings:", error);
  }
  return {};
}

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const settings = await getStoreSettings();

  return (
    <NextIntlClientProvider messages={messages}>
      <Toaster />
      <ReactQueryProvider>
        <NavbarWrapper />
        <CartDrawer />
        {children}
        <Footer />
        <WhatsAppWidget whatsappNumber={settings?.whatsapp_number} />
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
}
