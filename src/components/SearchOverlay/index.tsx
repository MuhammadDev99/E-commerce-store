"use client"
import { languageSignal, searchSignal } from "@/signals"
import styles from "./style.module.css"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { SearchSVG } from "@/images"
import clsx from "clsx"
import { MOCK_PRODUCTS } from "@/mockData"
import { debounced } from "@/utils"
import { useMemo, useEffect, useRef } from "react" // 1. Added useRef and useEffect
import SearchResult from "../SearchResult"
import { Product } from "@/types"

export default function SearchOverlay() {
    useSignals()
    const searchResults = useSignal<Product[]>([])
    const searchQuery = useSignal<string>("")

    // 2. Create a ref for the panel
    const panelRef = useRef<HTMLDivElement>(null)

    const handleQueryChange = useMemo(
        () =>
            debounced((query: string) => {
                searchResults.value = MOCK_PRODUCTS.filter((product) =>
                    product.title.toLowerCase().includes(query.toLowerCase()),
                )
            }, 400),
        [],
    )

    // 3. Effect to detect clicks outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // If the search is open and the click target is NOT inside the panelRef
            if (
                searchSignal.value &&
                panelRef.current &&
                !panelRef.current.contains(event.target as Node)
            ) {
                searchSignal.value = false
            }
        }

        // Add listener
        document.addEventListener("mousedown", handleClickOutside)

        // Cleanup listener on unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    if (!searchSignal.value) return null

    return (
        <div className={clsx(styles.container, styles[languageSignal.value])}>
            {/* 4. Attach the ref to the panel element */}
            <div className={styles.panel} ref={panelRef}>
                <div className={styles.search}>
                    <SearchSVG className={styles.icon} />
                    <input
                        type="search"
                        placeholder="اكتب شيئاً للبحث"
                        value={searchQuery.value}
                        onChange={(e) => {
                            handleQueryChange(e.target.value)
                            searchQuery.value = e.target.value
                        }}
                        autoFocus // Good UX: focus input when overlay opens
                    />
                </div>
                {searchQuery.value && (
                    <div className={styles.results}>
                        {searchResults.value.length === 0 ? (
                            <p className={styles.noResults}>لا نتائج</p>
                        ) : (
                            searchResults.value.map((product) => {
                                return <SearchResult key={product.id} product={product} />
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
