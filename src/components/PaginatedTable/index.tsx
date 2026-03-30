"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginationButtons from "../PaginationButtons"
import React, { useMemo, useState, useTransition, useLayoutEffect } from "react"
import SearchBox2 from "../SearchBox2"
import SelectBox from "../form-elements/SelectBox"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { PageDataOptions, PageDataResponse, TableConfig, PageDataURLParams } from "@/types"
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
    fetchData: (params: PageDataOptions) => Promise<PageDataResponse<C["row"]>>
    renderItem: (item: C["row"], isPending: boolean) => React.ReactNode
}) {
    useSignals()

    const router = useRouter()
    const pathname = usePathname()
    const urlSearchParams = useSearchParams()

    // --- Read Initial State from URL using PageDataURLParams keys ---
    const urlPage = parseInt(urlSearchParams.get("page" satisfies PageDataURLParams) || "1") - 1
    const urlQuery = urlSearchParams.get("q" satisfies PageDataURLParams) || ""
    const urlCol =
        (urlSearchParams.get("searchCol" satisfies PageDataURLParams) as C["keys"]) ||
        defaultSearchColumn
    const urlSort =
        (urlSearchParams.get("sortCol" satisfies PageDataURLParams) as C["keys"]) ||
        defaultSortColumn
    const urlDir =
        (urlSearchParams.get("sortDir" satisfies PageDataURLParams) as "asc" | "desc") ||
        defaultSortDirection

    // --- State ---
    const [data, setData] = useState<C["row"][]>(initialData)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [currentPage, setCurrentPage] = useState(urlPage)

    const [searchQuery, setSearchQuery] = useState(urlQuery)
    const [searchColumn, setSearchColumn] = useState<C["keys"] | undefined>(urlCol)

    const [sortColumn, setSortColumn] = useState<C["keys"] | undefined>(urlSort)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(urlDir)

    const [isPending, startTransition] = useTransition()

    // Filter headers logic
    const searchableHeaders = useMemo(() => headers.filter((h) => h.searchable), [headers])
    const sortableHeaders = useMemo(() => headers.filter((h) => h.sortable), [headers])
    const visibleHeaders = useMemo(() => headers.filter((h) => !h.hidden), [headers])

    const effectiveSearchColumn =
        searchColumn ?? (searchableHeaders[0]?.value as C["keys"]) ?? ("" as C["keys"])
    const effectiveSortColumn =
        sortColumn ?? (sortableHeaders[0]?.value as C["keys"]) ?? ("" as C["keys"])

    // UI Signals
    const searchQuerySignal = useSignal<string>(searchQuery)
    const selectedColumnSignal = useSignal<C["keys"]>(effectiveSearchColumn)

    useLayoutEffect(() => {
        selectedColumnSignal.value = effectiveSearchColumn
        searchQuerySignal.value = searchQuery
    }, [effectiveSearchColumn, searchQuery])

    // --- Core Fetch Logic ---
    const loadData = (
        pageIndex: number,
        query: string,
        col: C["keys"],
        sCol: C["keys"],
        sDir: "asc" | "desc",
    ) => {
        // 1. Construct the PageDataOptions object using the exact type keys
        const params: PageDataOptions = {
            page: (pageIndex + 1).toString(),
            pageSize: pageSize.toString(),
            q: query || undefined,
            searchCol: (col as C["keys"]) || undefined,
            sortCol: (sCol as C["keys"]) || undefined,
            sortDir: sDir,
        }

        // 2. Sync to URL
        const newParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value) newParams.set(key, value)
        })

        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })

        // 3. Pass params DIRECTLY to fetchData
        startTransition(async () => {
            const result = await fetchData(params)

            setData(result.items)
            setTotalPages(result.totalPages)
            setCurrentPage(pageIndex)

            // Commit local state
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
                                    handleSearchSubmit(searchQuerySignal.value, newCol)
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
