"use client"

import clsx from "clsx"
import styles from "./style.module.css"
import { CustomerStats, User } from "@/types"
import AnalyticsCard from "../AnalyticsCard"
import { CartSVG, MoneySVG, OrdersSVG, StarSVG } from "@/images"
import { useRouter } from "next/navigation"

// Create a type for the stats we are passing from the server

export default function CustomerProfile({
    className,
    user,
    stats, // Accept stats as a prop
}: {
    className?: string
    user: User
    stats: CustomerStats
}) {
    const router = useRouter()
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
                    className={clsx(styles.totalSpent, styles.card)}
                    icon={MoneySVG}
                    label="إجمالي الإنفاق"
                    value={stats.spent}
                    unit="ر.س"
                />
                <AnalyticsCard
                    className={clsx(styles.ordersCount, styles.card)}
                    icon={OrdersSVG}
                    label="إجمالي الطلبات"
                    value={stats.orders}
                    onClick={() => router.push("/dashboard/customer/orders/" + user.id)}
                />
                <AnalyticsCard
                    className={clsx(styles.cartItemsCount, styles.card)}
                    icon={CartSVG}
                    label="محتوى السلة"
                    value={stats.cart}
                    onClick={() => router.push("/dashboard/customer/cart/" + user.id)}
                />
                <AnalyticsCard
                    className={clsx(styles.reviewsCount, styles.card)}
                    icon={StarSVG}
                    label="التقييمات المقدمة"
                    value={stats.reviews}
                    onClick={() => router.push("/dashboard/customer/reviews/" + user.id)}
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
                    <span>{new Date(user.createdAt).toLocaleDateString("ar-SA")}</span>
                </div>
            </div>
        </div>
    )
}
