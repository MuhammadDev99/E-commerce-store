"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginationButtons from "../PaginationButtons"
import React, { useMemo, useState, useTransition, useLayoutEffect } from "react"
import SearchBox2 from "../SearchBox2"
import SelectBox from "../form-elements/SelectBox"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { TableHeader } from "@/types"
import Button from "../Button"
import { DownArrowSVG } from "@/images"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export default function PaginatedTable<T, V extends string>({
    className,
    headers,
    gridTemplate,
    label,
    initialData,
    initialTotalPages,
    pageSize = 10,
    initialSearchQuery = "",
    initialSearchColumn,
    initialSortColumn,
    initialSortDirection = "desc",
    fetchData,
    renderItem,
}: {
    className?: string
    headers: TableHeader<V>[]
    gridTemplate?: string
    label?: string
    initialData: T[]
    initialTotalPages: number
    pageSize?: number
    initialSearchQuery?: string
    initialSearchColumn?: V
    initialSortColumn?: V
    initialSortDirection?: "asc" | "desc"
    fetchData: (params: {
        page: number
        pageSize: number
        query: string
        searchColumn: V
        sortColumn: V
        sortDirection: "asc" | "desc"
    }) => Promise<{ items: T[]; totalPages: number }>
    renderItem: (item: T, isPending: boolean) => React.ReactNode
}) {
    useSignals()

    const router = useRouter()
    const pathname = usePathname()
    const urlSearchParams = useSearchParams()

    // --- State ---
    const [data, setData] = useState<T[]>(initialData)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [currentPage, setCurrentPage] = useState(0)

    const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
    const [searchColumn, setSearchColumn] = useState<V | undefined>(initialSearchColumn)

    const [sortColumn, setSortColumn] = useState<V | undefined>(initialSortColumn)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(initialSortDirection)

    const [isPending, startTransition] = useTransition()

    // 1. Filter out columns explicitly marked as `databaseSupport: false` for logic
    const searchableHeaders = useMemo(
        () => headers.filter((h) => h.searchable && h.databaseSupport !== false),
        [headers],
    )

    const sortableHeaders = useMemo(
        () => headers.filter((h) => h.sortable && h.databaseSupport !== false),
        [headers],
    )

    // 2. Filter out hidden headers for visual rendering
    const visibleHeaders = useMemo(() => headers.filter((h) => !h.hidden), [headers])

    // Fallbacks if undefined
    const effectiveSearchColumn = searchColumn ?? (searchableHeaders[0]?.value as V) ?? ("" as V)
    const effectiveSortColumn = sortColumn ?? (sortableHeaders[0]?.value as V) ?? ("" as V)

    // Signals solely responsible for UI intermediate states
    const searchQuerySignal = useSignal<string>(searchQuery)
    const selectedColumnSignal = useSignal<V>(effectiveSearchColumn)

    // Sync Signals with committed state when navigating pages or re-rendering with new states
    useLayoutEffect(() => {
        selectedColumnSignal.value = effectiveSearchColumn
        searchQuerySignal.value = searchQuery
    }, [effectiveSearchColumn, searchQuery, selectedColumnSignal, searchQuerySignal])

    // --- Core Fetch Logic ---
    const loadData = (pageIndex: number, query: string, col: V, sCol: V, sDir: "asc" | "desc") => {
        const newParams = new URLSearchParams(urlSearchParams.toString())

        if (query) newParams.set("q", query)
        else newParams.delete("q")

        if (col) newParams.set("col", col)
        else newParams.delete("col")

        if (sCol) newParams.set("sort", sCol)
        else newParams.delete("sort")

        if (sDir) newParams.set("dir", sDir)
        else newParams.delete("dir")

        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })

        startTransition(async () => {
            const result = await fetchData({
                page: pageIndex + 1, // 1-based indexing for server endpoints
                pageSize,
                query,
                searchColumn: col,
                sortColumn: sCol,
                sortDirection: sDir,
            })
            setData(result.items)
            setTotalPages(result.totalPages)
            setCurrentPage(pageIndex)

            // Commit to active state
            setSearchQuery(query)
            setSearchColumn(col)
            setSortColumn(sCol)
            setSortDirection(sDir)
        })
    }

    // --- Handlers ---
    const handlePageChange = (page: number) => {
        // use last submitted values for searching to prevent un-submitted typing from affecting pagination
        loadData(page, searchQuery, effectiveSearchColumn, effectiveSortColumn, sortDirection)
    }

    const handleSearchSubmit = (query: string, col: V) => {
        loadData(0, query, col, effectiveSortColumn, sortDirection)
    }

    const handleSortChange = (col: V, dir: "asc" | "desc") => {
        loadData(0, searchQuery, effectiveSearchColumn, col, dir)
    }

    const effectiveGridTemplate = gridTemplate ?? `repeat(${visibleHeaders.length}, 1fr)`

    return (
        <div
            className={clsx(styles.root, className)}
            style={{ "--grid-template": effectiveGridTemplate } as React.CSSProperties}
        >
            {label && <p className={styles.title}>{label}</p>}

            <div className={styles.searchWrapper}>
                <SearchBox2
                    onSearch={(query) => {
                        searchQuerySignal.value = query
                    }}
                    onSearchSubmit={() =>
                        handleSearchSubmit(searchQuerySignal.value, selectedColumnSignal.value)
                    }
                    className={styles.search}
                />

                <div className={styles.searchOptions}>
                    {searchableHeaders.length > 0 && (
                        <div className={styles.searchFilterWrapper}>
                            <p>داخل</p>
                            <SelectBox
                                options={searchableHeaders.map((header) => ({
                                    display: header.display,
                                    value: header.value,
                                }))}
                                onChange={(e) => {
                                    const newCol = e.target.value as V
                                    selectedColumnSignal.value = newCol
                                }}
                                value={selectedColumnSignal.value}
                            />
                        </div>
                    )}
                    {sortableHeaders.length > 0 && (
                        <div className={styles.searchSortWrapper}>
                            <p>رتب حسب</p>
                            <SelectBox
                                options={sortableHeaders.map((header) => ({
                                    display: header.display,
                                    value: header.value,
                                }))}
                                onChange={(e) =>
                                    handleSortChange(e.target.value as V, sortDirection)
                                }
                                value={effectiveSortColumn}
                            />
                            <div className={styles.sortDirectionButtons}>
                                <Button
                                    icon={DownArrowSVG}
                                    iconRotationDeg={180}
                                    type={sortDirection === "asc" ? "primary" : "normal"}
                                    onClick={() => handleSortChange(effectiveSortColumn, "asc")}
                                />
                                <Button
                                    icon={DownArrowSVG}
                                    type={sortDirection === "desc" ? "primary" : "normal"}
                                    onClick={() => handleSortChange(effectiveSortColumn, "desc")}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.header}>
                {visibleHeaders.map((header) => (
                    <p key={header.value}>{header.display}</p>
                ))}
            </div>

            <div className={styles.items}>{data.map((item) => renderItem(item, isPending))}</div>

            <PaginationButtons
                className={styles.pagination}
                onPage={handlePageChange}
                selectedPage={currentPage}
                pagesCount={totalPages}
            />
        </div>
    )
}
