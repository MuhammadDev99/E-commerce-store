"use client"
import React, { useState } from "react"
import clsx from "clsx"
import styles from "./style.module.css"

// Define our translations
const TRANSLATIONS = {
    en: {
        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Very Good",
        5: "Excellent",
    },
    ar: {
        1: "سيء جداً",
        2: "سيء",
        3: "جيد",
        4: "جيد جداً",
        5: "ممتاز",
    },
}

type Language = "en" | "ar"

interface ReviewStarsInputProps {
    className?: string
    maxStars?: number
    value?: number
    onChange?: (rating: number) => void
    showLabel?: boolean
    language?: Language // New prop
}

export default function ReviewStarsInput({
    className,
    maxStars = 5,
    value = 0,
    onChange,
    showLabel = false,
    language = "en", // Default to English
}: ReviewStarsInputProps) {
    const [hover, setHover] = useState(0)

    const currentRating = hover || value

    // Select the correct labels based on the language prop
    const activeLabels = TRANSLATIONS[language] || TRANSLATIONS.en

    return (
        <div className={clsx(styles.root, className)}>
            <div className={styles.starsRow} onMouseLeave={() => setHover(0)}>
                {Array.from({ length: maxStars }, (_, i) => {
                    const starValue = i + 1
                    const isFilled = starValue <= currentRating

                    return (
                        <button
                            key={starValue}
                            type="button"
                            className={clsx(styles.starButton, {
                                [styles.filled]: isFilled,
                            })}
                            onClick={() => onChange?.(starValue)}
                            onMouseEnter={() => setHover(starValue)}
                            aria-label={`Rate ${starValue} out of ${maxStars} stars`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill={isFilled ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={styles.starIcon}
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </button>
                    )
                })}
            </div>

            {showLabel && currentRating > 0 && (
                <span className={styles.ratingLabel}>
                    {activeLabels[currentRating as keyof typeof activeLabels]}
                </span>
            )}
        </div>
    )
}
