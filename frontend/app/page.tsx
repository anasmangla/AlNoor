import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <div className="text-center space-y-12">
            <div>
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
                    Browse products, manage inventory, and run POS with hand-slaughtered poultry that
                    meets our halal standards.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link className="text-blue-600 hover:underline" href="/products">
                        Store
                    </Link>
                    <Link className="text-blue-600 hover:underline" href="/admin/login">
                        Admin
                    </Link>
                    <Link className="text-blue-600 hover:underline" href="/admin/pos">
                        POS
                    </Link>
                    <Link className="text-blue-600 hover:underline" href="/about">
                        About
                    </Link>
                </div>
            </div>
            <section className="max-w-3xl mx-auto space-y-4">
                <h2 className="text-2xl font-semibold">Farm Certifications</h2>
                <p className="text-slate-600">
                    We keep our certification documents public so you can review the halal and animal
                    welfare credentials behind every order.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        className="rounded-md border border-emerald-600 px-4 py-2 text-emerald-700 hover:bg-emerald-50"
                        href="/certificates/halal-certificate.pdf"
                        target="_blank"
                        rel="noopener"
                    >
                        Download Halal Certificate (PDF)
                    </a>
                    <a
                        className="rounded-md border border-emerald-600 px-4 py-2 text-emerald-700 hover:bg-emerald-50"
                        href="/certificates/halal-badge.svg"
                        target="_blank"
                        rel="noopener"
                    >
                        View Processing Badge (Image)
                    </a>
                </div>
                <p className="text-slate-600">
                    Curious about how we honor traditional zabihah practices? Visit our About page for
                    a detailed walkthrough of our hand-slaughter process and animal welfare standards.
                </p>
            </section>
        </div>
    );
}
