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
} from "@/images"
import { Product } from "@/types"
import arabicProductsRaw from "./perfumes_arabic.json"
import NavCategory from "@/components/NavCatergory"
import { Text } from "@/external/my-library/components"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { useRouter } from "next/navigation"
import SearchOverlay from "@/components/SearchOverlay"
import { searchSignal } from "@/signals"
const arabicProducts = arabicProductsRaw as Product[]
const categories = [
    "الافضل مبيعاً",
    "عروض",
    "منتجات جديدة",
    "العطور",
    "زيوت",
    "العود",
    "عالم العربية للعود",
]

export default function Navbar() {
    const router = useRouter()

    const items = ["عود", "بخورات", "مسك", "رجالي"]
    return (
        <div className={styles.container}>
            <div className={styles.buttons}>
                <Image
                    src={accountImg}
                    alt="account"
                    className={styles.account}
                    onClick={() => router.push("/login")}
                />
                <Image
                    src={cartImg}
                    alt="cart"
                    className={styles.cart}
                    onClick={() => router.push("/cart")}
                />
                <Image
                    src={searchImg}
                    alt="search"
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
