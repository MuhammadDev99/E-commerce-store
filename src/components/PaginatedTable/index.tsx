"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginationButtons from "../PaginationButtons"
import React, { useMemo, useState, useTransition, useLayoutEffect } from "react"
import SearchBox2 from "../SearchBox2"
import SelectBox from "../form-elements/SelectBox"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { PageDataOptions, PageDataResponse, TableConfig } from "@/types"
import Button from "../Button"
import { DownArrowSVG } from "@/images"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export default function PaginatedTable<C extends TableConfig>({
    className,
    headers,
    gridTemplate,
    label,
    initialData,
    initialTotalPages,
    pageSize = 10,
    defaultSearchColumn,
    defaultSortColumn,
    defaultSortDirection = "desc",
    fetchData,
    renderItem,
}: {
    className?: string
    headers: C["headers"][]
    gridTemplate?: string
    label?: string
    initialData: C["row"][]
    initialTotalPages: number
    pageSize?: number
    defaultSearchColumn?: C["keys"]
    defaultSortColumn?: C["keys"]
    defaultSortDirection?: "asc" | "desc"
    fetchData: (params: PageDataOptions<C["keys"]>) => Promise<PageDataResponse<C["row"]>>
    renderItem: (item: C["row"], isPending: boolean) => React.ReactNode
}) {
    useSignals()

    const router = useRouter()
    const pathname = usePathname()
    const urlSearchParams = useSearchParams()

    // --- Read Initial State directly from URL Fallbacks ---
    const urlPage = parseInt(urlSearchParams.get("page") || "1") - 1
    const urlQuery = urlSearchParams.get("q") || ""
    const urlCol = (urlSearchParams.get("col") as C["keys"]) || defaultSearchColumn
    const urlSort = (urlSearchParams.get("sort") as C["keys"]) || defaultSortColumn
    const urlDir = (urlSearchParams.get("dir") as "asc" | "desc") || defaultSortDirection

    // --- State ---
    const [data, setData] = useState<C["row"][]>(initialData)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [currentPage, setCurrentPage] = useState(urlPage)

    const [searchQuery, setSearchQuery] = useState(urlQuery)
    const [searchColumn, setSearchColumn] = useState<C["keys"] | undefined>(urlCol)

    const [sortColumn, setSortColumn] = useState<C["keys"] | undefined>(urlSort)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(urlDir)

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

    const visibleHeaders = useMemo(() => headers.filter((h) => !h.hidden), [headers])

    // Fallbacks if undefined
    const effectiveSearchColumn =
        searchColumn ?? (searchableHeaders[0]?.value as C["keys"]) ?? ("" as C["keys"])
    const effectiveSortColumn =
        sortColumn ?? (sortableHeaders[0]?.value as C["keys"]) ?? ("" as C["keys"])

    // Signals solely responsible for UI intermediate states
    const searchQuerySignal = useSignal<string>(searchQuery)
    const selectedColumnSignal = useSignal<C["keys"]>(effectiveSearchColumn)

    // Sync Signals with committed state when navigating pages or re-rendering with new states
    useLayoutEffect(() => {
        selectedColumnSignal.value = effectiveSearchColumn
        searchQuerySignal.value = searchQuery
    }, [effectiveSearchColumn, searchQuery, selectedColumnSignal, searchQuerySignal])

    // --- Core Fetch Logic ---
    const loadData = (
        pageIndex: number,
        query: string,
        col: C["keys"],
        sCol: C["keys"],
        sDir: "asc" | "desc",
    ) => {
        const newParams = new URLSearchParams(urlSearchParams.toString())

        // Save everything to URL so browser refresh keeps the state intact
        if (pageIndex > 0) newParams.set("page", (pageIndex + 1).toString())
        else newParams.delete("page")
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
        loadData(page, searchQuery, effectiveSearchColumn, effectiveSortColumn, sortDirection)
    }

    const handleSearchSubmit = (query: string, col: C["keys"]) => {
        loadData(0, query, col, effectiveSortColumn, sortDirection)
    }

    const handleSortChange = (col: C["keys"], dir: "asc" | "desc") => {
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
                                    const newCol = e.target.value as C["keys"]
                                    selectedColumnSignal.value = newCol
                                    handleSearchSubmit(
                                        searchQuerySignal.value,
                                        selectedColumnSignal.value,
                                    )
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
                                    handleSortChange(e.target.value as C["keys"], sortDirection)
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
