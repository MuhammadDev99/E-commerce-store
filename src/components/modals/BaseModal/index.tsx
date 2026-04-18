"use client"

import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef, useRef, useEffect } from "react" // Added useEffect
import { useSignals } from "@preact/signals-react/runtime"

type Props = { onOutsideClick?: () => void } & ComponentPropsWithoutRef<"div">

export default function BaseModal({ onOutsideClick, ...rest }: Props) {
    useSignals()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (e.target === containerRef.current) {
                console.log("Backdrop clicked - closing")
                onOutsideClick?.()
            }
        }

        document.addEventListener("mousedown", handleOutsideClick)
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick)
        }
    }, [onOutsideClick])

    return (
        <div {...rest} ref={containerRef} className={clsx(styles.root, rest.className)}>
            {rest.children}
        </div>
    )
}
