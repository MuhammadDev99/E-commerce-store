// components/PaginatedTable/index.tsx
"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginationButtons from "../PaginationButtons"
import React, { useMemo, useLayoutEffect } from "react"
import SearchBox2 from "../SearchBox2"
import SelectBox from "../form-elements/SelectBox"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { TableHeader } from "@/types"
import Button from "../Button"
import { DownArrowSVG } from "@/images"

export default function PaginatedTable<V extends string>({
    className,
    headers,
    items,
    gridTemplate,
    pagesCount,
    currentPage = 0,
    onPageChange,
    onSearch,
    onSearchSubmit,
    label,
    searchQuery = "",
    searchColumn,
    sortColumn,
    sortDirection,
    onSortChange,
}: {
    className?: string
    headers: TableHeader<V>[]
    items: React.ReactNode
    gridTemplate?: string
    pagesCount: number
    currentPage?: number
    onPageChange: (page: number) => void
    onSearch: (query: string, column: V) => void
    // 1. UPDATED: Accept the query and column directly
    onSearchSubmit: (query: string, column: V) => void
    label?: string
    searchQuery?: string
    searchColumn?: V
    sortColumn?: V
    sortDirection?: "asc" | "desc"
    onSortChange?: (column: V, direction: "asc" | "desc") => void
}) {
    useSignals()

    const searchableHeaders = useMemo(
        () => headers.filter((h) => h.searchable && h.databaseSupport !== false),
        [headers],
    )

    const sortableHeaders = useMemo(
        () => headers.filter((h) => h.sortable && h.databaseSupport !== false),
        [headers],
    )

    const searchQuerySignal = useSignal<string>(searchQuery)
    const selectedColumnSignal = useSignal<V>(
        searchColumn ?? searchableHeaders[0]?.value ?? (headers[0]?.value as V),
    )

    useLayoutEffect(() => {
        if (searchColumn) selectedColumnSignal.value = searchColumn
        if (searchQuery !== undefined) searchQuerySignal.value = searchQuery
    }, [searchColumn, searchQuery, selectedColumnSignal, searchQuerySignal])

    const effectiveGridTemplate = gridTemplate ?? `repeat(${headers.length}, 1fr)`

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
                        onSearch(query, selectedColumnSignal.value)
                    }}
                    // 2. UPDATED: Pass the fresh signal values straight into the submit function
                    onSearchSubmit={() =>
                        onSearchSubmit(searchQuerySignal.value, selectedColumnSignal.value)
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
                                    onSearch(searchQuerySignal.value, newCol)
                                }}
                                value={selectedColumnSignal.value}
                            />
                        </div>
                    )}
                    {sortableHeaders.length > 0 && onSortChange && sortColumn && sortDirection && (
                        <div className={styles.searchSortWrapper}>
                            <p>رتب حسب</p>
                            <SelectBox
                                options={sortableHeaders.map((header) => ({
                                    display: header.display,
                                    value: header.value,
                                }))}
                                onChange={(e) => onSortChange(e.target.value as V, sortDirection)}
                                value={sortColumn}
                            />
                            <div className={styles.sortDirectionButtons}>
                                <Button
                                    icon={DownArrowSVG}
                                    iconRotationDeg={180}
                                    type={sortDirection === "asc" ? "primary" : "normal"}
                                    onClick={() => onSortChange(sortColumn, "asc")}
                                />
                                <Button
                                    icon={DownArrowSVG}
                                    type={sortDirection === "desc" ? "primary" : "normal"}
                                    onClick={() => onSortChange(sortColumn, "desc")}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.header}>
                {headers.map((header) => (
                    <p key={header.value}>{header.display}</p>
                ))}
            </div>

            <div className={styles.items}>{items}</div>

            <PaginationButtons
                className={styles.pagination}
                onPage={onPageChange}
                selectedPage={currentPage}
                pagesCount={pagesCount}
            />
        </div>
    )
}
