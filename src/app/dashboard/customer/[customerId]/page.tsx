import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import { safe } from "@/utils/safe"
import { getUserById } from "@/utils/db/admin"
import ErrorDisplay from "@/components/ErrorDisplay"
import CustomerProfile from "@/components/CustomerProfile" // Adjust path if needed
import { User } from "@/types"

// Move Database imports here
import { db } from "@/db"
import { orders, reviews, cartItems } from "@/schemas/drizzle"
import { eq, sql, count } from "drizzle-orm"

export default async function CustomerPage({
    params,
}: {
    params: Promise<{ customerId: string }>
}) {
    const { customerId } = await params
    const decodedId = decodeURIComponent(customerId)
    const displayLanguage = getDisplayLanguage()

    // 1. Fetch User
    const userResult = await safe<User>(getUserById(decodedId))
    if (!userResult.success) {
        return <ErrorDisplay error={userResult.error} />
    }

    const user = userResult.data

    // 2. Fetch User Stats (Parallel Fetching on the Server)
    const [orderStats, reviewStats, cartStats] = await Promise.all([
        db
            .select({
                totalOrders: count(orders.id),
                totalSpent: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`,
            })
            .from(orders)
            .where(eq(orders.userId, user.id)),

        db
            .select({ totalReviews: count(reviews.id) })
            .from(reviews)
            .where(eq(reviews.userId, user.id)),

        db
            .select({ totalItems: sql<number>`coalesce(sum(${cartItems.quantity}), 0)` })
            .from(cartItems)
            .where(eq(cartItems.userId, user.id)),
    ])

    // Format stats to pass to the client component
    const stats = {
        orders: Number(orderStats[0]?.totalOrders || 0),
        spent: Number(orderStats[0]?.totalSpent || 0),
        reviews: Number(reviewStats[0]?.totalReviews || 0),
        cart: Number(cartStats[0]?.totalItems || 0),
    }

    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            {/* Pass both User and Stats as props */}
            <CustomerProfile className={styles.display} user={user} stats={stats} />
        </div>
    )
}
