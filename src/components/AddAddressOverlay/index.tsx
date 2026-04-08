import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import Button from "../Button"
import SearchBox2 from "../SearchBox2"
import { Locate, LocateFixed, LocateFixedIcon, LocateIcon } from "lucide-react"
type Props = {} & ComponentPropsWithoutRef<"div">

export default function AddAddressOverlay({ ...rest }: Props) {
    return (
        <div className={clsx(styles.root, rest.className)}>
            <div className={styles.window}>
                <div className={styles.header}>
                    <h3>إضافة عنوان جديد</h3>
                </div>
                <div className={styles.map}>
                    <div className={styles.topBar}>
                        <SearchBox2
                            className={styles.search}
                            placeholder="ابحث عن عنوانك الوطني, المبنى..."
                            onSearch={(query) => {}}
                            onSearchSubmit={() => {}}
                        />
                        <button className={styles.button}>
                            <LocateFixed className={styles.icon} />
                            استخدم موقعك الحالي
                        </button>
                    </div>
                </div>
                <div className={styles.footer}>
                    <div>
                        <p>الموقع الحالي</p>
                    </div>
                    <Button type="primary" className={styles.button}>
                        حدد الموقع
                    </Button>
                </div>
            </div>
        </div>
    )
}
