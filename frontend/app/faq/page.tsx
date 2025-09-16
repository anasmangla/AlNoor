import Link from "next/link";

export const metadata = {
  title: "FAQ | Al Noor Farm",
  description: "Frequently asked questions about ordering halal meat, visiting the farm, and working with Al Noor Farm.",
};

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Browse the Shop to see current availability, add items to your cart, and complete checkout. We will confirm pickup windows once your order is received.",
  },
  {
    question: "Do you offer delivery?",
    answer:
      "Local delivery is available for larger orders in the Buffalo and Niagara regions. Contact us to coordinate details and schedule a drop-off.",
  },
  {
    question: "Can I visit the farm?",
    answer:
      "Yes, visits are welcome by appointment. We encourage guests to see our facilities and learn more about our halal practices.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cash, major credit cards, and invoiced payments for wholesale partners. Payment details are finalized during checkout or pickup.",
  },
];

export default function FaqPage() {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold">Frequently Asked Questions</h1>
      <div className="grid gap-4">
        {faqs.map((item) => (
          <div key={item.question} className="border rounded p-4">
            <h2 className="font-medium mb-2">{item.question}</h2>
            <p className="text-slate-700">{item.answer}</p>
          </div>
        ))}
      </div>
      <p className="text-slate-700">
        Need something else? <Link className="text-blue-700 hover:underline" href="/contact">Reach out to our team</Link> and we
        will be happy to help.
      </p>
    </section>
  );
}
