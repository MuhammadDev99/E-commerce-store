"use client"
import { useState } from "react" // <-- Add this import
import clsx from "clsx"
import styles from "./style.module.css"
import { mockReviews } from "@/mockData/MockDataReviews"
import ReviewStars from "../../ReviewStars"
import PaginatedTable from "../../PaginatedTable"
import Button from "../../Button"
import SelectBox from "../../form-elements/SelectBox"
import Link from "next/link"
import { ReviewsTableConfig } from "@/types"
import { getReviewsPageData, updateReviewVisibility } from "@/utils/db"
import { safe } from "@/utils/safe"
import { showMessage } from "@/utils/showMessage"

// --- EXTRACT ROW INTO A SEPARATE COMPONENT ---
function ReviewTableRow({ review, productName, user }: ReviewsTableConfig["row"]) {
    // 1. Create local state initialized with the DB value
    const [isVisible, setIsVisible] = useState(review.isVisible)

    const handleVisibilityChange = async (stringValue: string) => {
        // FIX: Boolean("false") is true in JS. Use string comparison instead.
        const newValue = stringValue === "true"

        // 2. Optimistically update the UI so it feels instant
        setIsVisible(newValue)

        const result = await safe(updateReviewVisibility(review.id, newValue))

        if (result.success) {
            showMessage({ type: "success", title: "updated successfully" })
        } else {
            // 3. Revert back to the old value if the API request fails
            setIsVisible(!newValue)
            showMessage({ type: "error", content: result.error.message })
        }
    }

    return (
        <div className={styles.item}>
            <div className={styles.customer}>
                <Link href={"/"} className={styles.name}>
                    {user.name}
                </Link>
                <p className={styles.email}>{user.email}</p>
            </div>
            <Link href={"/"} className={styles.contentWrapper}>
                <p className={styles.title}>{review.title}</p>
                <p className={styles.content}>{review.content}</p>
            </Link>

            <Link href={"/"} className={styles.product}>
                {productName}
            </Link>
            <p
                className={styles.rating}
                style={
                    {
                        "--accent-color": `hsl(${review.rate * 25}, 100%, 35%)`,
                    } as React.CSSProperties
                }
            >
                {review.rate}
            </p>
            <SelectBox
                className={clsx(styles.status)}
                value={isVisible.toString()} // <-- Use local state here
                options={[
                    { display: "علني", value: "true" },
                    { display: "مخفي", value: "false" },
                ]}
                onChange={(e) => handleVisibilityChange(e.target.value)} // Pass string
            />
        </div>
    )
}

// --- MAIN COMPONENT ---
export default function ReviewsTable({
    className,
    initialData,
    initialTotalPages,
    initialPageSize,
}: {
    className?: string
    initialData: ReviewsTableConfig["row"][]
    initialTotalPages: number
    initialPageSize: number
}) {
    const headers: ReviewsTableConfig["headers"][] = [
        {
            display: "تاريخ التعديل",
            value: "updatedAt",
            searchable: false,
            sortable: true,
            hidden: true,
        },
        { display: "العميل", value: "customer", searchable: true, sortable: true },
        { display: "التعليق", value: "content", searchable: true, sortable: true },
        { display: "المنتج", value: "productName", searchable: true, sortable: true },
        { display: "التقييم", value: "rate", searchable: false, sortable: true },
        { display: "الحالة", value: "isVisible", searchable: false, sortable: false },
    ]

    return (
        <PaginatedTable<ReviewsTableConfig>
            className={clsx(styles.root, className)}
            initialData={initialData}
            initialTotalPages={initialTotalPages}
            defaultSearchColumn="customer"
            defaultSortColumn="updatedAt"
            gridTemplate="2fr 3fr 1.2fr 1fr 1fr"
            fetchData={async (params) => await getReviewsPageData(params)}
            headers={headers}
            pageSize={initialPageSize}
            // 4. Render the new isolated Row component
            renderItem={(rowProps, isPending) => (
                <ReviewTableRow key={rowProps.review.id} {...rowProps} />
            )}
        />
    )
}
