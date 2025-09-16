const endorsements = [
    {
        quote: "Al Noor Farm is a trusted stop for our neighbors seeking halal meats and fresh eggs.",
        name: "Imam Kareem Ali",
        role: "Niagara Falls Community Center",
    },
    {
        quote: "We rely on Al Noor for quality ingredients during community dinners and food drives.",
        name: "Sara Whitman",
        role: "Ransomville Outreach Collective",
    },
    {
        quote: "Local families rave about their friendly service and the care put into every order.",
        name: "Monica Rivera",
        role: "Lewiston Family Resource Network",
    },
];

export default function CommunityHighlights() {
    return (
        <section className="border rounded p-4 bg-slate-50 h-full" aria-labelledby="community-highlights">
            <h2 id="community-highlights" className="text-lg font-semibold mb-3">
                Community Voices
            </h2>
            <p className="text-sm text-slate-600 mb-4">
                Local partners and neighbors continue to recommend Al Noor Farm for its reliable service
                and community care.
            </p>
            <div className="grid gap-3">
                {endorsements.map((endorsement) => (
                    <blockquote
                        key={endorsement.name}
                        className="border-l-4 border-emerald-500 bg-white p-3 shadow-sm rounded"
                    >
                        <p className="text-slate-700 italic">“{endorsement.quote}”</p>
                        <footer className="mt-2 text-sm text-slate-600">
                            <span className="font-medium text-slate-800">{endorsement.name}</span>
                            <span className="block">{endorsement.role}</span>
                        </footer>
                    </blockquote>
                ))}
            </div>
        </section>
    );
}
