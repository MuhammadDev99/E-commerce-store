import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import { Package, Undo2, User, MapPin, ShieldCheck, LogOut } from "lucide-react"
import Link from "next/link"

type Props = {} & ComponentPropsWithoutRef<"div">

export default function AccountSidebar({ ...rest }: Props) {
    const name = "محمد الخلف"
    const email = "mohammad.onthefloor@gmail.com"

    return (
        <div className={clsx(styles.root, rest.className)} dir="rtl">
            <div className={clsx(styles.card, styles.profile)}>
                <p className={styles.nameWrapper}>
                    أهلاً <span className={styles.name}>{name}</span>
                </p>
                <p className={styles.email}>{email}</p>
            </div>

            <div className={styles.card}>
                <Link href={"/account/orders"} className={styles.link}>
                    <Package className={styles.icon} />
                    <p className={styles.text}>الطلبيات</p>
                </Link>
                <Link href={"/account/returns"} className={styles.link}>
                    <Undo2 className={styles.icon} />
                    <p className={styles.text}>الإرجاع</p>
                </Link>
                <Link href={"/account/profile"} className={styles.link}>
                    <User className={styles.icon} />
                    <p className={styles.text}>حسابك</p>
                </Link>
                <Link href={"/account/addresses"} className={styles.link}>
                    <MapPin className={styles.icon} />
                    <p className={styles.text}>العناوين</p>
                </Link>
                <Link href={"/account/security"} className={styles.link}>
                    <ShieldCheck className={styles.icon} />
                    <p className={styles.text}>إعدادات الأمان</p>
                </Link>
            </div>

            <div className={styles.card}>
                <Link href={"/account/logout"} className={clsx(styles.link, styles.logout)}>
                    <LogOut className={styles.icon} />
                    <p className={styles.text}>تسجيل الخروج</p>
                </Link>
            </div>
        </div>
    )
}
