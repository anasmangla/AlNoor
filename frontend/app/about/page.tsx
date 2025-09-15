export const metadata = {
  title: "About | Al Noor Farm",
  description: "Learn about Al Noor Farm's story, mission, and commitment to providing halal-certified meats.",
};

export default function AboutPage() {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold">About Al Noor Farm</h1>
      <p className="text-slate-700">
        Al Noor Farm is a family-run operation dedicated to providing the Western New York community with
        ethically-raised animals and fully halal-certified meats. We believe in transparency, responsible
        stewardship of the land, and honoring every customer who trusts us to nourish their families.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Our Story</h2>
          <p className="text-slate-700">
            From humble beginnings as a small hobby farm, we have grown alongside the needs of our customers.
            Today, our team oversees every step &mdash; from raising animals on open pastures to preparing
            meat for pick-up &mdash; to ensure exceptional quality.
          </p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Our Mission</h2>
          <p className="text-slate-700">
            We are committed to sustainable practices, attentive care for every animal, and service rooted in
            faith. Our goal is to make halal meat accessible, trustworthy, and convenient for families across
            the region.
          </p>
        </div>
      </div>
      <div className="border rounded p-4">
        <h2 className="font-medium mb-2">Community Focus</h2>
        <p className="text-slate-700">
          We proudly serve customers across Buffalo, Niagara Falls, Rochester, and beyond. Whether you are a
          first-time visitor or a long-time partner, we welcome you to tour the farm, ask questions, and learn
          more about our halal practices.
        </p>
      </div>
    </section>
  );
}
