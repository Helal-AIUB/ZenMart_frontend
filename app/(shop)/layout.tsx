import ReactQueryProvider from '@/providers/ReactQueryProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from "@/components/CartDrawer";
import '../globals.css';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div>
        <Toaster/>
        <ReactQueryProvider>
          <Navbar />
          <CartDrawer />
          {children}
          <Footer />
        </ReactQueryProvider>
      </div>
    </>
  );
}