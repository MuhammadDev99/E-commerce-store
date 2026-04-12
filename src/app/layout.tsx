import "./global.css"
import type { Metadata } from "next"
import { MessageRenderer } from "@/components/ShowMessage"
import SearchOverlay from "@/components/SearchOverlay"
import AddToCartNotification from "@/components/AddToCartNotification"
import MainWrapper from "@/components/MainWrapper"
import Script from "next/script" // Import Next.js Script component

export const dynamic = "force-dynamic"
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
        <html lang="ar" dir="rtl">
            {/* <head>
                <Script
                    src="https://goselljs.paythetap.com/v2.2.2/js/gosell.js"
                    strategy="beforeInteractive"
                />
            </head> */}
            <body>
                <AddToCartNotification />
                <SearchOverlay />
                <MessageRenderer />
                <MainWrapper>{children}</MainWrapper>
            </body>
        </html>
    )
}
