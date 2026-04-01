import clsx from "clsx"
import styles from "./style.module.css"
import { User } from "@/types"
import { db } from "@/db"
import { orders, reviews, cartItems } from "@/db/schema"
import { eq, sql, count } from "drizzle-orm"
import AnalyticsCard from "../AnalyticsCard"
import { CartSVG, MoneySVG, OrdersSVG, StarSVG } from "@/images"

export default async function CustomerProfile({
    className,
    user,
}: {
    className?: string
    user: User
}) {
    // جلب الإحصائيات الخاصة بالعميل بشكل متوازٍ (Parallel Fetching)
    const [orderStats, reviewStats, cartStats] = await Promise.all([
        db
            .select({
                totalOrders: count(orders.id),
                // نفترض أن المبالغ محفوظة بالهللة/السنت، لذا نجمعها هنا
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

    const stats = {
        orders: Number(orderStats[0]?.totalOrders || 0),
        spent: Number(orderStats[0]?.totalSpent || 0) / 100, // القسمة لتحويل الهللة إلى ريال
        reviews: Number(reviewStats[0]?.totalReviews || 0),
        cart: Number(cartStats[0]?.totalItems || 0),
    }

    // قاموس لترجمة الأدوار
    const roleMap: Record<string, string> = {
        admin: "مدير النظام",
        user: "زبون",
    }

    return (
        <div className={clsx(styles.root, className)} dir="rtl">
            {/* الترويسة: الصورة والاسم والدور */}
            <div className={styles.header}>
                {user.image ? (
                    <img src={user.image} alt={user.name} className={styles.avatar} />
                ) : (
                    <div className={styles.avatarFallback}>{user.name.charAt(0)}</div>
                )}
                <div className={styles.titleContainer}>
                    <h1 className={styles.name}>{user.name}</h1>
                    <div className={styles.badges}>
                        <span className={clsx(styles.badge, styles[`role_${user.role}`])}>
                            {roleMap[user.role] || user.role}
                        </span>
                        {user.emailVerified && (
                            <span className={clsx(styles.badge, styles.verified)}>✓ موثق</span>
                        )}
                    </div>
                </div>
            </div>

            {/* شبكة الإحصائيات */}
            <div className={styles.statsGrid}>
                <AnalyticsCard
                    className={styles.totalSpent}
                    icon={MoneySVG}
                    label="إجمالي الإنفاق"
                    value={stats.spent}
                    unit="ر.س"
                />
                <AnalyticsCard
                    className={styles.ordersCount}
                    icon={OrdersSVG}
                    label="إجمالي الطلبات"
                    value={stats.orders}
                />
                <AnalyticsCard
                    className={styles.cartItemsCount}
                    icon={CartSVG}
                    label="محتوى السلة"
                    value={stats.cart}
                />
                <AnalyticsCard
                    className={styles.reviewsCount}
                    icon={StarSVG}
                    label="التقييمات المقدمة"
                    value={stats.spent}
                />
            </div>

            {/* التفاصيل الشخصية ومعلومات الاتصال */}
            <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                    <strong>البريد الإلكتروني</strong>
                    <span dir="ltr" className={styles.ltrText}>
                        {user.email}
                    </span>
                </div>
                {user.phoneNumber && (
                    <div className={styles.detailItem}>
                        <strong>رقم الهاتف</strong>
                        <span dir="ltr" className={styles.ltrText}>
                            {user.phoneNumber}
                        </span>
                    </div>
                )}
                {user.dateOfBirth && (
                    <div className={styles.detailItem}>
                        <strong>تاريخ الميلاد</strong>
                        <span>{user.dateOfBirth}</span>
                    </div>
                )}
                <div className={styles.detailItem}>
                    <strong>تاريخ الانضمام</strong>
                    {/* استخدام ar-SA يعرض التاريخ بالصيغة العربية المألوفة */}
                    <span>{new Date(user.createdAt).toLocaleDateString("ar-SA")}</span>
                </div>
            </div>
        </div>
    )
}
