import ReactQueryProvider from '@/providers/ReactQueryProvider';
import NavbarWrapper from '@/components/NavbarWrapper';
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
          {/* <Navbar /> */}
          <NavbarWrapper/>
          <CartDrawer />
          {children}
          <Footer />
        </ReactQueryProvider>
      </div>
    </>
  );
}