import ReactQueryProvider from '@/providers/ReactQueryProvider';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import CartDrawer from "@/components/CartDrawer";
import '@/app/globals.css'; 
import { Toaster } from 'react-hot-toast';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import WhatsAppWidget from "@/components/WhatsAppWidget";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Toaster/>
      <ReactQueryProvider>
        <NavbarWrapper/>
        <CartDrawer />
        {children}
        <Footer />
        <WhatsAppWidget />
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
}