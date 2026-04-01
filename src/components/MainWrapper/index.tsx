"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { usePathname } from "next/navigation"
import DashboardNavBar from "../DashboardNavBar"
import Navbar from "../Navbar"
import { getDisplayLanguage } from "@/utils"

export default function MainWrapper({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isDashboard = pathname.startsWith("/dashboard")
    const displayLanguage = getDisplayLanguage()

    return (
        // This wrapper now controls the layout flow
        <div
            className={clsx(
                styles.layoutWrapper,
                isDashboard && styles.dashboardLayout,
                styles[displayLanguage],
            )}
        >
            {isDashboard ? <DashboardNavBar /> : <Navbar />}

            <main
                className={clsx(
                    styles.container,
                    isDashboard ? styles.dashboard : styles.store,
                    className,
                )}
            >
                {children}
            </main>
        </div>
    )
}
