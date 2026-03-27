"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginationButtons from "../PaginationButtons"
import React, { useMemo } from "react"
import SearchBox2 from "../SearchBox2"
import SelectBox from "../form-elements/SelectBox"
import { useSignal } from "@preact/signals-react"
import { useSignals } from "@preact/signals-react/runtime"
import { TableHeader } from "@/types"
import Button from "../Button"
import { DownArrowSVG } from "@/images"

// We add <V extends string> to make the component type-safe
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
}: {
    className?: string
    headers: TableHeader<V>[] // Use the generic V
    items: React.ReactNode
    gridTemplate?: string
    pagesCount: number
    currentPage?: number
    onPageChange: (page: number) => void
    onSearch: (query: string, column: V) => void // Strictly typed column
    onSearchSubmit: () => void
    label?: string
}) {
    useSignals()

    // 1. Only allow searching on columns marked 'searchable: true'
    const searchableHeaders = useMemo(() => headers.filter((h) => h.searchable), [headers])

    // 2. Default the signal to the first searchable column
    const selectedColumnSignal = useSignal<V>(
        searchableHeaders[0]?.value ?? (headers[0]?.value as V),
    )

    const effectiveGridTemplate = gridTemplate ?? `repeat(${headers.length}, 1fr)`

    return (
        <div
            className={clsx(styles.root, className)}
            style={{ "--grid-template": effectiveGridTemplate } as React.CSSProperties}
        >
            {label && <p className={styles.title}>{label}</p>}

            <div className={styles.searchWrapper}>
                <SearchBox2
                    onSearch={(query) => onSearch(query, selectedColumnSignal.value)}
                    onSearchSubmit={onSearchSubmit}
                    className={styles.search}
                />

                {/* 3. Dropdown only shows searchable columns */}
                <div className={styles.searchOptions}>
                    {searchableHeaders.length > 0 && (
                        <div className={styles.searchFilterWrapper}>
                            <p>داخل</p>
                            <SelectBox
                                options={searchableHeaders.map((header) => ({
                                    display: header.display,
                                    value: header.value,
                                }))}
                                onChange={(e) => (selectedColumnSignal.value = e.target.value as V)}
                                value={selectedColumnSignal.value}
                            />
                        </div>
                    )}
                    {
                        <div className={styles.searchSortWrapper}>
                            <p>رتب حسب</p>
                            <SelectBox
                                options={searchableHeaders.map((header) => ({
                                    display: header.display,
                                    value: header.value,
                                }))}
                                onChange={(e) => (selectedColumnSignal.value = e.target.value as V)}
                                value={selectedColumnSignal.value}
                            />
                            <div className={styles.sortDirectionButtons}>
                                <Button icon={DownArrowSVG} iconRotationDeg={180} type="primary" />
                                <Button icon={DownArrowSVG} />
                            </div>
                        </div>
                    }
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
