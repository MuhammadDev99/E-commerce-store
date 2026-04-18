import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import { Package, Undo2, User, MapPin, ShieldCheck, LogOut } from "lucide-react"
import Link from "next/link"
import { logMeOut } from "@/utils/db/user"
import { safe } from "@/utils/safe"
import { showMessage } from "@/utils/showMessage"
import { useRouter } from "next/navigation"
import { UserProfile } from "@/types"
import { User as UserType } from "@/types" // Use the User type from your types file
import { authClient } from "@/lib/auth-client"
import { cartCountSignal } from "@/signals"

type Props = { user: UserType } & ComponentPropsWithoutRef<"div">

export default function AccountSidebar({ user, ...rest }: Props) {
    const router = useRouter()
    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    // 2. Clear local signals
                    cartCountSignal.value = 0

                    // 3. Show message and redirect
                    showMessage({ type: "success", content: "تم تسجيل الخروج بنجاح" })

                    // 4. Force a refresh to ensure all Server Components sync up
                    router.push("/")
                    router.refresh()
                },
                onError: (ctx) => {
                    showMessage({ type: "error", content: ctx.error.message })
                },
            },
        })
    }

    return (
        <div className={clsx(styles.root, rest.className)} dir="rtl">
            <div className={clsx(styles.card, styles.profile)}>
                <p className={styles.nameWrapper}>
                    أهلاً <span className={styles.name}>{user.name}</span>
                </p>
                <p className={styles.email}>{user.email}</p>
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
                <a onClick={handleLogout} className={clsx(styles.link, styles.logout)}>
                    <LogOut className={styles.icon} />
                    <p className={styles.text}>تسجيل الخروج</p>
                </a>
            </div>
        </div>
    )
}
