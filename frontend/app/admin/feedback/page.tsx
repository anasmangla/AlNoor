"use client";

import { useEffect, useState } from "react";
import {
    deleteFeedbackEntry,
    fetchFeedbackSummary,
    listFeedbackEntries,
    logout as logoutSession,
    type FeedbackSummary,
    type VisitorFeedback,
} from "@/lib/api";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/Toast";

function formatDate(value: string | null | undefined): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
}

function formatReviewDate(value: string | null | undefined): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export default function AdminFeedbackPage(): JSX.Element {
    const [entries, setEntries] = useState<VisitorFeedback[]>([]);
    const [summary, setSummary] = useState<FeedbackSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    async function logoutAndRedirect(nextPath: string) {
        try {
            await logoutSession();
        } catch (err) {
            console.error("Failed to clear session", err);
        } finally {
            if (typeof window !== "undefined") {
                window.location.href = `/admin/login?next=${encodeURIComponent(nextPath)}`;
            }
        }
    }

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const [feedbackEntries, feedbackSummary] = await Promise.all([
                listFeedbackEntries(),
                fetchFeedbackSummary(),
            ]);
            setEntries(feedbackEntries);
            setSummary(feedbackSummary);
        } catch (err: any) {
            const message = err?.message || "Failed to load visitor feedback";
            setError(message);
            if (message.includes("401")) {
                await logoutAndRedirect("/admin/feedback");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleDelete(id: number) {
        setError(null);
        try {
            await deleteFeedbackEntry(id);
            setEntries((prev) => prev.filter((entry) => entry.id !== id));
            toast.success("Feedback deleted");
        } catch (err: any) {
            const message = err?.message || "Failed to delete feedback";
            setError(message);
            if (message.includes("401")) {
                await logoutAndRedirect("/admin/feedback");
            }
            toast.error(message);
        }
    }

    return (
        <section className="grid gap-4">
            <h1 className="text-2xl font-semibold">Visitor Feedback</h1>
            <p className="text-sm text-slate-600">
                Capture first impressions from new visitors and review analytics quarterly to adjust
                priorities and campaigns.
            </p>
            {error && (
                <div
                    className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded flex items-center justify-between"
                    role="alert"
                >
                    <span>{error}</span>
                    <button onClick={load} className="text-red-800 underline text-sm">
                        Retry
                    </button>
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="border rounded p-4">
                    <h2 className="font-medium mb-2">Quarterly insights</h2>
                    {loading && !summary ? (
                        <Spinner />
                    ) : !summary ? (
                        <p className="text-sm text-slate-600">No feedback yet.</p>
                    ) : (
                        <div className="grid gap-2 text-sm text-slate-700">
                            <div>
                                <span className="font-medium">Total submissions:</span> {summary.total_submissions}
                            </div>
                            <div>
                                <span className="font-medium">Average rating:</span>{" "}
                                {summary.average_rating !== null ? summary.average_rating.toFixed(2) : "—"}
                            </div>
                            <div>
                                <span className="font-medium">Last submission:</span>{" "}
                                {formatDate(summary.last_submission)}
                            </div>
                            <div>
                                <span className="font-medium">Next quarterly review:</span>{" "}
                                {formatReviewDate(summary.next_quarterly_review)}
                            </div>
                            <p className="text-xs text-slate-500">
                                Block time each quarter to review analytics and feedback together, then update
                                merchandising, promotions, or content priorities accordingly.
                            </p>
                        </div>
                    )}
                </div>
                <div className="border rounded p-4">
                    <h2 className="font-medium mb-2">Top visitor interests</h2>
                    {loading && !summary ? (
                        <Spinner />
                    ) : summary && summary.interest_breakdown.length > 0 ? (
                        <ul className="grid gap-1 text-sm text-slate-700">
                            {summary.interest_breakdown.map((item) => (
                                <li key={item.interest} className="flex items-center justify-between">
                                    <span>{item.interest}</span>
                                    <span className="text-xs text-slate-500">{item.count}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-600">No trends yet.</p>
                    )}
                </div>
            </div>

            <div className="border rounded p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-medium">Feedback log</h2>
                    <button onClick={load} className="text-blue-700 hover:underline text-sm">
                        Refresh
                    </button>
                </div>
                {loading ? (
                    <Spinner />
                ) : entries.length === 0 ? (
                    <p className="text-slate-600 text-sm">No feedback submissions yet.</p>
                ) : (
                    <ul className="grid gap-2">
                        {entries.map((entry) => (
                            <li key={entry.id} className="border rounded p-3">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">{entry.name || "(No name)"}</div>
                                    <div className="text-xs text-slate-500">{formatDate(entry.created_at)}</div>
                                </div>
                                <div className="text-sm text-slate-600">
                                    Rating: <strong>{entry.rating}/5</strong>
                                </div>
                                {entry.interest && (
                                    <div className="text-sm text-slate-600">Interest: {entry.interest}</div>
                                )}
                                {entry.email && (
                                    <div className="text-sm text-slate-600">{entry.email}</div>
                                )}
                                {entry.comments && (
                                    <div className="text-slate-700 whitespace-pre-wrap mt-1">{entry.comments}</div>
                                )}
                                <div className="mt-2">
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="text-red-700 hover:underline text-sm"
                                        aria-label={`Delete feedback ${entry.id}`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
