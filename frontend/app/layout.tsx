import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Al Noor Farm",
  description: "Storefront, Admin, and POS UI",
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
          <main className="max-w-5xl mx-auto p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
