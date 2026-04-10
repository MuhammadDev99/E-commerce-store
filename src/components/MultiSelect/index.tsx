import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import { useSignal, useSignals } from "@preact/signals-react/runtime"

// If you are using TypeScript older than 5.4, add this line:
// type NoInfer<T> = [T][T extends any ? 0 : never];

type Props<T extends string | number> = {
    title?: string
    items: { label: string; value: T; icon?: React.ElementType }[]

    // 👇 Wrap T in NoInfer so TypeScript only guesses T from 'items'
    value?: NoInfer<T>
    onChange?: (value: T) => void
} & Omit<ComponentPropsWithoutRef<"div">, "onChange">

export default function MultiSelect<T extends string | number>({
    onChange,
    title,
    items,
    value,
    ...rest
}: Props<T>) {
    useSignals()
    const valueSignal = useSignal<T | undefined>(value)

    return (
        <div className={clsx(styles.root, rest.className)}>
            <h4 className={styles.title}>{title}</h4>
            <div className={styles.items}>
                {items.map(({ label, value: itemValue, icon: Icon }) => {
                    return (
                        <div
                            key={itemValue}
                            className={clsx(
                                styles.item,
                                valueSignal.value === itemValue ? styles.selected : "",
                            )}
                            onClick={() => {
                                valueSignal.value = itemValue
                                onChange?.(itemValue)
                            }}
                        >
                            {Icon && <Icon className={styles.icon} />}
                            <p className={styles.label}>{label}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
