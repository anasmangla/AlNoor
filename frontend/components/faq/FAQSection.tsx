const faqItems = [
    {
        category: "Ordering",
        question: "How do I place an order for meat or animals?",
        answer: [
            "Order through our online store whenever it suits you.",
            "For whole animals call or WhatsApp 716-524-1717 so we can help with selection.",
        ],
    },
    {
        category: "Ordering",
        question: "Can I reserve a specific animal or request custom processing?",
        answer: [
            "Yes. Call or WhatsApp us after your request so we can match the right animal.",
            "We will review timing, weights, and cutting notes before we finalize your order.",
        ],
    },
    {
        category: "Delivery & Pickup",
        question: "How does pickup or delivery work?",
        answer: [
            "Most customers pick up from the farm at 4028 Dickersonville Rd in Ransomville.",
            "We set a pickup window once the order is ready and help load your cooler.",
            "Need local delivery? Share the address so we can confirm availability and any fee.",
        ],
    },
    {
        category: "Delivery & Pickup",
        question: "What should I bring on pickup day?",
        answer: [
            "Bring a cooler or clean containers to keep your meat cold on the drive home.",
            "For large orders arrive a few minutes early so our staff can be ready to help.",
        ],
    },
    {
        category: "Halal Process",
        question: "How is the halal slaughter carried out?",
        answer: [
            "Our Muslim team performs each harvest by hand following dhabihah guidelines.",
            "We recite the tasmiya, ensure a full bleed-out, and reserve tools solely for halal.",
        ],
    },
    {
        category: "Halal Process",
        question: "Can I observe the halal process or request specific duas?",
        answer: [
            "Yes. Tell us while scheduling if you want to observe so we can set a safe spot.",
            "You may request specific duas or instructions, and we will honor them when possible.",
        ],
    },
] as const;

type FAQItem = (typeof faqItems)[number];

function renderAnswer(answer: FAQItem["answer"]) {
    return answer.map((paragraph, index) => (
        <p key={index} className="text-sm leading-relaxed text-slate-700">
            {paragraph}
        </p>
    ));
}

export default function FAQSection() {
    return (
        <section
            aria-labelledby="faq-heading"
            className="border border-slate-200 rounded-lg bg-white p-6 shadow-sm"
        >
            <div className="mb-4">
                <h2 id="faq-heading" className="text-xl font-semibold text-slate-900">
                    Frequently Asked Questions
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                    Answers to the topics customers ask about most before calling or visiting
                    the farm.
                </p>
            </div>
            <div className="grid gap-3">
                {faqItems.map((item) => (
                    <details
                        key={item.question}
                        className="group rounded border border-slate-200 bg-slate-50"
                    >
                        <summary
                            className={[
                                "flex cursor-pointer items-start justify-between gap-3 px-4 py-3",
                                "text-left text-slate-900",
                                "[&::-webkit-details-marker]:hidden",
                            ].join(" ")}
                        >
                            <div>
                                <span
                                    className={[
                                        "text-xs font-semibold uppercase",
                                        "tracking-wide text-slate-500",
                                    ].join(" ")}
                                >
                                    {item.category}
                                </span>
                                <span className="mt-1 block font-medium">
                                    {item.question}
                                </span>
                            </div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="none"
                                aria-hidden="true"
                                className={[
                                    "mt-1 h-4 w-4 text-slate-500",
                                    "transition-transform",
                                    "group-open:rotate-180",
                                ].join(" ")}
                            >
                                <path
                                    d="M6 8l4 4 4-4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </summary>
                        <div className="border-t border-slate-200 px-4 py-3 space-y-2 bg-white">
                            {renderAnswer(item.answer)}
                        </div>
                    </details>
                ))}
            </div>
            <p className="mt-4 text-sm text-slate-600">
                Still have a question? Call{" "}
                <a className="text-blue-700 hover:underline" href="tel:+17165241717">
                    716-524-1717
                </a>{" "}
                or message us on{" "}
                <a
                    className="text-blue-700 hover:underline"
                    href="https://wa.me/17165241717"
                    rel="noopener"
                    target="_blank"
                >
                    WhatsApp
                </a>
                .
            </p>
        </section>
    );
}
