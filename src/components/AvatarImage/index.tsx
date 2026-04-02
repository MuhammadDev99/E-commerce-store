import clsx from "clsx"
import styles from "./style.module.css"
import { stringToRandom } from "@/utils"

export default function AvatarImage({
    src,
    name,
    className,
    userId,
}: {
    src?: string | null
    name: string
    userId: string
    className?: string
}) {
    const initial = name?.charAt(0).toUpperCase() || "?"
    const hue = stringToRandom(userId, 0, 360)
    console.log(hue)
    return (
        <div
            className={clsx(styles.root, className)}
            style={{
                backgroundColor: `hsl(${hue} 100% 40%)`,
            }}
        >
            {src ? (
                <img src={src} alt={name} className={styles.image} />
            ) : (
                <p className={styles.nameShort}>{initial}</p>
            )}
        </div>
    )
}
