import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "About",
    description: "Learn about Al Noor Farm's mission, halal certifications, and zabihah process.",
};

export default function AboutPage() {
    return (
        <div className="space-y-12">
            <header className="text-center space-y-4">
                <Image
                    src="/alnoorlogo.png"
                    alt="Al Noor Farm Logo"
                    width={96}
                    height={96}
                    className="mx-auto h-auto w-auto"
                    priority
                />
                <h1 className="text-3xl font-semibold">About Al Noor Farm</h1>
                <p className="text-slate-600 max-w-3xl mx-auto">
                    We raise and process poultry with a focus on quality, transparency, and halal
                    integrity. Our team manages every step from caring for the birds to delivering
                    packaged orders so that you can trust what reaches your table.
                </p>
            </header>

            <section className="grid gap-6 md:grid-cols-2 md:items-start">
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Our Story</h2>
                    <p className="text-slate-600">
                        Al Noor Farm began as a small family operation determined to provide zabihah
                        poultry to the Western New York community. Today we harvest to order, maintain
                        transparent pricing, and provide both in-person and online shopping options.
                    </p>
                    <ul className="list-disc list-inside text-slate-600 space-y-2">
                        <li>Dedicated processing room with daily sanitation protocols.</li>
                        <li>Small-batch scheduling to keep every order fresh.</li>
                        <li>Direct pickup, local delivery, and point-of-sale checkout.</li>
                    </ul>
                </div>
                <div className="rounded-lg border border-slate-200 p-6 space-y-4">
                    <h3 className="text-xl font-semibold">Certifications</h3>
                    <p className="text-slate-600">
                        Review our current certificates anytime. We update documents the moment a new
                        inspection or renewal is issued.
                    </p>
                    <div className="flex flex-col gap-3">
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
                    <div className="flex justify-center">
                        <Image
                            src="/certificates/halal-badge.svg"
                            alt="Halal certification badge"
                            width={160}
                            height={160}
                            className="h-40 w-40"
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Zabihah Standards &amp; Process</h2>
                <p className="text-slate-600 max-w-4xl">
                    Every chicken we process follows a documented zabihah workflow that aligns with
                    Islamic guidelines and New York State food safety requirements. The process is led
                    by trained team members who recite the tasmiya and ensure the animal is handled with
                    dignity at each step.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    <article className="rounded-lg border border-slate-200 p-4 text-left space-y-2">
                        <h3 className="text-lg font-semibold">Preparation</h3>
                        <p className="text-slate-600">
                            Birds are inspected the morning of processing, watered to keep them calm, and
                            aligned toward the qibla. Only healthy animals that pass our pre-checks move
                            forward.
                        </p>
                    </article>
                    <article className="rounded-lg border border-slate-200 p-4 text-left space-y-2">
                        <h3 className="text-lg font-semibold">Hand Slaughter</h3>
                        <p className="text-slate-600">
                            A trained Muslim slaughterer recites the name of Allah before each cut, using a
                            sharpened knife to swiftly sever the throat, windpipe, and jugular veins while
                            leaving the spinal cord intact.
                        </p>
                    </article>
                    <article className="rounded-lg border border-slate-200 p-4 text-left space-y-2">
                        <h3 className="text-lg font-semibold">Post-Processing</h3>
                        <p className="text-slate-600">
                            Birds are bled completely, cleaned, and chilled in dedicated equipment. We label
                            batches with timestamps so the chill chain and freshness can be audited.
                        </p>
                    </article>
                    <article className="rounded-lg border border-slate-200 p-4 text-left space-y-2">
                        <h3 className="text-lg font-semibold">Traceability</h3>
                        <p className="text-slate-600">
                            Each order receives a processing log detailing the slaughterer, batch number,
                            and inspection checks. Customers can request a copy when picking up or during
                            delivery.
                        </p>
                    </article>
                </div>
                <p className="text-slate-600">
                    Have questions about our methods or need documentation for a community event? Reach
                    out through our <Link href="/contact" className="text-emerald-700 hover:underline">contact page</Link>
                    and we will respond within one business day.
                </p>
            </section>
        </div>
    );
}
