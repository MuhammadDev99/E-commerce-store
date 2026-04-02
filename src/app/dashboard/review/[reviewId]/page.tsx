import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import { safe } from "@/utils/safe"
import { getReviewById } from "@/utils/db"
import ErrorDisplay from "@/components/ErrorDisplay"
import { Review } from "@/types"
import CustomerReview from "@/components/CustomerReview"

export default async function CustomerPage({ params }: { params: Promise<{ reviewId: string }> }) {
    const { reviewId } = await params
    const decodedId = decodeURIComponent(reviewId)
    if (!decodedId.trim()) {
        return (
            <ErrorDisplay
                error={new Error("Invalid Review ID")}
                title="Invalid ID"
                message="The provided review ID is invalid or empty."
            />
        )
    }
    const displayLanguage = getDisplayLanguage()

    // 1. Fetch User
    const reviewResult = await safe(getReviewById(Number(decodedId)))
    if (!reviewResult.success) {
        return <ErrorDisplay error={reviewResult.error} />
    }

    const { review, user } = reviewResult.data

    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <CustomerReview className={styles.display} review={review} user={user} />
        </div>
    )
}
