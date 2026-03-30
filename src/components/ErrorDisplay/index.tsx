"use client"

import { useState } from "react"
import clsx from "clsx"
import styles from "./style.module.css"

interface ErrorDisplayProps {
    title?: string
    message?: string
    error?: Error & { digest?: string }
    reset?: () => void
    className?: string
}

export default function ErrorDisplay({
    title = "Something went wrong",
    message,
    error,
    reset,
    className,
}: ErrorDisplayProps) {
    const [showDetails, setShowDetails] = useState(false)

    // 1. Determine the message: prioritize passed prop, then error object, then default string
    const displayMessage =
        message || error?.message || "An unexpected error occurred. Please try again."

    return (
        <div className={clsx(styles.container, className)}>
            <div className={styles.card} role="alert">
                <div className={styles.iconCircle}>
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <h1 className={styles.title}>{title}</h1>
                <p className={styles.message}>{displayMessage}</p>

                <div className={styles.actions}>
                    {reset && (
                        <button onClick={() => reset()} className={styles.retryButton}>
                            Try Again
                        </button>
                    )}

                    {/* 2. Show a toggle if there is an error stack or digest */}
                    {(error?.stack || error?.digest) && (
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className={styles.detailsToggle}
                        >
                            {showDetails ? "Hide Details" : "View Technical Details"}
                        </button>
                    )}
                </div>

                {/* 3. The "Fancy" Technical Details section */}
                {showDetails && (
                    <div className={styles.detailsArea}>
                        {error?.digest && (
                            <div className={styles.digestRow}>
                                <span>Digest ID:</span>
                                <code>{error.digest}</code>
                            </div>
                        )}
                        {error?.stack && <pre className={styles.stackTrace}>{error.stack}</pre>}
                    </div>
                )}
            </div>
        </div>
    )
}
