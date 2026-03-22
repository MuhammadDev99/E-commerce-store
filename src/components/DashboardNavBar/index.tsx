import clsx from "clsx"
import styles from "./style.module.css"
import Link from "next/link"
import {
    AnalyticsSVG,
    OrdersSVG,
    ProductsSVG,
    InventorySVG,
    MarketingSVG,
    ClientsSVG,
    ReviewsSVG,
    SettingsSVG,
    ShippingSVG,
    ControlPanelSVG,
} from "@/images"
import { getDisplayLanguage } from "@/utils"

export default function DashboardNavBar({ className }: { className?: string }) {
    const displayLanguage = getDisplayLanguage()
    return (
        <div className={clsx(styles.container, className, styles[displayLanguage])}>
            <div className={styles.header}>
                <ControlPanelSVG className={styles.icon} />
                <p>لوحة التحكم</p>
            </div>
            <div className={styles.buttons}>
                <Link href={"/dashboard/analytics"}>
                    <AnalyticsSVG className={styles.icon} />
                    <p>إحصائات</p>
                </Link>
                <Link href={"/dashboard/orders"}>
                    <OrdersSVG className={styles.icon} />
                    <p>الطلبات</p>
                </Link>
                <Link href={"/dashboard/products"}>
                    <ProductsSVG className={styles.icon} />
                    <p>إدارة المنتجات</p>
                </Link>

                <Link href={"/dashboard/inventory"}>
                    <InventorySVG className={styles.icon} />
                    <p>المخزون</p>
                </Link>

                <Link href={"/dashboard/clients"}>
                    <ClientsSVG className={styles.icon} />
                    <p>العملاء</p>
                </Link>
                <Link href={"/dashboard/marketing"}>
                    <MarketingSVG className={styles.icon} />
                    <p>التسويق والعروض</p>
                </Link>
                <Link href={"/dashboard/reviews"}>
                    <ReviewsSVG className={styles.icon} />
                    <p>التقييمات والمراجعات</p>
                </Link>
                <Link href={"/dashboard/shipping"}>
                    <ShippingSVG className={styles.icon} />
                    <p>الشحن والتوصيل</p>
                </Link>
                <Link href={"/dashboard/settings"}>
                    <SettingsSVG className={styles.icon} />
                    <p>الإعدادات</p>
                </Link>
            </div>
        </div>
    )
}
