"use client"

import { useState, useEffect, useRef, ComponentPropsWithoutRef } from "react"
import dynamic from "next/dynamic"
import clsx from "clsx"
import { House, LocateFixed, X, Tag } from "lucide-react"

// Components
import Button from "../Button"
import Loader from "../Loader"
import SearchBox2 from "../SearchBox2"

// Utils & Types
import { safe } from "@/utils/safe"
import { getAdressByCordinates, searchForAddresses } from "@/utils"
import { showMessage } from "@/utils/showMessage"
import { OSMPlace } from "@/types"
import styles from "./style.module.css"
import { useDebouncedCallback } from "@/hooks"
import { useSignal, useSignals } from "@preact/signals-react/runtime"

interface AddAddressOverlayProps extends ComponentPropsWithoutRef<"div"> {
    onAddressChange?: (place: OSMPlace) => void
    onAddressSubmit?: (place: OSMPlace) => void
}

// --- Dynamic Imports ---
const MapComponent = dynamic(() => import("../Map"), {
    ssr: false,
    loading: () => <Loader label="جاري تحميل الخريطة..." />,
})

export default function AddAddressOverlay({
    onAddressChange,
    onAddressSubmit,
    className,
    ...rest
}: AddAddressOverlayProps) {
    // 1. Location State
    useSignals()
    const currentView = useSignal<"geoLocation" | "addressAndContact">("geoLocation")
    const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)
    const [place, setPlace] = useState<OSMPlace | null>(null)
    const [address, setAddress] = useState<string>("")
    const [loadingAddress, setLoadingAddress] = useState(false)

    // 2. Search State
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<OSMPlace[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    // 3. Refs
    const searchContainerRef = useRef<HTMLDivElement>(null)
    const debouncedFetchAddress = useDebouncedCallback(async (coords: [number, number]) => {
        const result = await safe(getAdressByCordinates(coords[0], coords[1]))

        if (!result.success) {
            setLoadingAddress(false)
            setAddress("حدث خطأ")
            showMessage({
                content: "حدث خطأ أثناء جلب العنوان: " + result.error.message,
                type: "error",
            })
            return
        }

        setAddress(result.data.display_name || "عنوان غير معروف")
        setPlace(result.data)
        onAddressChange?.(result.data)
        setLoadingAddress(false) // Turn off loading when done
    }, 800) // Wait 800ms after the last call before executing

    // 2. Trigger it via useEffect
    useEffect(() => {
        if (!selectedCoords) return

        // Immediately show loading state when coordinates change
        setLoadingAddress(true)

        // Pass the latest coordinates to the debounced function
        debouncedFetchAddress(selectedCoords)
    }, [selectedCoords, debouncedFetchAddress])
    // --- Helpers ---

    /**
     * Formats the address object into a readable Title and Subtitle
     */
    const getAddressTitle = (place: OSMPlace) => {
        const addr = place.address
        const road = addr?.road
            ? /(شارع|طريق)/.test(addr.road)
                ? addr.road
                : `شارع ${addr.road}`
            : ""

        const nhBase = addr?.neighbourhood || addr?.suburb || ""
        const neighborhood = nhBase && !nhBase.includes("حي") ? `حي ${nhBase}` : nhBase

        const isUniqueName =
            place.name && place.name !== addr?.road && place.name !== addr?.neighbourhood

        return (isUniqueName ? place.name : road || neighborhood) || "موقع محدد"
    }

    // --- Side Effects ---

    // Handle outside clicks for search dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Fetch address details when coordinates change
    useEffect(() => {
        if (!selectedCoords) return

        debouncedFetchAddress(selectedCoords)
    }, [selectedCoords, onAddressChange])

    // --- Handlers ---

    const handleSearch = useDebouncedCallback(async (q: string) => {
        if (!q.trim()) return
        setSearchLoading(true)
        const result = await safe<OSMPlace[]>(searchForAddresses(q))
        if (!result.success) {
            showMessage({ content: "Failed to fetch addresses", type: "error" })
            setSearchResults([])
            setSearchLoading(false)
            return
        }
        setSearchResults(result.data || [])
        setDropdownOpen(true)
        setSearchLoading(false)
    }, 600)

    const handleSelectResult = (result: OSMPlace) => {
        const coords: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)]
        setSelectedCoords(coords)
        setSearchQuery(result.display_name)
        setDropdownOpen(false)
        setSearchResults([])
    }

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude, longitude } }) => {
                setSelectedCoords([latitude, longitude])
            },
            () => alert("يرجى تفعيل صلاحيات الموقع الجغرافي"),
        )
    }

    // --- Render Helpers ---

    const renderAddressDisplay = () => {
        if (loadingAddress) {
            // return <span className={styles.loadingText}>جاري التحقق من العنوان...</span>
            return (
                <div className={styles.loader}>
                    <span className={styles.text}>جاري التحقق من العنوان...</span>
                    <Loader className={styles.spinner} />
                </div>
            )
        }

        if (place?.address) {
            const title = getAddressTitle(place)
            return (
                <div className={styles.addressDetails}>
                    <p className={styles.primaryAddress}>{title}</p>
                    <p className={styles.secondaryAddress}>{place.display_name}</p>
                </div>
            )
        }

        return <p className={styles.addressText}>{address || "يرجى تحديد موقع على الخريطة"}</p>
    }
    const handleCloseOverlay = () => {
        console.log("close")
    }
    return (
        <div className={clsx(styles.root, className)} {...rest}>
            <div className={styles.window}>
                <div className={styles.header}>
                    <div className={styles.labelWrapper}>
                        <House className={styles.labelIcon} />
                        <h3 className={styles.label}>إضافة عنوان جديد</h3>
                    </div>
                    <X onClick={handleCloseOverlay} className={styles.closeIcon} />
                </div>

                <div className={styles.mapSection}>
                    <div className={styles.topBar}>
                        <div ref={searchContainerRef} className={styles.searchWrapper}>
                            <SearchBox2
                                className={styles.search}
                                placeholder="ابحث عن موقع..."
                                onSearch={(query) => {
                                    setSearchQuery(query)
                                    handleSearch(query)
                                }}
                                onSearchSubmit={handleSearch}
                                isLoading={searchLoading}
                                submitOnBlur={false}
                                // debounceMs={600}
                            />

                            {dropdownOpen && (
                                <ul className={styles.dropdown}>
                                    {searchResults.length > 0
                                        ? searchResults.map((r) => (
                                              <li
                                                  key={r.place_id}
                                                  className={styles.dropdownItem}
                                                  onMouseDown={() => handleSelectResult(r)}
                                              >
                                                  <span className={styles.dropdownIcon}>📍</span>
                                                  <span className={styles.dropdownText}>
                                                      {r.display_name}
                                                  </span>
                                              </li>
                                          ))
                                        : !searchLoading && (
                                              <li className={styles.dropdownEmpty}>
                                                  لا توجد نتائج
                                              </li>
                                          )}
                                </ul>
                            )}
                        </div>

                        <button className={styles.locationBtn} onClick={handleUseCurrentLocation}>
                            <LocateFixed className={styles.icon} />
                            استخدم موقعك الحالي
                        </button>
                    </div>

                    <div className={styles.mapContainer}>
                        <MapComponent
                            selectedCoords={selectedCoords}
                            onLocationSelect={setSelectedCoords}
                        />
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.addressInfoWrapper}>
                        {/* <Tag className={styles.icon}/> */}
                        <img
                            className={styles.icon}
                            src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png"
                        />
                        <div className={styles.addressInfo}>{renderAddressDisplay()}</div>
                    </div>

                    <Button
                        type="primary"
                        className={styles.submitBtn}
                        disabled={!selectedCoords || loadingAddress}
                        onClick={() => {
                            if (place) {
                                onAddressSubmit?.(place)
                            }
                        }}
                    >
                        تأكيد العنوان
                    </Button>
                </div>
            </div>
        </div>
    )
}
