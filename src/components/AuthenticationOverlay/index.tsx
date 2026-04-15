"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import { useSignals, useSignal } from "@preact/signals-react/runtime"
import LoginView from "../Views/LoginView"
type Props = {} & ComponentPropsWithoutRef<"div">

export default function AuthenticationOverlay({ ...rest }: Props) {
    useSignals()
    return (
        <div className={clsx(styles.root, rest.className)}>
            <LoginView className={styles.window} />
        </div>
    )
}
