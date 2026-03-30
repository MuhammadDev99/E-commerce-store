"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { SearchSVG } from "@/images"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { useMemo } from "react"
import { debounced } from "@/utils"

export default function SearchBox2({
    className,
    autoFocus = false,
    onSearch,
    onSearchSubmit,
    debounceMs = 0,
}: {
    className?: string
    autoFocus?: boolean
    onSearch: (query: string) => void
    onSearchSubmit: () => void
    debounceMs?: number
}) {
    useSignals()
    const searchQuery = useSignal<string>("")

    const handleSearch = (query: string) => {
        onSearch?.(query)
    }

    const handleQueryChange =
        debounceMs === 0 ? handleSearch : useMemo(() => debounced(handleSearch, debounceMs), [])

    return (
        <div className={clsx(styles.root, className)}>
            <SearchSVG className={styles.icon} onClick={onSearchSubmit} />
            <input
                type="search"
                placeholder="اكتب شيئاً للبحث"
                value={searchQuery.value}
                onChange={(e) => {
                    handleQueryChange(e.target.value)
                    searchQuery.value = e.target.value
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onSearchSubmit()
                    }
                }}
                // Added onBlur handler here
                onBlur={() => {
                    // if (searchQuery.value.trim() === "") {
                    //     onSearchSubmit()
                    // }
                    onSearchSubmit()
                }}
                autoFocus={autoFocus}
            />
        </div>
    )
}
