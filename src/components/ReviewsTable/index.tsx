import clsx from "clsx"
import styles from "./style.module.css"
import { mockReviews } from "@/MockDataReviews"
import ReviewStars from "../ReviewStars"
import PaginatedTable from "../PaginatedTable"
import Button from "../Button"
import SelectBox from "../form-elements/SelectBox"
import Link from "next/link"

export default function ReviewsTable({ className }: { className?: string }) {
    const headers = ["العميل", "التعليق", "المنتج", "التقييم", "الحالة"]
    const items = mockReviews.map((review) => {
        const hue = review.rating * 25
        return (
            <div key={review.id} className={styles.item}>
                <div className={styles.customer}>
                    <Link href={"/"} className={styles.name}>
                        {review.customer.name}
                    </Link>
                    <p className={styles.email}>{review.customer.email}</p>
                </div>
                <Link href={"/"} className={styles.comment}>
                    {review.comment}
                </Link>

                <Link href={"/"} className={styles.product}>
                    {review.product.name}
                </Link>
                <p
                    className={styles.rating}
                    style={
                        {
                            "--accent-color": `hsl(${review.rating * 25}, 100%, 35%)`,
                        } as React.CSSProperties
                    }
                >
                    {review.rating.toFixed(1)}
                </p>
                <SelectBox
                    className={clsx(styles.status)}
                    options={[
                        { display: "علني", value: "public" },
                        { display: "مخفي", value: "private" },
                    ]}
                />
            </div>
        )
    })
    return (
        <PaginatedTable
            className={clsx(styles.root, className)}
            headers={headers}
            items={items}
            onPageChange={(pageNumber) => {}}
            onSearch={(query) => {}}
            onSearchSubmit={() => {}}
            pagesCount={10}
            gridTemplate="2fr 3fr 2fr 1fr 1fr"
        ></PaginatedTable>
    )
}
