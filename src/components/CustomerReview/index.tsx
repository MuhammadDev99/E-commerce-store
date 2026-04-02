"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { Review, User } from "@/types"
import ReviewStars from "@/components/ReviewStars"
import AvatarImage from "@/components/AvatarImage"
import Card from "../Card"
import { formatTime } from "@/utils"

export default function CustomerReview({
    className,
    review,
    user,
}: {
    className?: string
    review: Review
    user: User
}) {
    const formattedDate = formatTime({
        time: review.updatedAt,
        language: "ar",
        options: { style: "short", showTime: true, useWesternArabicNumerals: true },
    })

    return (
        <Card className={clsx(styles.root, className)}>
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <AvatarImage src={user.image} name={user.name} userId={user.id} />

                    <div className={styles.meta}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.date}>{formattedDate}</span>
                    </div>
                </div>

                <div className={styles.ratingWrapper}>
                    <ReviewStars rating={review.rate} />
                </div>
            </div>

            <div className={styles.body}>
                {review.title && <h4 className={styles.reviewTitle}>{review.title}</h4>}
                <p className={styles.content}>{review.content || "لا يوجد تعليق مكتوب."}</p>
            </div>
        </Card>
    )
}
