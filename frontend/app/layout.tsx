import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const icon = `${bp}${bp ? "/" : "/"}alnoorlogo.png`;
  return {
    title: {
      default: "Al Noor Farm",
      template: "%s | Al Noor Farm",
    },
    description: "Storefront, Admin, and POS UI",
    metadataBase: new URL(site),
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
    openGraph: {
      type: "website",
      url: site,
      title: "Al Noor Farm",
      description: "Storefront, Admin, and POS UI",
      images: [{ url: icon }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Al Noor Farm",
      description: "Storefront, Admin, and POS UI",
      images: [icon],
    },
    manifest: `${bp || "/"}manifest.webmanifest`,
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
