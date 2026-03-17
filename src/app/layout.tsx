import "./global.css"
import type { Metadata } from "next"
import Navbar from "./components/Navbar/Navbar"
import { MessageRenderer } from "@/components/ShowMessage"
import SearchOverlay from "@/components/SearchOverlay"
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
        <html lang="en">
            <body>
                <SearchOverlay />
                <MessageRenderer />
                <Navbar />
                <main>{children}</main>
            </body>
        </html>
    )
}
