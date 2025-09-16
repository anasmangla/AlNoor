import Image from "next/image";
import Link from "next/link";

import { CustomerSpotlight } from "@/components/CustomerSpotlight";
import { SocialFeeds } from "@/components/SocialFeeds";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 text-center md:text-left">
      <section className="flex flex-col items-center gap-6 rounded-3xl bg-slate-50 p-8 text-center shadow-sm md:flex-row md:items-start md:gap-10 md:text-left">
        <div className="flex flex-col items-center gap-6 md:items-start">
          <Image
            src="/alnoorlogo.png"
            alt="Al Noor Farm Icon"
            width={104}
            height={104}
            className="h-auto w-auto"
            priority
          />
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Rooted in Community, Powered by Fresh Harvests
            </h1>
            <p className="mt-3 max-w-xl text-lg text-slate-600">
              Browse seasonal produce, manage inventory, and run our POS—all while staying connected
              to the customers who share their Al Noor Farm moments with us every day.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            <Link className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500" href="/products">
              Visit the Store
            </Link>
            <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900" href="/admin/login">
              Admin Login
            </Link>
            <Link className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900" href="/admin/pos">
              Launch POS
            </Link>
          </div>
        </div>
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Share Your Farm Story</h2>
          <p className="mt-3 text-sm text-slate-600">
            Tag <span className="font-semibold text-slate-800">#AlNoorHarvest</span> on Instagram or Facebook for a chance to be
            featured below. We always reach out for permission before sharing your beautiful photos.
          </p>
          <p className="mt-4 text-xs uppercase tracking-wide text-emerald-600">Community First</p>
        </div>
      </section>

      <CustomerSpotlight />

      <SocialFeeds />
    </main>
  );
}
