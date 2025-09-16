import Link from "next/link";
import Image from "next/image";

const featuredItems = [
  {
    title: "Fresh Produce",
    description: "Seasonal vegetables harvested at peak flavor for your table.",
    href: "/products?category=produce",
  },
  {
    title: "Artisanal Dairy",
    description: "Small-batch milk, yogurt, and cheese from pasture-raised herds.",
    href: "/products?category=dairy",
  },
  {
    title: "Bakery Favorites",
    description: "Handcrafted breads and pastries made with locally sourced grains.",
    href: "/products?category=bakery",
  },
];

const facilityShowcase = [
  {
    title: "Processing Floor",
    description:
      "Stainless-steel prep stations and color-coded utensils keep produce moving without cross-contamination.",
    imageSrc:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    alt: "Food safety specialists preparing vegetables on a stainless steel processing table.",
  },
  {
    title: "Cold Chain Corridor",
    description:
      "Chilled packing lines with continuous temperature monitoring protect freshness from harvest to delivery.",
    imageSrc:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=80",
    alt: "Sanitized cold storage area with neatly organized dairy products.",
  },
  {
    title: "Sanitation Command Center",
    description:
      "UV-sterilized wash bays and documented clean-in-place cycles uphold rigorous sanitation benchmarks.",
    imageSrc:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80",
    alt: "Technician reviewing sanitation logs beside industrial wash equipment.",
  },
];

const cleaningProtocols = [
  "Production surfaces are sanitized every hour with eco-certified, food-safe disinfectants.",
  "Tooling is rotated through a clean-in-place cycle between product batches to eliminate cross-contact risks.",
  "Air and water quality sensors trigger immediate alerts for any variance outside our safety thresholds.",
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-6 py-16 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-500 to-lime-400 px-6 py-16 text-white shadow-2xl sm:px-12">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-cover bg-center opacity-10" aria-hidden />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur">
            <Image
              src="/alnoorlogo.png"
              alt="Al Noor Farm Icon"
              width={96}
              height={96}
              className="h-16 w-16"
              priority
            />
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Farm-fresh goodness, from our fields to your family
            </h1>
            <p className="text-lg text-emerald-50 sm:text-xl">
              Explore the Al Noor Farm marketplace to discover sustainable produce, artisanal goods,
              and tools to keep your operations thriving.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Shop Now
            </Link>
            <div className="flex gap-3 text-sm font-medium text-emerald-50">
              <Link className="underline-offset-4 transition hover:text-white hover:underline" href="/admin/login">
                Admin
              </Link>
              <span aria-hidden="true">•</span>
              <Link className="underline-offset-4 transition hover:text-white hover:underline" href="/admin/pos">
                POS
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Featured selections</h2>
          <p className="text-base text-slate-600">
            Browse curated categories to quickly stock up on best-selling farm products.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group block h-full rounded-2xl border border-emerald-100 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              <span className="mt-5 inline-flex items-center text-sm font-semibold text-emerald-600 transition group-hover:text-emerald-700">
                Explore
                <svg
                  aria-hidden="true"
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-10 rounded-3xl border border-emerald-100 bg-emerald-50/40 p-8 shadow-sm sm:p-12">
        <div className="space-y-4 text-center sm:text-left">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Processing transparency
          </span>
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            See how we keep every harvest spotless
          </h2>
          <p className="mx-auto max-w-3xl text-base text-slate-700 sm:mx-0">
            Peek inside our processing suites to explore the safeguards that protect your food—from meticulously
            scrubbed equipment to constant monitoring of sanitation benchmarks. A quick facility tour and our cleaning
            commitments are always available for your review.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="grid gap-6 sm:grid-cols-2">
              {facilityShowcase.map((facility) => (
                <figure
                  key={facility.title}
                  className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-emerald-100/80 transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-56 w-full sm:h-52">
                    <Image
                      src={facility.imageSrc}
                      alt={facility.alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 50vw, (min-width: 640px) 45vw, 90vw"
                    />
                  </div>
                  <figcaption className="space-y-2 px-6 py-5">
                    <h3 className="text-lg font-semibold text-slate-900">{facility.title}</h3>
                    <p className="text-sm text-slate-600">{facility.description}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="aspect-video overflow-hidden rounded-3xl bg-slate-900 shadow-lg">
              <iframe
                src="https://www.youtube.com/embed/TiQ6LZlS0Ds"
                title="Al Noor processing walkthrough"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="h-full w-full"
              />
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-emerald-100/80">
              <h3 className="text-lg font-semibold text-slate-900">Cleaning protocols at a glance</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {cleaningProtocols.map((protocol) => (
                  <li key={protocol} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-emerald-500" aria-hidden />
                    <span>{protocol}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
