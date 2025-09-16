import Link from "next/link";
import Image from "next/image";

import FeedbackForm from "@/components/feedback/FeedbackForm";

export default function Home() {
  return (
    <div className="grid gap-12">
      <section className="text-center">
        <Image
          src="/alnoorlogo.png"
          alt="Al Noor Farm Icon"
          width={96}
          height={96}
          className="mx-auto mb-6 h-auto w-auto"
          priority
        />
        <h1 className="text-3xl font-semibold mb-2">Al Noor Farm</h1>
        <p className="text-slate-600 mb-6">
          Browse products, manage inventory, and run POS.
        </p>
        <div className="flex gap-4 justify-center">
          <Link className="text-blue-600 hover:underline" href="/products">
            Store
          </Link>
          <Link className="text-blue-600 hover:underline" href="/admin/login">
            Admin
          </Link>
          <Link className="text-blue-600 hover:underline" href="/admin/pos">
            POS
          </Link>
        </div>
      </section>

      <section className="border rounded p-6 max-w-3xl mx-auto w-full text-left">
        <h2 className="text-xl font-semibold mb-2">Tell us about your visit</h2>
        <p className="text-slate-600 mb-4">
          Share a quick first impression so we can keep improving the store. We
          review feedback alongside analytics every quarter and adjust our
          priorities based on what matters most to visitors.
        </p>
        <FeedbackForm />
      </section>
    </div>
  );
}
