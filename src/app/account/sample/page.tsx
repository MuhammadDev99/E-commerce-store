import styles from "./style.module.css"
import clsx from "clsx"

export default function SamplePage() {
    return (
        <div className={clsx(styles.page)}>
            <h1>Sample Page!</h1>
        </div>
    )
}
