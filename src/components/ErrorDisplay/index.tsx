"use client" // Often required if using 'reset' or event handlers

import clsx from "clsx"
import styles from "./style.module.css"

interface ErrorDisplayProps {
    title?: string
    message?: string
    error?: Error & { digest?: string } // Next.js specific error object
    reset?: () => void // Next.js reset function
    className?: string
}

export default function ErrorDisplay({
    title = "Something went wrong",
    message = "An unexpected error occurred. Please try again.",
    error,
    reset,
    className,
}: ErrorDisplayProps) {
    return (
        <div className={clsx(styles.root, className)} role="alert" aria-labelledby="error-title">
            <h1 id="error-title" className={styles.title}>
                {title}
            </h1>
            <p className={styles.message}>{message}</p>

            {/* Optional: Show digest/id for support in production */}
            {error?.digest && <p className={styles.digest}>Error ID: {error.digest}</p>}

            {reset && (
                <button onClick={() => reset()} className={styles.retryButton}>
                    Try Again
                </button>
            )}
        </div>
    )
}
