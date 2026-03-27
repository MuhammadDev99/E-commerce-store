import React, { useId } from "react"
import clsx from "clsx"
import styles from "./style.module.css"

export default function ReviewStars({ className, rating }: { className?: string; rating: number }) {
    // Generate a unique ID prefix for the SVG clipPaths so they don't
    // conflict if you render multiple ReviewStars components on the same page.
    const idPrefix = useId()

    // Clamp rating to ensure it stays strictly between 0 and 5
    const clampedRating = Math.max(0, Math.min(5, rating))

    return (
        <div
            className={clsx(styles.root, className)}
            title={`${clampedRating} out of 5 stars`}
            aria-label={`${clampedRating} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((starValue) => {
                // Calculate how much of this specific star should be filled (0 to 100)
                let fillPercentage = 0
                if (clampedRating >= starValue) {
                    fillPercentage = 100 // Fully filled
                } else if (clampedRating <= starValue - 1) {
                    fillPercentage = 0 // Completely empty
                } else {
                    fillPercentage = (clampedRating - (starValue - 1)) * 100 // Partially filled
                }

                const isFull = fillPercentage === 100
                const isPartial = fillPercentage > 0 && fillPercentage < 100

                // The SVG viewBox is 24px wide, so we calculate the width of the mask out of 24
                const clipId = `${idPrefix}-star-${starValue}`
                const fillWidth = (fillPercentage / 100) * 24

                return (
                    <svg
                        key={starValue}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.star}
                        aria-hidden="true"
                        // If it's 100% full, just fill the base SVG
                        fill={isFull ? "currentColor" : "none"}
                    >
                        {/* Define the mask if the star is partially filled */}
                        {isPartial && (
                            <defs>
                                <clipPath id={clipId}>
                                    <rect x="0" y="0" width={fillWidth} height="24" />
                                </clipPath>
                            </defs>
                        )}

                        {/* Base Star Outline */}
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />

                        {/* Foreground Filled Star (Overlays the base star, clipped to the correct width) */}
                        {isPartial && (
                            <polygon
                                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                                fill="currentColor"
                                clipPath={`url(#${clipId})`}
                            />
                        )}
                    </svg>
                )
            })}
        </div>
    )
}
