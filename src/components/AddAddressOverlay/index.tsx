"use client"

import { useState, useEffect, useRef, ComponentPropsWithoutRef } from "react"
import dynamic from "next/dynamic"
import clsx from "clsx"
import {
    House,
    LocateFixed,
    X,
    Tag,
    Home,
    Building,
    MapPin,
    Info,
    User,
    Road,
    ArrowBigRight,
} from "lucide-react"

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
import { signal } from "@preact/signals-react"
import TextBox from "../form-elements/TextBox"
import PhoneInput from "@/external/my-library/components/html-elements/PhoneInput"

interface AddAddressOverlayProps extends ComponentPropsWithoutRef<"div"> {
    onAddressChange?: (place: OSMPlace) => void
    onAddressSubmit?: (place: OSMPlace) => void
}

// --- Dynamic Imports ---
const MapComponent = dynamic(() => import("../Map"), {
    ssr: false,
    loading: () => <Loader label="جاري تحميل الخريطة..." />,
})
const currentViewSignal = signal<"geoLocation" | "deliverTo">("deliverTo")
// 1. Location Signals
const selectedCoords = signal<[number, number] | null>(null)
const place = signal<OSMPlace | null>(null)
const address = signal<string>("")
const loadingAddress = signal(false)

// 2. Search Signals
const searchQuery = signal("")
const searchResults = signal<OSMPlace[]>([])
const searchLoading = signal(false)
const dropdownOpen = signal(false)
const searchContainerSignal = signal<HTMLDivElement | null>(null)
const searchContainerRef = {
    get current() {
        return searchContainerSignal.value
    },
    set current(el) {
        searchContainerSignal.value = el
    },
}
const handleCloseOverlay = () => {
    console.log("close")
}
const getAddressTitle = (place: OSMPlace) => {
    const addr = place.address
    const road = addr?.road ? (/(شارع|طريق)/.test(addr.road) ? addr.road : `شارع ${addr.road}`) : ""

    const nhBase = addr?.neighbourhood || addr?.suburb || ""
    const neighborhood = nhBase && !nhBase.includes("حي") ? `حي ${nhBase}` : nhBase

    const isUniqueName =
        place.name && place.name !== addr?.road && place.name !== addr?.neighbourhood

    return (isUniqueName ? place.name : road || neighborhood) || "موقع محدد"
}

const renderAddressDisplay = () => {
    if (!selectedCoords.value) {
        return (
            <p className={styles.addressText}>{address.value || "يرجى تحديد موقع على الخريطة"}</p>
        )
    }
    if (loadingAddress.value) {
        // return <span className={styles.loadingText}>جاري التحقق من العنوان...</span>
        return (
            <div className={styles.loader}>
                <span className={styles.text}>جاري التحقق من العنوان...</span>
                <Loader className={styles.spinner} />
            </div>
        )
    }

    if (place.value?.address) {
        const title = getAddressTitle(place.value)
        return (
            <div className={styles.addressDetails}>
                <p className={styles.primaryAddress}>{title}</p>
                <p className={styles.secondaryAddress}>{place.value.display_name}</p>
            </div>
        )
    }
}

export default function AddAddressOverlay({
    onAddressChange,
    onAddressSubmit,
    className,
    ...rest
}: AddAddressOverlayProps) {
    return (
        <div className={clsx(styles.root, className)} {...rest}>
            {currentViewSignal.value === "geoLocation" &&
                geoLocationWindow({ onAddressChange, onAddressSubmit })}
            {currentViewSignal.value === "deliverTo" &&
                deliverTo({ onAddressChange, onAddressSubmit })}
        </div>
    )
}

function geoLocationWindow({
    onAddressChange,
    onAddressSubmit,
}: {
    onAddressChange?: (place: OSMPlace) => void
    onAddressSubmit?: (place: OSMPlace) => void
}) {
    const debouncedFetchAddress = useDebouncedCallback(async (coords: [number, number]) => {
        const result = await safe(getAdressByCordinates(coords[0], coords[1]))

        if (!result.success) {
            loadingAddress.value = false
            address.value = "حدث خطأ"
            showMessage({
                content: "حدث خطأ أثناء جلب العنوان: " + result.error.message,
                type: "error",
            })
            return
        }

        address.value = result.data.display_name || "عنوان غير معروف"
        place.value = result.data
        onAddressChange?.(result.data)
        loadingAddress.value = false
    }, 800) // Wait 800ms after the last call before executing

    // 2. Trigger it via useEffect
    useEffect(() => {
        if (!selectedCoords.value) return

        // Immediately show loading state when coordinates change
        loadingAddress.value = true
        // Pass the latest coordinates to the debounced function
        if (selectedCoords.value) {
            debouncedFetchAddress(selectedCoords.value)
        }
    }, [selectedCoords.value, debouncedFetchAddress])
    // --- Helpers ---

    /**
     * Formats the address object into a readable Title and Subtitle
     */

    // --- Side Effects ---

    // Handle outside clicks for search dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(e.target as Node)
            ) {
                dropdownOpen.value = false
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Fetch address details when coordinates change
    useEffect(() => {
        if (!selectedCoords.value) return
        debouncedFetchAddress(selectedCoords.value)
    }, [selectedCoords.value, onAddressChange])

    // --- Handlers ---

    const handleSearch = useDebouncedCallback(async (q: string) => {
        if (!q.trim()) return
        searchLoading.value = true
        const result = await safe<OSMPlace[]>(searchForAddresses(q))
        if (!result.success) {
            showMessage({ content: "Failed to fetch addresses", type: "error" })
            searchResults.value = []
            searchLoading.value = false
            return
        }
        searchResults.value = result.data || []
        dropdownOpen.value = true
        searchLoading.value = false
    }, 600)

    const handleSelectResult = (result: OSMPlace) => {
        const coords: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)]
        selectedCoords.value = coords
        searchQuery.value = result.display_name
        dropdownOpen.value = false
        searchResults.value = []
    }

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude, longitude } }) => {
                selectedCoords.value = [latitude, longitude]
            },
            () => alert("يرجى تفعيل صلاحيات الموقع الجغرافي"),
        )
    }

    // --- Render Helpers ---

    return (
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
                                searchQuery.value = query
                                handleSearch(query)
                            }}
                            onSearchSubmit={handleSearch}
                            isLoading={searchLoading.value}
                            submitOnBlur={false}
                            // debounceMs={600}
                        />

                        {dropdownOpen.value && (
                            <ul className={styles.dropdown}>
                                {searchResults.value.length > 0
                                    ? searchResults.value.map((r) => (
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
                                    : !searchLoading.value && (
                                          <li className={styles.dropdownEmpty}>لا توجد نتائج</li>
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
                        selectedCoords={selectedCoords.value}
                        onLocationSelect={(coords: [number, number]) => {
                            selectedCoords.value = coords
                        }}
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
                    disabled={!selectedCoords.value || loadingAddress.value}
                    onClick={() => {
                        if (place.value) {
                            onAddressSubmit?.(place.value)
                            currentViewSignal.value = "deliverTo"
                        }
                    }}
                >
                    تأكيد العنوان
                </Button>
            </div>
        </div>
    )
}

function deliverTo({
    onAddressChange,
    onAddressSubmit,
}: {
    onAddressChange?: (place: OSMPlace) => void
    onAddressSubmit?: (place: OSMPlace) => void
}) {
    return (
        <div className={clsx(styles.window, styles.delivery)}>
            <div className={styles.header}>
                <div className={styles.labelWrapper}>
                    <ArrowBigRight
                        className={styles.labelIcon}
                        onClick={() => (currentViewSignal.value = "geoLocation")}
                    />
                    <h3 className={styles.label}>تسليم إلى</h3>
                </div>
                <X onClick={handleCloseOverlay} className={styles.closeIcon} />
            </div>

            <div className={styles.main}>
                <div className={styles.geoAdressCard}>
                    <div className={styles.adressWindowWrapper}>
                        <div className={styles.adressWindow}></div>
                        <div className={styles.details}>{renderAddressDisplay()}</div>
                    </div>
                    <Button
                        onClick={() => (currentViewSignal.value = "geoLocation")}
                        className={styles.changeBtn}
                    >
                        تغيير
                    </Button>
                </div>
                <div className={styles.form}>
                    <div className={styles.section}>
                        <h4 className={styles.title}>تفاصيل العنوان</h4>
                        <div className={styles.row}>
                            {/* Passing the icon reference */}
                            <TextBox label="رقم الشقة والطابق / رقم الفيلا" required icon={Home} />
                            <TextBox label="اسم المبنى / المجمّع" required icon={Building} />
                        </div>
                        <TextBox label="اسم مستعار للعنوان" icon={MapPin} placeholder="اختياري" />
                        <TextBox
                            placeholder="اختياري"
                            label="الاتجاهات للوصول لعنوانك"
                            icon={Road}
                        />
                    </div>
                    <div className={styles.section}>
                        <h4 className={styles.title}>تفاصيل المستلم</h4>
                        <div className={styles.row}>
                            <TextBox label="الاسم الأول" required />
                            <TextBox label="اسم العائلة" required />
                        </div>
                        <PhoneInput className={styles.phoneInput} />
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <Button
                    type="primary"
                    className={styles.submitBtn}
                    disabled={false}
                    onClick={() => {
                        if (place.value) {
                            onAddressSubmit?.(place.value)
                            currentViewSignal.value = "deliverTo"
                        }
                    }}
                >
                    حفظ العنوان
                </Button>
            </div>
        </div>
    )
}
