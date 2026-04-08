"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef, useState } from "react"
import Button from "../Button"
import SearchBox2 from "../SearchBox2"
import { LocateFixed } from "lucide-react"
import dynamic from "next/dynamic"

const MapComponent = dynamic(() => import("../Map"), {
    ssr: false,
    loading: () => (
        <div
            style={{
                height: "100%",
                background: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            جاري تحميل الخريطة...
        </div>
    ),
})

type Props = {} & ComponentPropsWithoutRef<"div">

export default function AddAddressOverlay({ ...rest }: Props) {
    const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords
                setSelectedCoords([latitude, longitude])
            })
        }
    }

    return (
        <div className={clsx(styles.root, rest.className)}>
            <div className={styles.window}>
                <div className={styles.header}>
                    <h3>إضافة عنوان جديد</h3>
                </div>
                <div className={styles.mapSection}>
                    <div className={styles.topBar}>
                        <SearchBox2
                            className={styles.search}
                            placeholder="ابحث عن عنوانك الوطني, المبنى..."
                            onSearch={(query) => {}}
                            onSearchSubmit={() => {}}
                        />
                        <button className={styles.button} onClick={handleUseCurrentLocation}>
                            <LocateFixed className={styles.icon} />
                            استخدم موقعك الحالي
                        </button>
                    </div>

                    <div className={styles.mapContainer}>
                        <MapComponent
                            onLocationSelect={(coords: any) => setSelectedCoords(coords)}
                        />
                    </div>
                </div>
                <div className={styles.footer}>
                    <div>
                        <p>الموقع المختار:</p>
                        <small>
                            {selectedCoords
                                ? `${selectedCoords[0].toFixed(4)}, ${selectedCoords[1].toFixed(4)}`
                                : "لم يتم تحديد موقع"}
                        </small>
                    </div>
                    <Button type="primary" className={styles.button} disabled={!selectedCoords}>
                        حدد الموقع
                    </Button>
                </div>
            </div>
        </div>
    )
}
