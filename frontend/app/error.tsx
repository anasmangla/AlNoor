"use client";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Optionally report error to an APM service
        // console.error(error);
    }, [error]);

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const loginHref = `${basePath}/admin/login`;

    return (
        <html>
            <body>
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
                    <p className="text-slate-600 mb-4">
                        An unexpected error occurred. Please try again.
                    </p>
                    <p className="text-slate-600 mb-6">
                        If the issue persists, please
                        {" "}
                        <a className="text-blue-700 hover:underline" href={loginHref}>
                            log in
                        </a>{" "}
                        to continue.
                    </p>
                    <button className="text-blue-700 hover:underline" onClick={() => reset()}>
                        Reload
                    </button>
                </div>
            </body>
        </html>
    );
}

