"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef, useState, useEffect } from "react"
import Button from "../Button"
import SearchBox2 from "../SearchBox2"
import { LocateFixed, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import Loader from "../Loader"
import { safe } from "@/utils/safe"
import { getAdressByCordinates } from "@/utils"
import { showMessage } from "@/utils/showMessage"

const MapComponent = dynamic(() => import("../Map"), {
    ssr: false,
    loading: () => <Loader label="جاري تحميل الخريطة..." />,
})

export default function AddAddressOverlay({ ...rest }: ComponentPropsWithoutRef<"div">) {
    const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)
    const [address, setAddress] = useState<string>("")
    const [loadingAddress, setLoadingAddress] = useState(false)

    // Function to get Address from Lat/Lng
    const fetchAddress = async (lat: number, lng: number) => {
        setLoadingAddress(true)
        const result = await safe(getAdressByCordinates(lat, lng))
        if (!result.success) {
            setLoadingAddress(false)
            setAddress("حدث خطأ")
            showMessage({
                content: "حدث خطأ أثناء جلب العنوان" + result.error.message,
                type: "error",
            })
            return
        }

        setAddress(result.data.display_name || "عنوان غير معروف")
        setLoadingAddress(false)
    }

    // Trigger address fetch when coordinates change
    useEffect(() => {
        if (selectedCoords) {
            fetchAddress(selectedCoords[0], selectedCoords[1])
        }
    }, [selectedCoords])

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setSelectedCoords([latitude, longitude])
                },
                (error) => {
                    alert("يرجى تفعيل صلاحيات الموقع الجغرافي")
                },
            )
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
                            placeholder="ابحث عن موقع..."
                            onSearch={(query) => {}}
                            onSearchSubmit={() => {}}
                        />
                        <button className={styles.locationBtn} onClick={handleUseCurrentLocation}>
                            <LocateFixed size={18} />
                            استخدم موقعك الحالي
                        </button>
                    </div>

                    <div className={styles.mapContainer}>
                        <MapComponent
                            selectedCoords={selectedCoords}
                            onLocationSelect={(coords: [number, number]) =>
                                setSelectedCoords(coords)
                            }
                        />
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.addressInfo}>
                        <p className={styles.label}>الموقع المختار:</p>
                        {loadingAddress ? (
                            <span className={styles.loadingText}>جاري التحقق من العنوان...</span>
                        ) : (
                            <p className={styles.addressText}>
                                {address || "يرجى تحديد موقع على الخريطة"}
                            </p>
                        )}
                    </div>
                    <Button
                        type="primary"
                        className={styles.submitBtn}
                        disabled={!selectedCoords || loadingAddress}
                    >
                        تأكيد العنوان
                    </Button>
                </div>
            </div>
        </div>
    )
}
