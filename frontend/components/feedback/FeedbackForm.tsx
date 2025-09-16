"use client";

import { FormEvent, useState } from "react";
import { submitFeedback } from "@/lib/api";

const INTEREST_OPTIONS: Array<{ value: string; label: string }> = [
    { value: "", label: "Select an option" },
    { value: "Browsing halal meats and groceries", label: "Browsing halal meats and groceries" },
    { value: "Visiting the farm or farm store", label: "Visiting the farm or farm store" },
    { value: "Catering or bulk orders", label: "Catering or bulk orders" },
    { value: "Learning about Al Noor Farm", label: "Learning about Al Noor Farm" },
    { value: "Other / not listed", label: "Other / not listed" },
];

export default function FeedbackForm(): JSX.Element {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [rating, setRating] = useState("");
    const [interest, setInterest] = useState("");
    const [comments, setComments] = useState("");
    const [status, setStatus] = useState<"success" | "error" | null>(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!rating) {
            setStatus("error");
            setStatusMessage("Please choose a rating.");
            return;
        }
        setStatus(null);
        setStatusMessage("");
        setLoading(true);
        try {
            await submitFeedback({
                name: name.trim() || undefined,
                email: email.trim() || undefined,
                rating: Number(rating),
                interest: interest.trim() || undefined,
                comments: comments.trim() || undefined,
            });
            setStatus("success");
            setStatusMessage("Thanks for sharing your first impressions!");
            setName("");
            setEmail("");
            setRating("");
            setInterest("");
            setComments("");
        } catch (error: any) {
            setStatus("error");
            setStatusMessage(error?.message || "Could not submit feedback. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="grid gap-4" aria-live="polite">
            <div className="grid gap-2">
                <fieldset className="border border-slate-200 rounded p-3">
                    <legend className="px-1 text-sm text-slate-600">How would you rate your first impression?</legend>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <label key={value} className="flex items-center gap-2 border rounded px-2 py-1 text-sm">
                                <input
                                    type="radio"
                                    name="feedback-rating"
                                    value={String(value)}
                                    checked={rating === String(value)}
                                    onChange={(event) => setRating(event.target.value)}
                                    disabled={loading}
                                />
                                <span>{value}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
                <div>
                    <label className="block text-sm text-slate-600" htmlFor="feedback-interest">
                        What brings you to Al Noor Farm today?
                    </label>
                    <select
                        id="feedback-interest"
                        className="border rounded px-2 py-1 w-full"
                        value={interest}
                        onChange={(event) => setInterest(event.target.value)}
                        disabled={loading}
                    >
                        {INTEREST_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-2">
                <div>
                    <label className="block text-sm text-slate-600" htmlFor="feedback-name">
                        Name (optional)
                    </label>
                    <input
                        id="feedback-name"
                        className="border rounded px-2 py-1 w-full"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your name"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-600" htmlFor="feedback-email">
                        Email (optional)
                    </label>
                    <input
                        id="feedback-email"
                        type="email"
                        className="border rounded px-2 py-1 w-full"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        disabled={loading}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-slate-600" htmlFor="feedback-comments">
                    Anything else you would like us to know?
                </label>
                <textarea
                    id="feedback-comments"
                    className="border rounded px-2 py-1 w-full"
                    rows={4}
                    value={comments}
                    onChange={(event) => setComments(event.target.value)}
                    placeholder="Share ideas, questions, or suggestions"
                    maxLength={500}
                    disabled={loading}
                />
                <p className="text-xs text-slate-500 mt-1">
                    We review feedback alongside store analytics every quarter to plan improvements.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    className="bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700 disabled:opacity-60"
                    disabled={loading}
                    aria-busy={loading}
                >
                    {loading ? "Sending..." : "Send feedback"}
                </button>
                {status && (
                    <span
                        className={`text-sm ${
                            status === "success" ? "text-emerald-700" : "text-red-700"
                        }`}
                    >
                        {statusMessage}
                    </span>
                )}
            </div>
        </form>
    );
}
