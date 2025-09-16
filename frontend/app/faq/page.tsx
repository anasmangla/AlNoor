import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Halal FAQ & Customer Support",
    description:
        "Answers about halal meat sourcing, Niagara farm pickups, and ordering from Al Noor Farm in Ransomville, New York.",
};

type FAQ = {
    question: string;
    answer: ReactNode;
};

const faqs: FAQ[] = [
    {
        question: "Where does Al Noor Farm source its halal meat?",
        answer: (
            <>
                <p>
                    Every goat, lamb, and chicken is raised on our Ransomville pastures or sourced from partner farms within 50
                    miles that follow the same zabihah standards. Animals are processed on-site under the supervision of our
                    halal compliance team so Buffalo, Lewiston, and Niagara Falls families know exactly where their meat comes
                    from.
                </p>
            </>
        ),
    },
    {
        question: "What makes your process zabihah halal?",
        answer: (
            <>
                <p>
                    We recite the Tasmiya for each animal, use dedicated blades that are sharpened between uses, and ensure
                    animals face the qibla during processing. The workflow is documented in a compliance log reviewed by our
                    halal advisory council. You can observe the process during open barn hours or schedule a private walkthrough.
                </p>
            </>
        ),
    },
    {
        question: "Do you offer delivery or pickup options in Niagara County?",
        answer: (
            <>
                <p>
                    Yes. Most families pick up orders directly from the farm in Ransomville, but we also coordinate meetups in
                    Niagara Falls, Lewiston, and North Tonawanda on Thursdays. Limited home delivery is available within Buffalo
                    city limits for bulk orders—contact us a week in advance so we can plan refrigerated transport.
                </p>
            </>
        ),
    },
    {
        question: "How do I reserve a goat for Eid al-Adha or aqiqah?",
        answer: (
            <>
                <p>
                    Submit the contact form with your preferred date, weight range, and pickup location. We require a 30% deposit
                    to hold the animal. Confirmation emails include preparation notes, zabihah certification details, and tips on
                    storing your halal meat after pickup.
                </p>
            </>
        ),
    },
    {
        question: "Can I request custom butchering or portion sizes?",
        answer: (
            <>
                <p>
                    Absolutely. Our team can quarter or eighth a goat, grind beef or lamb for kofta, and package chicken pieces to
                    match your recipe plans. Let us know if you need freezer-ready vacuum sealing or if you plan to cook
                    immediately for a community event in Buffalo or Niagara Falls.
                </p>
            </>
        ),
    },
    {
        question: "What seasonal products are available right now?",
        answer: (
            <>
                <p>
                    Availability shifts with the farming calendar. Spring features goat kids and pasture-raised chickens, summer
                    brings lamb sausages and yogurt parfaits, and fall focuses on hearty beef and root-vegetable boxes. Check the
                    <Link className="text-emerald-700 underline" href="/blog">
                        {" "}farm news blog
                    </Link>
                    for monthly availability or call 716-524-1717 for the latest inventory.
                </p>
            </>
        ),
    },
    {
        question: "Do you provide tours or educational visits?",
        answer: (
            <>
                <p>
                    Yes. We host guided tours on the last Sunday of each month and can accommodate school groups, mosque youth
                    programs, and culinary classes. Tours include a halal process overview, time with the animals, and a Q&A with
                    our farmers. Advance registration is recommended during peak summer weekends.
                </p>
            </>
        ),
    },
];

export default function FAQPage() {
    return (
        <div className="space-y-16">
            <header className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Customer Support</p>
                <h1 className="text-4xl font-bold text-slate-900">Halal FAQ for Niagara County families</h1>
                <p className="max-w-3xl text-lg text-slate-700">
                    Find quick answers about zabihah practices, local pickups, and special orders from Al Noor Farm. If you do not
                    see your question, reach out and our team will respond within one business day.
                </p>
            </header>
            <div className="space-y-6">
                {faqs.map((faq) => (
                    <article key={faq.question} className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
                        <h2 className="text-2xl font-semibold text-slate-900">{faq.question}</h2>
                        <div className="mt-3 space-y-3 text-base leading-relaxed text-slate-700">{faq.answer}</div>
                    </article>
                ))}
            </div>
            <section className="rounded-3xl bg-emerald-600 p-10 text-white">
                <h2 className="text-2xl font-semibold">Need personalized support?</h2>
                <p className="mt-3 max-w-3xl text-emerald-50">
                    Call 716-524-1717 or send us a message with details about your halal order, delivery request, or farm tour. We
                    will tailor a plan that fits your family or community event.
                </p>
                <Link
                    href="/contact"
                    className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                    Contact Al Noor Farm
                </Link>
            </section>
        </div>
    );
}
