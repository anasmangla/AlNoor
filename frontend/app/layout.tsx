import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const icon = `${bp}${bp ? "/" : "/"}alnoorlogo.png`;
  return {
    title: "Al Noor Farm",
    description: "Storefront, Admin, and POS UI",
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
  };
}

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
