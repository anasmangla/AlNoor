import Image from "next/image";

const customerHighlights = [
  {
    id: "fatima",
    name: "Fatima A.",
    image: "/customer-fatima-harvest.svg",
    alt: "Customer Fatima holding a basket of vegetables in the field.",
    quote:
      "Al Noor's produce makes every farm-to-table dinner feel like a celebration.",
    note: "Shared with permission from Fatima A.",
  },
  {
    id: "youssef",
    name: "Youssef R.",
    image: "/customer-youssef-market.svg",
    alt: "Customer Youssef smiling while arranging jars of honey at a market stall.",
    quote:
      "We proudly feature Al Noor honey at our weekend market—customers ask for it by name!",
    note: "Shared with permission from Youssef R.",
  },
  {
    id: "laila",
    name: "Laila H.",
    image: "/customer-laila-workshop.svg",
    alt: "Customer Laila teaching a workshop surrounded by baskets of fresh produce.",
    quote:
      "Their seasonal workshops connect us back to the land and community every time.",
    note: "Shared with permission from Laila H.",
  },
];

export function CustomerSpotlight() {
  return (
    <section className="mx-auto max-w-5xl text-left">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-800">Community Spotlight</h2>
        <p className="mt-2 text-slate-600">
          Real stories from customers who love sharing their Al Noor Farm experiences.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {customerHighlights.map((highlight) => (
          <figure
            key={highlight.id}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="relative h-56 w-full bg-slate-100">
              <Image
                src={highlight.image}
                alt={highlight.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={highlight.id === "fatima"}
              />
            </div>
            <figcaption className="flex flex-1 flex-col justify-between gap-4 p-6">
              <blockquote className="text-slate-700">
                <p className="text-lg font-medium">&ldquo;{highlight.quote}&rdquo;</p>
              </blockquote>
              <div className="text-sm text-slate-500">
                <p className="font-semibold text-slate-700">{highlight.name}</p>
                <p>{highlight.note}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
