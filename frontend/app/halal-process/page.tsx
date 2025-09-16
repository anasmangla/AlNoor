export const metadata = {
  title: "Halal Process | Al Noor Farm",
  description: "Understand the halal process at Al Noor Farm, from animal care to Zabihah-compliant preparation.",
};

export default function HalalProcessPage() {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold">Our Halal Process</h1>
      <p className="text-slate-700">
        Every step of our process is designed to meet halal requirements and respect the animals under our
        care. From sourcing and handling to the final preparation, we follow Zabihah standards so you can have
        complete confidence in every order.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">1. Humane Care</h2>
          <p className="text-slate-700">
            Animals are raised in clean, low-stress environments with access to open pasture and quality feed.
            We monitor their health closely and avoid any unnecessary interventions.
          </p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">2. Zabihah Preparation</h2>
          <p className="text-slate-700">
            A trained Muslim slaughterman recites the Tasmiya before each harvest and uses a swift, single
            motion with a sharpened blade to minimize discomfort and ensure a proper halal cut.
          </p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">3. Clean Handling</h2>
          <p className="text-slate-700">
            All equipment is sanitized between uses, and meat is cooled and packaged promptly so it reaches you
            fresh and ready for pickup or delivery.
          </p>
        </div>
      </div>
      <div className="border rounded p-4">
        <h2 className="font-medium mb-2">Visit the Farm</h2>
        <p className="text-slate-700">
          We welcome appointments to observe our process or ask additional questions. Contact us to schedule a
          tour and experience the care we put into halal production firsthand.
        </p>
      </div>
    </section>
  );
}
