import React from "react"
import clsx from "clsx"
import styles from "./style.module.css"
import { Coupon, CouponWithStatus } from "@/types"
import Link from "next/link"

// Helper for Arabic Dates
const formatDate = (date: Date | string | null) => {
    if (!date) return "غير محدد"
    return new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(date))
}

// Helper for Arabic Numbers
const formatNumber = (num: number | null, isLimit = false) => {
    if (num === null) return isLimit ? "غير محدود" : "غير محدد"
    return new Intl.NumberFormat("ar-EG").format(num)
}

// Icons as Sub-components for cleanliness
const Icons = {
    Tag: () => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 0 0 4v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 0 0-4Z" />
            <path d="M15 3v18" strokeDasharray="3 3" />
        </svg>
    ),
    Scissors: () => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ background: "transparent" }} // Extra insurance
        >
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
    ),
    Calendar: () => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    Users: () => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    ShoppingBag: () => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    ),
    Activity: () => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    ),
    Clock: () => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    User: () => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    Pencil: () => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
    ),
    Edit: () => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
}

export default function CouponDisplay({
    className,
    coupon,
}: {
    className?: string
    coupon: CouponWithStatus
}) {
    const getTypeAndValue = () => {
        if (coupon.type === "free_shipping") return "شحن مجاني"
        const val = formatNumber(coupon.value)
        return coupon.type === "percentage" ? `${val}٪ خصم` : `${val} ر.س خصم نقدي`
    }

    return (
        <div className={clsx(styles.container, className, styles[coupon.type])}>
            <h1>{coupon.status}</h1>
            <div className={styles.notchLeft} />
            <div className={styles.notchRight} />

            <header className={styles.header}>
                <div className={styles.iconCircle}>
                    <Icons.Tag />
                </div>
                <h1 className={styles.title}>{coupon.name}</h1>
                <div className={styles.badge}>{getTypeAndValue()}</div>

                <div className={styles.codeWrapper}>
                    <div className={styles.codeInner} dir="ltr">
                        <div className={styles.scissorsIcon}>
                            <Icons.Scissors />
                        </div>
                        <span className={styles.codeValue}>{coupon.code}</span>
                    </div>
                    <span className={styles.codeLabel}>استخدم هذا الكود عند إتمام الطلب</span>
                </div>
                <Link href={`/dashboard/coupon/edit/${coupon.id}`} className={styles.editButton}>
                    <Icons.Edit />
                    <span>تعديل الكوبون</span>
                </Link>
            </header>

            <div className={styles.grid}>
                <DetailItem
                    icon={<Icons.Activity />}
                    label="استخدم حتى الآن"
                    value={`${formatNumber(coupon.usedCount)} مرات`}
                />
                <DetailItem
                    icon={<Icons.ShoppingBag />}
                    label="الحد الأدنى للمشتريات"
                    value={`${formatNumber(coupon.minOrder)} ر.س`}
                />
                <DetailItem
                    icon={<Icons.Calendar />}
                    label="تاريخ البدء"
                    value={formatDate(coupon.startDate)}
                />
                <DetailItem
                    icon={<Icons.Calendar />}
                    label="تاريخ الانتهاء"
                    value={formatDate(coupon.endDate)}
                />
                <DetailItem
                    icon={<Icons.Users />}
                    label="سقف الاستخدام العام"
                    value={formatNumber(coupon.globalUsageLimit, true)}
                />
                <DetailItem
                    icon={<Icons.User />}
                    label="سقف استخدام العميل"
                    value={formatNumber(coupon.customerUsageLimit, true)}
                />

                <DetailItem
                    icon={<Icons.Clock />}
                    label="تاريخ الإنشاء"
                    value={formatDate(coupon.createdAt)}
                />
            </div>
        </div>
    )
}

function DetailItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className={styles.detailItem}>
            <div className={styles.detailIcon}>{icon}</div>
            <div className={styles.detailTexts}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={styles.detailValue}>{value}</span>
            </div>
        </div>
    )
}
