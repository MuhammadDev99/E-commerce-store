"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { usePathname } from "next/navigation"
import DashboardNavBar from "../NavigationBars/DashboardNavBar"
import Navbar from "../NavigationBars/Navbar"
import { getDisplayLanguage } from "@/utils"
import AccountSidebar from "../NavigationBars/AccountSidebar"

export default function MainWrapper({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isDashboard = pathname.startsWith("/dashboard")
    const isAccount = pathname.startsWith("/account")
    const displayLanguage = getDisplayLanguage()

    return (
        <main className={clsx(styles.root, className, styles[displayLanguage])}>
            <div className={styles.topNav}>
                {!isDashboard && <Navbar className={styles.mainNav} />}
            </div>
            <div className={styles.mainContainer}>
                <div className={styles.sideBar}>
                    {isAccount && <AccountSidebar className={styles.accountNav} />}
                    {isDashboard && <DashboardNavBar className={styles.dashboardNav} />}
                </div>
                <div className={styles.contentBody}>{children}</div>
            </div>
        </main>
    )
}
