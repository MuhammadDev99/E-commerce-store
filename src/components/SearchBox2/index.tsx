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
}: {
    className?: string
    autoFocus?: boolean
    onSearch: (query: string) => void
    onSearchSubmit: () => void
}) {
    useSignals()
    const searchQuery = useSignal<string>("")
    const handleSearch = (query: string) => {
        if (query.trim()) {
            onSearch?.(query)
        }
    }
    const handleQueryChange = useMemo(() => debounced(handleSearch, 400), [])
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
                    if (e.key === "Enter" && searchQuery.value.trim()) {
                        onSearchSubmit()
                    }
                }}
                autoFocus={autoFocus}
            />
        </div>
    )
}
