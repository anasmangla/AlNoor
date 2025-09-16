"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import type { Review } from "@/lib/api";
import { fetchReviews, submitReview } from "@/lib/api";

const initialFormState = {
    name: "",
    location: "",
    rating: "",
    message: "",
    photoUrl: "",
};

const ratingOptions = [
    { value: "", label: "Rating (optional)" },
    { value: "5", label: "5 - Excellent" },
    { value: "4", label: "4 - Great" },
    { value: "3", label: "3 - Good" },
    { value: "2", label: "2 - Fair" },
    { value: "1", label: "1 - Needs improvement" },
];

function ReviewStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center" aria-label={`${rating} out of 5 stars`}>
            <span className="text-amber-500" aria-hidden="true">
                {"★".repeat(rating)}
                {"☆".repeat(Math.max(0, 5 - rating))}
            </span>
            <span className="sr-only">Rated {rating} out of 5 stars</span>
        </div>
    );
}

export default function ReviewsSection() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [formState, setFormState] = useState(initialFormState);
    const [submitting, setSubmitting] = useState(false);
    const [formFeedback, setFormFeedback] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await fetchReviews();
                if (active) {
                    setReviews(data);
                    setFetchError(null);
                }
            } catch (error) {
                if (active) {
                    setFetchError("We could not load recent reviews.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const averageRating = useMemo(() => {
        const rated = reviews.filter((review) => typeof review.rating === "number");
        if (!rated.length) {
            return null;
        }
        const sum = rated.reduce((acc, review) => acc + (review.rating || 0), 0);
        return Math.round((sum / rated.length) * 10) / 10;
    }, [reviews]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormFeedback(null);

        const trimmedMessage = formState.message.trim();
        if (trimmedMessage.length < 10) {
            setFormFeedback("Please share a few more details so we can publish your review.");
            return;
        }

        const ratingValue = formState.rating ? Number(formState.rating) : undefined;

        setSubmitting(true);
        try {
            const created = await submitReview({
                name: formState.name,
                location: formState.location,
                rating: ratingValue,
                message: trimmedMessage,
                photoUrl: formState.photoUrl,
            });
            setReviews((prev) => [created, ...prev]);
            setFormState(initialFormState);
            setFormFeedback("Thank you! Your review is now live.");
        } catch (error) {
            setFormFeedback("We could not save your review. Please try again later.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="border rounded p-4 bg-white" aria-labelledby="customer-reviews">
            <h2 id="customer-reviews" className="text-lg font-semibold mb-3">
                Customer Reviews
            </h2>
            <p className="text-sm text-slate-600 mb-4">
                Share your visit and see how neighbors enjoy Al Noor Farm. Photos are optional but welcome!
            </p>
            <form className="grid gap-3 mb-6" onSubmit={handleSubmit} aria-live="polite">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm text-slate-600" htmlFor="review-name">
                            Name
                        </label>
                        <input
                            id="review-name"
                            className="border rounded px-2 py-1 w-full"
                            value={formState.name}
                            onChange={(event) =>
                                setFormState((prev) => ({ ...prev, name: event.target.value }))
                            }
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600" htmlFor="review-location">
                            City or community
                        </label>
                        <input
                            id="review-location"
                            className="border rounded px-2 py-1 w-full"
                            value={formState.location}
                            onChange={(event) =>
                                setFormState((prev) => ({ ...prev, location: event.target.value }))
                            }
                            placeholder="(optional)"
                        />
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm text-slate-600" htmlFor="review-rating">
                            Rating
                        </label>
                        <select
                            id="review-rating"
                            className="border rounded px-2 py-1 w-full"
                            value={formState.rating}
                            onChange={(event) =>
                                setFormState((prev) => ({ ...prev, rating: event.target.value }))
                            }
                        >
                            {ratingOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600" htmlFor="review-photo">
                            Photo URL
                        </label>
                        <input
                            id="review-photo"
                            className="border rounded px-2 py-1 w-full"
                            value={formState.photoUrl}
                            onChange={(event) =>
                                setFormState((prev) => ({ ...prev, photoUrl: event.target.value }))
                            }
                            placeholder="Link to a farm photo (optional)"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm text-slate-600" htmlFor="review-message">
                        Review
                    </label>
                    <textarea
                        id="review-message"
                        className="border rounded px-2 py-1 w-full"
                        rows={4}
                        value={formState.message}
                        onChange={(event) =>
                            setFormState((prev) => ({ ...prev, message: event.target.value }))
                        }
                        placeholder="Tell us about your experience"
                        required
                        minLength={10}
                    />
                </div>
                <button
                    type="submit"
                    className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 disabled:opacity-60"
                    disabled={submitting}
                    aria-busy={submitting}
                >
                    {submitting ? "Submitting..." : "Post review"}
                </button>
                {formFeedback && (
                    <p className="text-sm text-slate-700" role="status">
                        {formFeedback}
                    </p>
                )}
            </form>
            <div className="grid gap-4">
                {averageRating !== null && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="font-medium text-slate-900">Average rating:</span>
                        <span>{averageRating.toFixed(1)} / 5</span>
                    </div>
                )}
                {loading && <p className="text-sm text-slate-600">Loading recent reviews...</p>}
                {fetchError && !loading && (
                    <p className="text-sm text-red-600">{fetchError}</p>
                )}
                {!loading && !fetchError && reviews.length === 0 && (
                    <p className="text-sm text-slate-600">Be the first to share your experience!</p>
                )}
                {reviews.map((review) => {
                    const date = new Date(review.created_at);
                    const formattedDate = date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    });
                    return (
                        <article key={review.id} className="border rounded p-3 shadow-sm bg-slate-50">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="font-medium text-slate-800">{review.name}</p>
                                    {review.location && (
                                        <p className="text-sm text-slate-600">{review.location}</p>
                                    )}
                                    <p className="text-xs text-slate-500">Reviewed {formattedDate}</p>
                                </div>
                                {review.rating && <ReviewStars rating={review.rating} />}
                            </div>
                            <p className="mt-3 text-slate-700 whitespace-pre-line">{review.message}</p>
                            {review.photo_url && (
                                <div className="mt-3">
                                    <img
                                        src={review.photo_url}
                                        alt={`Customer shared photo from ${review.name}`}
                                        className="rounded max-h-48 w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
