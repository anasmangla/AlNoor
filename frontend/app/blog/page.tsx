import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Farm Blog & Halal Guides",
    description:
        "Learn how Al Noor Farm prepares zabihah halal meat in Ransomville, explore Niagara-inspired recipes, and stay current on local farm news.",
};

type Post = {
    slug: string;
    title: string;
    date: string;
    readTime: string;
    summary: string;
    tags: string[];
    content: ReactNode;
    cta?: {
        text: string;
        href: string;
        description: string;
    };
};

const posts: Post[] = [
    {
        slug: "halal-practices-ransomville",
        title: "How We Prepare Zabihah Halal Meat in Ransomville",
        date: "2024-05-20",
        readTime: "6 min read",
        summary:
            "A transparent look at the halal standards guiding every goat, lamb, and chicken processed at our Niagara County farm.",
        tags: ["Halal Practices", "Ransomville"],
        content: (
            <>
                <p>
                    Our Ransomville halal meat program follows zabihah guidelines from the moment animals arrive on the farm until
                    they are hand-delivered to families across Niagara County. Every step happens on-site so we can vouch for the
                    health of the herd, the comfort of the animals, and the integrity of the final product you bring home.
                </p>
                <h3 className="text-xl font-semibold text-slate-900">Certified halal workflow</h3>
                <p>
                    Livestock are raised on pasture and fed a forage-first diet to keep stress levels low. On processing days we
                    schedule a limited number of appointments, giving our halal supervisor time to recite the Tasmiya for each
                    animal. Blades are sharpened between uses and all equipment is washed with fragrance-free, food-safe cleaners
                    to prevent cross-contamination.
                </p>
                <p>
                    Because everything is done by hand, families can request custom portions—whole goats for Eid, smaller cuts for
                    freezer stocking, or value-added items like ground beef seasoned for kofta. Maintaining this scale allows us
                    to serve Western New York households looking for zabihah meat they can trace back to a farm they know.
                </p>
                <h3 className="text-xl font-semibold text-slate-900">Community accountability</h3>
                <p>
                    Weekly open barn hours invite neighbors to observe our process, ask about feed, and meet the team who prepares
                    every order. Niagara Falls and Lewiston customers frequently stop by on Friday afternoons to pick up special
                    cuts ahead of weekend gatherings. We also partner with local mosques to coordinate bulk reservations during
                    Ramadan and Eid al-Adha.
                </p>
                <ul className="list-disc space-y-2 pl-5 text-slate-700">
                    <li>Customers can reserve preferred slaughter dates online or by calling 716-524-1717.</li>
                    <li>Halal certificates are available upon request for weddings, aqiqah celebrations, and community events.</li>
                    <li>
                        We log every batch in a compliance book that is audited by our halal advisory council and shared with the
                        <Link className="text-emerald-700 underline" href="/faq">
                            {" "}FAQ page
                        </Link>
                        to keep answers current.
                    </li>
                </ul>
                <p>
                    Curious about something you do not see covered here? Send us a message through the contact form or stop by the
                    farm—transparency is the best assurance we can offer our Ransomville halal meat community.
                </p>
            </>
        ),
        cta: {
            text: "Schedule a halal processing visit",
            href: "/contact",
            description: "Pick a processing date or request a custom order before the next halal run.",
        },
    },
    {
        slug: "niagara-halal-recipes",
        title: "Niagara-Inspired Halal Recipes for Family Tables",
        date: "2024-05-14",
        readTime: "5 min read",
        summary:
            "Seasonal dishes that showcase halal goat, lamb, and chicken raised on our Niagara farm—complete with local produce pairings.",
        tags: ["Recipes", "Niagara"],
        content: (
            <>
                <p>
                    Whether you are planning a Lewiston backyard grill-out or a cozy Buffalo family dinner, these recipes celebrate
                    the flavors of Western New York while keeping preparation halal-friendly. Each dish highlights a signature
                    product from our Niagara goat farm and pairs it with produce available from nearby markets.
                </p>
                <h3 className="text-xl font-semibold text-slate-900">Maple-Glazed Halal Goat Ribs</h3>
                <p>
                    Slow-roast a rack of halal goat ribs with garlic, ginger, and a brush of local maple syrup. Finish on the grill
                    for a caramelized crust and serve alongside charred asparagus from the Ransomville farmers market. The sweet
                    and savory contrast makes this a standout for Eid gatherings.
                </p>
                <h3 className="text-xl font-semibold text-slate-900">Niagara Harvest Chicken Karahi</h3>
                <p>
                    Our zabihah chicken thighs simmer beautifully with tomatoes, bell peppers, and onions grown throughout Niagara
                    County. Add a splash of apple cider from Youngstown orchards for brightness, then serve with basmati rice and a
                    side of cucumber raita.
                </p>
                <h3 className="text-xl font-semibold text-slate-900">Buffalo-Style Halal Lamb Kofta</h3>
                <p>
                    Blend ground lamb with hot paprika, cumin, and a dash of Frank's hot sauce for a nod to Buffalo's culinary
                    heritage. Skewer, grill, and tuck into warm pitas with pickled carrots sourced from local CSAs. The mild heat
                    pairs perfectly with cooling yogurt sauce.
                </p>
                <p>
                    Looking for more ideas? Download our printable recipe cards at the farm store or sign up for the newsletter
                    below to receive seasonal halal meal plans that feature Niagara-grown ingredients.
                </p>
            </>
        ),
        cta: {
            text: "Get seasonal recipe cards",
            href: "/contact",
            description: "Let us know which proteins you cook with most and we will email curated halal recipes.",
        },
    },
    {
        slug: "farm-news-niagara",
        title: "Farm News: Goat Kids, Market Dates, and Community Events",
        date: "2024-05-08",
        readTime: "4 min read",
        summary:
            "Catch up on spring happenings at the Niagara goat farm, from new kidding schedules to Buffalo market appearances.",
        tags: ["Farm News", "Events"],
        content: (
            <>
                <p>
                    Spring has brought a flurry of activity to the pastures. Below is the latest roundup for customers searching
                    for Niagara goat farm updates and halal meat availability near Ransomville.
                </p>
                <h3 className="text-xl font-semibold text-slate-900">2024 kidding calendar</h3>
                <p>
                    The first wave of Nubian goat kids arrived in early April and will be ready for halal reservations by late May.
                    Families interested in aqiqah or Eid al-Adha orders should place deposits now so we can schedule processing
                    dates. We maintain a waitlist for Buffalo and Niagara Falls pickups to keep travel convenient.
                </p>
                <h3 className="text-xl font-semibold text-slate-900">Farmers market schedule</h3>
                <p>
                    Look for the Al Noor Farm booth at the Lewiston Artisan Market every Saturday starting June 1. We will bring
                    zabihah goat, lamb sausages, and marinated chicken, plus samplers of our maple yogurt parfaits. Follow our
                    social channels for pop-up stops in North Tonawanda and the Elmwood Village market in Buffalo.
                </p>
                <h3 className="text-xl font-semibold text-slate-900">Community gatherings</h3>
                <p>
                    Monthly farm tours resume on the last Sunday of each month with a focus on halal education for youth groups.
                    Guests can walk the processing floor, observe the equipment, and discuss animal welfare standards with the team.
                    Light refreshments—think honey-rose lemonade and goat cheese crostini—will be served on the patio overlooking
                    the pastures.
                </p>
                <p>
                    We love hearing how families use their halal purchases. Share your recipes and celebrations with us on
                    Instagram or email stories to include in future farm news posts.
                </p>
            </>
        ),
        cta: {
            text: "Reserve your halal order",
            href: "/contact",
            description: "Secure goat, lamb, or chicken ahead of upcoming farmers markets and holidays.",
        },
    },
];

export default function BlogPage() {
    return (
        <div className="space-y-16">
            <header className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Al Noor Farm Blog</p>
                <h1 className="text-4xl font-bold text-slate-900">Stories from our Niagara halal farm</h1>
                <p className="max-w-3xl text-lg text-slate-700">
                    Explore behind-the-scenes halal practices, Ransomville recipe inspiration, and farm news for customers across
                    Niagara Falls, Lewiston, and Buffalo. Bookmark this page for the latest updates on seasonal availability and
                    community events.
                </p>
            </header>
            <div className="space-y-12">
                {posts.map((post) => (
                    <article
                        key={post.slug}
                        className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm transition hover:shadow-md"
                    >
                        <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-700">
                            <time dateTime={post.date}>
                                {new Date(post.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </time>
                            <span aria-hidden="true">•</span>
                            <span>{post.readTime}</span>
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-semibold text-slate-900">{post.title}</h2>
                            <p className="text-base text-slate-600">{post.summary}</p>
                        </div>
                        <div className="space-y-4 text-base leading-relaxed text-slate-700">{post.content}</div>
                        {post.cta && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-slate-800">
                                <h3 className="text-lg font-semibold">{post.cta.text}</h3>
                                <p className="mt-2 text-sm text-slate-600">{post.cta.description}</p>
                                <Link
                                    href={post.cta.href}
                                    className="mt-4 inline-flex items-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    Contact the farm
                                </Link>
                            </div>
                        )}
                    </article>
                ))}
            </div>
            <section className="rounded-3xl bg-slate-900 p-10 text-white">
                <h2 className="text-2xl font-semibold">Stay connected with farm updates</h2>
                <p className="mt-3 max-w-3xl text-slate-200">
                    Join our email list for halal availability alerts, Niagara County market schedules, and new recipe releases.
                    We respect your inbox and send no more than two updates per month.
                </p>
                <Link
                    href="/contact"
                    className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                    Request newsletter signup
                </Link>
            </section>
        </div>
    );
}
