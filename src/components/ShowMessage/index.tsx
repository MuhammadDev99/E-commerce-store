"use client"
import styles from "./style.module.css"
import { useSignals } from "@preact/signals-react/runtime"
import { messagesSignal } from "@/signals"
import { MessageUI } from "@/types"
import clsx from "clsx"
export function MessageRenderer() {
    useSignals()
    const messages = messagesSignal.value
    return (
        <div className={styles.messages}>
            {messages.map((message) => (
                <div key={message.id!} className={clsx(styles.message, styles[message.type])}>
                    {message.title && <p className={styles.title}>{message.title}</p>}
                    {message.content && <p className={styles.content}>{message.content}</p>}
                </div>
            ))}
        </div>
    )
}
