"use client" // 1. Must be a client component to use hooks
import Link from "next/link"
import NavButtonDisplay from "@/components/NavButton"
import styles from "./style.module.css"
import Image from "next/image"
// 2. Import the authClient
import { authClient } from "@/lib/auth-client"
import {
    cartImg,
    accountImg,
    searchImg,
    DashboardNav,
    HomeNav,
    loginNav,
    logoHorizontal,
    registerNav,
    PersonCircleSVG,
    ShoppingCartSVG,
    MagnifyingGlassSVG,
} from "@/images"
import { Product } from "@/types"
import arabicProductsRaw from "./perfumes_arabic.json"
import NavCategory from "@/components/NavCatergory"
import { Text } from "@/external/my-library/components"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { useRouter } from "next/navigation"
import SearchOverlay from "@/components/SearchOverlay"
import { cartCountSignal, searchSignal } from "@/signals"
import { useEffect } from "react"
import { getCartCount } from "@/utils/db/user"
import clsx from "clsx"
const categories = [
    "الافضل مبيعاً",
    "عروض",
    "منتجات جديدة",
    "العطور",
    "زيوت",
    "العود",
    "عالم العربية للعود",
]

export default function Navbar({ className }: { className?: string }) {
    useSignals() // 1. Enable signals reactivity
    const router = useRouter()
    const { data: session } = authClient.useSession()

    // 2. Fetch cart count on mount or when session changes
    useEffect(() => {
        if (session) {
            getCartCount().then((count) => {
                cartCountSignal.value = count
            })
        } else {
            cartCountSignal.value = 0
        }
    }, [session])
    const items = ["عود", "بخورات", "مسك", "رجالي"]
    return (
        <div className={clsx(styles.container, className)}>
            <div className={styles.buttons}>
                <Link href={"/account/profile"} className={styles.accountWrapper}>
                    <PersonCircleSVG className={styles.account} />
                    {session && <p className={styles.name}>{session.user.name.split(" ")[0]}</p>}
                </Link>

                <Link href={"/cart"} className={styles.cartWrapper}>
                    {session && cartCountSignal.value > 0 && (
                        <p className={styles.count}>{cartCountSignal.value}</p>
                    )}
                    <ShoppingCartSVG className={styles.account} />
                </Link>
                <MagnifyingGlassSVG
                    className={styles.account}
                    onClick={() => (searchSignal.value = !searchSignal.value)}
                />
            </div>
            <div className={styles.categories}>
                {categories.map((category: string) => {
                    return (
                        <NavCategory items={items} key={category}>
                            {category}
                        </NavCategory>
                    )
                })}
            </div>

            <Image
                src={logoHorizontal}
                alt="logo"
                className={styles.logo}
                onClick={() => router.push("/")}
            />
        </div>
    )
}
