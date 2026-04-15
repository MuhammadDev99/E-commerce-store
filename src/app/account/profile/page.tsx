"use server"
import ProfileClient from "@/components/PagesClient/ProfileClient"
import { auth } from "@/lib/auth"
import { UserProfile } from "@/types"
import { headers } from "next/headers"

export default async function ProfilePage() {
    const session = await auth.api.getSession({ headers: await headers() })
    return <ProfileClient profile={session?.user as UserProfile} />
}
