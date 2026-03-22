import "./global.css"
import type { Metadata } from "next"
import Navbar from "@/components/Navbar"
import { MessageRenderer } from "@/components/ShowMessage"
import SearchOverlay from "@/components/SearchOverlay"
import AddToCartNotification from "@/components/AddToCartNotification"
import DashboardNavBar from "@/components/DashboardNavBar"
import MainWrapper from "@/components/MainWrapper"
export const revalidate = 0
export const metadata: Metadata = {
    title: "Store",
    description: "My Store",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html>
            <body>
                <AddToCartNotification />
                <SearchOverlay />
                <MessageRenderer />
                <MainWrapper>{children}</MainWrapper>
            </body>
        </html>
    )
}
