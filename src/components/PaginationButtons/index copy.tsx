"use client"
import { useLayoutEffect, useRef, useState, useCallback } from "react"
import clsx from "clsx"
import styles from "./style.module.css"
import Button from "../Button"
import { DownArrow2SVG } from "@/images"
import { useSignal, useSignals } from "@preact/signals-react/runtime"

export default function PaginationButtons2({
    className,
    onPage,
    pagesCount,
    selectedPage = 0,
}: {
    className?: string
    onPage: (id: number) => void
    pagesCount: number
    selectedPage: number
}) {
    useSignals()
    const containerRef = useRef<HTMLDivElement>(null)
    const prevBtnRef = useRef<HTMLDivElement>(null)
    const nextBtnRef = useRef<HTMLDivElement>(null)
    const hiddenListRef = useRef<HTMLDivElement>(null)

    const [visiblePages, setVisiblePages] = useState<number[]>([])
    const selectedPageSignal = useSignal<number>(selectedPage)

    useLayoutEffect(() => {
        selectedPageSignal.value = selectedPage
    }, [selectedPage])

    const calculateVisibleRange = useCallback(() => {
        const container = containerRef.current
        const prevBtn = prevBtnRef.current
        const nextBtn = nextBtnRef.current
        const hiddenList = hiddenListRef.current

        if (!container || !prevBtn || !nextBtn || !hiddenList) return

        // 1. Get exact container dimensions and padding
        const containerRect = container.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(container)
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
        const paddingRight = parseFloat(computedStyle.paddingRight) || 0
        const gap = parseFloat(computedStyle.gap) || 0

        // 2. Calculate the "Net" width available for content
        // Subtract a 2px safety buffer for sub-pixel rendering/rounding
        const innerWidth = containerRect.width - paddingLeft - paddingRight - 2

        // 3. Subtract widths of side buttons and the 2 gaps separating them from numbers
        const prevWidth = prevBtn.getBoundingClientRect().width
        const nextWidth = nextBtn.getBoundingClientRect().width
        const availableForNumbers = innerWidth - prevWidth - nextWidth - gap * 2

        // 4. Measure each button width from the hidden measurement layer
        const allButtons = Array.from(hiddenList.children) as HTMLElement[]
        const buttonWidths = allButtons.map((btn) => btn.getBoundingClientRect().width)

        /**
         * Helper: Calculates total width required for a specific set of indices
         * including the gaps between them.
         */
        const getRequiredWidth = (indices: number[]) => {
            if (indices.length === 0) return 0
            const totalBtnWidth = indices.reduce((sum, idx) => sum + buttonWidths[idx], 0)
            const totalGaps = (indices.length - 1) * gap
            return totalBtnWidth + totalGaps
        }

        // Check if all fit
        const allIndices = Array.from({ length: pagesCount }, (_, i) => i)
        if (getRequiredWidth(allIndices) <= availableForNumbers) {
            setVisiblePages(allIndices)
            return
        }

        // 5. Check "Pin First/Last" logic (Min 4 buttons)
        // We find the max number of buttons that can fit
        const avgBtnWidth = buttonWidths.reduce((a, b) => a + b, 0) / pagesCount
        const estimatedMaxFit = Math.floor((availableForNumbers + gap) / (avgBtnWidth + gap))

        if (estimatedMaxFit >= 4) {
            const firstIdx = 0
            const lastIdx = pagesCount - 1

            let start = selectedPageSignal.value
            let end = selectedPageSignal.value

            // Greedily expand from selected page, respecting First/Last pins
            while (true) {
                const canL = start > firstIdx + 1
                const canR = end < lastIdx - 1
                if (!canL && !canR) break

                if (canR) {
                    const testSet = Array.from(
                        new Set([
                            firstIdx,
                            ...Array.from({ length: end - start + 2 }, (_, i) => start + i),
                            lastIdx,
                        ]),
                    ).sort((a, b) => a - b)
                    if (getRequiredWidth(testSet) <= availableForNumbers) end++
                    else break
                }
                if (canL) {
                    const testSet = Array.from(
                        new Set([
                            firstIdx,
                            ...Array.from({ length: end - start + 2 }, (_, i) => start - 1 + i),
                            lastIdx,
                        ]),
                    ).sort((a, b) => a - b)
                    if (getRequiredWidth(testSet) <= availableForNumbers) start--
                    else break
                }
            }

            const resultSet = new Set<number>([firstIdx, lastIdx])
            for (let i = start; i <= end; i++) resultSet.add(i)
            setVisiblePages(Array.from(resultSet).sort((a, b) => a - b))
        } else {
            // Fallback sliding window (for very small screens)
            let start = selectedPageSignal.value
            let end = selectedPageSignal.value
            while (true) {
                const canR = end < pagesCount - 1
                const canL = start > 0
                if (canR) {
                    const test = Array.from({ length: end - start + 2 }, (_, i) => start + i)
                    if (getRequiredWidth(test) <= availableForNumbers) end++
                    else break
                }
                if (canL) {
                    const test = Array.from({ length: end - start + 2 }, (_, i) => start - 1 + i)
                    if (getRequiredWidth(test) <= availableForNumbers) start--
                    else break
                }
                if (!canL && !canR) break
            }
            setVisiblePages(Array.from({ length: end - start + 1 }, (_, i) => start + i))
        }
    }, [pagesCount, selectedPageSignal.value])

    useLayoutEffect(() => {
        const observer = new ResizeObserver(calculateVisibleRange)
        if (containerRef.current) observer.observe(containerRef.current)
        calculateVisibleRange()
        return () => observer.disconnect()
    }, [calculateVisibleRange])

    return (
        <div ref={containerRef} className={clsx(styles.root, className)}>
            {/* Hidden Measurement Layer: Must match the style of visible buttons exactly */}
            <div className={styles.hiddenMeasurement} ref={hiddenListRef} aria-hidden="true">
                {Array.from({ length: pagesCount }).map((_, i) => (
                    <Button key={i} className={styles.button}>
                        {i + 1}
                    </Button>
                ))}
            </div>

            <div ref={prevBtnRef} className={styles.sideButton}>
                <Button
                    onClick={() => {
                        const target = selectedPageSignal.value - 1
                        if (target >= 0) {
                            selectedPageSignal.value = target
                            onPage(target)
                        }
                    }}
                    icon={DownArrow2SVG}
                    iconRotationDeg={-90}
                    disabled={selectedPageSignal.value === 0}
                >
                    السابق
                </Button>
            </div>

            <div className={styles.numberedButtons}>
                {pagesCount > 1 &&
                    visiblePages.map((pageIndex) => (
                        <Button
                            key={pageIndex}
                            className={clsx(
                                styles.button,
                                selectedPageSignal.value === pageIndex && styles.selected,
                            )}
                            type={selectedPageSignal.value === pageIndex ? "primary" : "normal"}
                            onClick={() => {
                                onPage(pageIndex)
                                selectedPageSignal.value = pageIndex
                            }}
                        >
                            {pageIndex + 1}
                        </Button>
                    ))}
            </div>

            <div ref={nextBtnRef} className={styles.sideButton}>
                <Button
                    onClick={() => {
                        const target = selectedPageSignal.value + 1
                        if (target < pagesCount) {
                            selectedPageSignal.value = target
                            onPage(target)
                        }
                    }}
                    icon={DownArrow2SVG}
                    iconRotationDeg={90}
                    flipIconOrder={true}
                    disabled={selectedPageSignal.value === pagesCount - 1}
                >
                    التالي
                </Button>
            </div>
        </div>
    )
}
