"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { usePathname } from "next/navigation"
import DashboardNavBar from "../DashboardNavBar"
import Navbar from "../Navbar"
export default function MainWrapper({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isDashboard = pathname.startsWith("/dashboard")
    return (
        <>
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
        </>
    )
}
