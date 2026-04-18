import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    // 1. Fetch the session on the server
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    // 2. If no session exists, redirect to the root
    if (!session || session.user.role !== "admin") {
        redirect("/")
    }

    // 3. If authenticated, render the account pages
    return <>{children}</>
}
