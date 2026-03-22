import clsx from "clsx"
import styles from "./style.module.css"
export default function SampleDisplay({ className }: { className?: string }) {
    return (
        <div className={clsx(styles.root, className)}>
            <h1>Sample</h1>
        </div>
    )
}
