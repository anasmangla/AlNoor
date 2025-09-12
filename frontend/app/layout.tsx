import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Al Noor Farm",
  description: "Storefront, Admin, and POS UI",
  icons: {
    icon: "/alnoorlogo.png",
    shortcut: "/alnoorlogo.png",
    apple: "/alnoorlogo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-slate-800">
        <Providers>
          <Navbar />
          <main className="max-w-5xl mx-auto p-6">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
