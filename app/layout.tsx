import "./globals.css";
import StoreInit from "@/components/StoreInit";
export const metadata = {
  title: "Petora BD",
  description: "Premium pet e-commerce platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body>
        <StoreInit />
        {children}
      </body>
    </html>
  );
}
