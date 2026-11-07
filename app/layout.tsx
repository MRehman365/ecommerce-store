import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import { CartProvider } from "@/context/cart-context";
import "./globals.css";

const swissHost = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-swiss-host",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Clay Market",
    template: "%s · Clay Market",
  },
  description:
    "Shopify-style single-page store with image-based product styles and guest checkout.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${swissHost.variable} h-full antialiased`}>
      <body className={`${swissHost.className} min-h-full flex flex-col`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
