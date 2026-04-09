"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { SearchSVG } from "@/images"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { ComponentPropsWithoutRef, useMemo } from "react"
import { debounced } from "@/utils"
import Loader from "../Loader"
type Props = {
    className?: string
    autoFocus?: boolean
    onSearch?: (query: string) => void
    onSearchSubmit?: (query: string) => void
    debounceMs?: number
    placeholder?: string
    isLoading?: boolean
    submitOnBlur?: boolean
} & ComponentPropsWithoutRef<"input">
export default function SearchBox2({
    className,
    autoFocus = false,
    onSearch,
    onSearchSubmit,
    debounceMs = 0,
    placeholder = "اكتب شيئاً للبحث",
    isLoading = false,
    submitOnBlur = true,
    ...rest
}: Props) {
    useSignals()
    const searchQuery = useSignal<string>("")

    const handleSearch = (query: string) => {
        onSearch?.(query)
    }

    const handleQueryChange =
        debounceMs === 0 ? handleSearch : useMemo(() => debounced(handleSearch, debounceMs), [])

    return (
        <div className={clsx(styles.root, className)}>
            {isLoading && <Loader className={styles.loader} />}
            <SearchSVG
                className={styles.icon}
                onClick={() => onSearchSubmit?.(searchQuery.value)}
            />
            <input
                {...rest}
                type="search"
                placeholder={placeholder}
                value={searchQuery.value}
                onChange={(e) => {
                    handleQueryChange(e.target.value)
                    searchQuery.value = e.target.value
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onSearchSubmit?.(searchQuery.value)
                    }
                }}
                // Added onBlur handler here
                onBlur={() => {
                    // if (searchQuery.value.trim() === "") {
                    //     onSearchSubmit?.()
                    // }
                    if (submitOnBlur) {
                        onSearchSubmit?.(searchQuery.value)
                    }
                }}
                autoFocus={autoFocus}
            />
        </div>
    )
}
