import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "LUXE Editorial Boutique | Luxury E-Commerce",
  description: "An exclusive online shopping experience curated with algorithmic elegance and high-fashion aesthetics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main style={{ minHeight: "calc(100vh - 80px - 400px)", display: "flex", flexDirection: "column" }}>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
