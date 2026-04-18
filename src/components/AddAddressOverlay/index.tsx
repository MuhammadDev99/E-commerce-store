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
    Hash,
    Earth,
    MoreHorizontal,
    Locate,
    ArrowRight,
    RoadIcon,
    HashIcon,
    Text,
} from "lucide-react"
// import * as Icons from "@phosphor-icons/react"

// Components
import Button from "../Button"
import Loader from "../Loader"
import SearchBox2 from "../SearchBox2"

// Utils & Types
import { safe } from "@/utils/safe"
import { getAddressByCordinates, searchForAddresses, mapOSMToFormValue } from "@/utils"
import { showMessage } from "@/utils/showMessage"
import { Address, FormElementRef, NewAddress, OSMPlace } from "@/types"
import styles from "./style.module.css"
import { useDebouncedCallback } from "@/hooks"
import { signal } from "@preact/signals-react"
import TextBox from "../form-elements/TextBox"
import PhoneInput from "@/external/my-library/components/html-elements/PhoneInput"
import MultiSelect from "../MultiSelect"
import { authClient } from "@/lib/auth-client"
import { useSignals } from "@preact/signals-react/runtime"

// --- Dynamic Imports ---
const MapComponent = dynamic(() => import("../Map"), {
    ssr: false,
    loading: () => <Loader label="جاري تحميل الخريطة..." />,
})
const currentViewSignal = signal<"geoLocation" | "deliverTo">("geoLocation")
// 1. Location Signals
// const selectedCoords = signal<[number, number] | null>(null)
const place = signal<OSMPlace | null>(null)
// const address = signal<string>("")
const loadingAddress = signal(false)
const isSupportedSignal = signal(true) // Add this line
const lastFetchedCoordsSignal = signal<string | null>(null)

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
const formSignal = signal<NewAddress>({
    phoneNumber: "",
    userId: "",
    region: "",
    city: "",
    district: "",
    street: "",
    latitude: "",
    longitude: "",
    buildingNumber: "",
    recipientName: "",
    addressNickname: "",
    postalCode: "",
    addressType: "home",
    displayAddress: "",
})
type FormErrors = Partial<Record<keyof NewAddress, string>>
const formErrorsSignal = signal<FormErrors>({})

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

    return (isUniqueName ? place.name : road || neighborhood) || "لم يتم التعرف على الشارع"
}
function getFormCoords(): [number, number] | null {
    const lat = parseFloat(formSignal.value.latitude)
    const lng = parseFloat(formSignal.value.longitude)
    if (isNaN(lat) || isNaN(lng)) return null
    return [lat, lng]
}
function setFormCoords(coords: [number, number]) {
    formSignal.value = {
        ...formSignal.value,
        longitude: coords[1].toString(),
        latitude: coords[0].toString(),
    }
}
const renderAddressDisplay = () => {
    if (!getFormCoords()) {
        return (
            <p className={styles.addressText}>
                {formSignal.value.displayAddress || "يرجى تحديد موقع على الخريطة"}
            </p>
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

const resetAddressSignals = () => {
    currentViewSignal.value = "geoLocation"
    place.value = null
    loadingAddress.value = false
    isSupportedSignal.value = true
    lastFetchedCoordsSignal.value = null
    searchQuery.value = ""
    searchResults.value = []
    searchLoading.value = false
    dropdownOpen.value = false
    formErrorsSignal.value = {}
    formSignal.value = {
        phoneNumber: "",
        userId: "",
        region: "",
        city: "",
        district: "",
        street: "",
        latitude: "",
        longitude: "",
        buildingNumber: "",
        recipientName: "",
        addressNickname: "",
        postalCode: "",
        addressType: "home",
        displayAddress: "",
    }
}
interface AddAddressOverlayProps extends ComponentPropsWithoutRef<"div"> {
    onAddressSubmit?: (place: NewAddress) => void
    onClose?: () => void
    address?: Address | null
}

export default function AddAddressOverlay({
    onAddressSubmit,
    onClose,
    className,
    address,
    ...rest
}: AddAddressOverlayProps) {
    useSignals()
    // Create a wrapper for onClose to ensure reset happens
    const handleClose = () => {
        resetAddressSignals()
        onClose?.()
    }
    useEffect(() => {
        console.log(address)
        if (address) {
            formSignal.value = address
            currentViewSignal.value = "deliverTo"
        }
    }, [address]) // This runs only when the address prop changes

    const { data: session } = authClient.useSession()

    // 1. Hydration Guard
    const [mounted, setMounted] = useState(false)
    const windowRef = useRef<HTMLDivElement | null>(null)
    // Inside AddAddressOverlay component
    useEffect(() => {
        setMounted(true)

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node

            // 1. Check if the element is still connected to the document
            // If it's not, it was unmounted (like the dropdown item)
            // and we should ignore this click.
            if (!document.contains(target)) {
                return
            }

            // 2. Normal "click outside" check
            if (windowRef.current && !windowRef.current.contains(target)) {
                handleClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [onClose])
    useEffect(() => {
        setMounted(true)

        if (session?.user) {
            formSignal.value = {
                ...formSignal.value,
                recipientName: formSignal.value.recipientName || session.user.name || "",
                phoneNumber: formSignal.value.phoneNumber || session.user.phoneNumber || "",
            }
        }
    }, [session])

    // 3. Prevent SSR mismatch: Return a skeleton or null until mounted
    if (!mounted) {
        return <div className={clsx(styles.root, className)} {...rest} />
    }

    return (
        <div className={clsx(styles.root, className)} {...rest}>
            <div ref={windowRef} className={styles.windowWrapper}>
                {currentViewSignal.value === "geoLocation" ? (
                    <GeoLocationWindow onClose={handleClose} />
                ) : (
                    <DeliverTo onAddressSubmit={onAddressSubmit} onClose={handleClose} />
                )}
            </div>
        </div>
    )
}

function GeoLocationWindow({ onClose }: { onClose?: () => void }) {
    useSignals()
    const formCoords = getFormCoords()
    const debouncedFetchAddress = useDebouncedCallback(async (coords: [number, number]) => {
        const result = await safe<OSMPlace>(getAddressByCordinates(coords[0], coords[1]))

        if (!result.success) {
            loadingAddress.value = false
            formSignal.value = {
                ...formSignal.value,
                city: "",
                street: "",
                region: "",
                postalCode: "",
            }
            showMessage({
                content: "حدث خطأ أثناء جلب العنوان: " + result.error.message,
                type: "error",
            })
            return
        }
        // --- CHECK FOR SAUDI ARABIA ---
        const countryCode = result.data.address?.country_code?.toLowerCase()
        isSupportedSignal.value = countryCode === "sa"
        // ------------------------------
        console.log(result.data)
        place.value = result.data
        loadingAddress.value = false
        formSignal.value = mapOSMToFormValue(result.data, formSignal.value, formCoords)
    }, 800) // Wait 800ms after the last call before executing

    useEffect(() => {
        if (formCoords) {
            // Create a unique string for the current coordinates
            const currentCoordsKey = `${formCoords[0]},${formCoords[1]}`

            // If we already fetched the address for these exact coordinates, skip the fetch!
            if (lastFetchedCoordsSignal.value === currentCoordsKey) {
                return
            }

            loadingAddress.value = true
            debouncedFetchAddress(formCoords)

            // Save these coordinates as the last fetched ones
            lastFetchedCoordsSignal.value = currentCoordsKey
        }
    }, [formSignal.value.longitude, formSignal.value.latitude])

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

    const handleSearch = useDebouncedCallback(async (q: string) => {
        if (!q.trim()) return
        searchLoading.value = true
        const result = await safe<OSMPlace[]>(searchForAddresses(q, formCoords))
        if (!result.success) {
            showMessage({ content: "Failed to fetch addresses", type: "error" })
            searchResults.value = []
            searchLoading.value = false
            return
        }
        console.log(result.data)
        searchResults.value = result.data || []
        dropdownOpen.value = true
        searchLoading.value = false
    }, 600)

    const handleSelectResult = (result: OSMPlace) => {
        const coords: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)]
        setFormCoords(coords)
        searchQuery.value = result.display_name
        dropdownOpen.value = false
        searchResults.value = []
    }

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude, longitude } }) => {
                setFormCoords([latitude, longitude])
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
                <X onClick={onClose} className={styles.closeIcon} />
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
                        selectedCoords={formCoords}
                        isSupported={isSupportedSignal.value}
                        onLocationSelect={(coords: [number, number]) => {
                            setFormCoords(coords)
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
                    variant="primary"
                    className={styles.submitBtn}
                    // Disable button if address is not supported
                    disabled={!formCoords || loadingAddress.value || !isSupportedSignal.value}
                    onClick={() => {
                        if (place.value) {
                            currentViewSignal.value = "deliverTo"
                        }
                    }}
                >
                    {/* Change label based on support */}
                    {isSupportedSignal.value ? "تأكيد العنوان" : "الموقع غير مدعوم"}
                </Button>
            </div>
        </div>
    )
}

const validateForm = (): boolean => {
    const data = formSignal.value
    const errors: FormErrors = {}
    if (!data.recipientName?.trim()) {
        errors.recipientName = "الاسم بالكامل مطلوب"
    }

    if (!data.buildingNumber || data.buildingNumber.length !== 4) {
        errors.buildingNumber = "رقم المبنى يجب أن يكون 4 أرقام"
    }

    if (!data.phoneNumber || data.phoneNumber.length < 9) {
        errors.phoneNumber = "رقم الجوال مطلوب"
    }

    formErrorsSignal.value = errors
    return Object.keys(errors).length === 0
}
function DeliverTo({
    onAddressSubmit,
    onClose,
}: {
    onAddressSubmit?: (address: NewAddress) => void
    onClose?: () => void
}) {
    useSignals()
    const formCoords = getFormCoords()
    // 1. Define Refs for the fields that have validation
    const recipientNameRef = useRef<FormElementRef>(null)
    const buildingNumberRef = useRef<FormElementRef>(null)
    const phoneNumberRef = useRef<FormElementRef>(null)
    const fieldRefs: Record<string, React.RefObject<FormElementRef | null>> = {
        recipientName: recipientNameRef,
        buildingNumber: buildingNumberRef,
        phoneNumber: phoneNumberRef,
    }
    if (!formSignal.value.city || !formSignal.value.region) {
        currentViewSignal.value = "geoLocation"
    }
    // useEffect(() => {
    //     if (!place.value) {
    //         currentViewSignal.value = "geoLocation"
    //     }
    // }, [])

    // if (!place.value) return null

    const handleSaveAddress = () => {
        // Run validation
        const isValid = validateForm()

        if (isValid) {
            onAddressSubmit?.(formSignal.value)
            onClose?.()
        } else {
            // 3. Find the first key in the error object
            const firstErrorKey = Object.keys(formErrorsSignal.value)[0]

            if (firstErrorKey && fieldRefs[firstErrorKey]) {
                // 4. Scroll to the element
                fieldRefs[firstErrorKey].current?.focus()
            }
        }
    }
    const foundPostalCode = place.value?.address.postcode
    const foundStreet = place.value?.address.road
    return (
        <div className={clsx(styles.window, styles.delivery)}>
            <div className={styles.header}>
                <div className={styles.labelWrapper}>
                    <ArrowRight
                        className={styles.labelIcon}
                        onClick={() => (currentViewSignal.value = "geoLocation")}
                    />
                    <h3 className={styles.label}>تسليم إلى</h3>
                </div>
                <X onClick={onClose} className={styles.closeIcon} />
            </div>

            <div className={styles.main}>
                <div className={styles.geoAdressCard}>
                    <div className={styles.adressWindowWrapper}>
                        <div className={styles.adressWindow}>
                            <MapComponent
                                selectedCoords={formCoords}
                                interactive={false}
                                zoom={18}
                            />
                        </div>
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
                        <h4 className={styles.title}>موقع التوصيل</h4>
                        <div className={styles.row}>
                            <TextBox
                                label="المدينة"
                                value={formSignal.value.region}
                                readOnly
                                icon={MapPin}
                                tooltip="يتم تحديد المدينة بناءً على موقع الدبوس. لتغييرها، يرجى تعديل الموقع على الخريطة."
                            />
                            <TextBox
                                label="الحي"
                                icon={MapPin}
                                value={formSignal.value.city}
                                readOnly
                                tooltip="تم استخراج اسم الحي تلقائياً من الإحداثيات لضمان دقة التوصيل."
                            />
                        </div>
                        <div className={styles.row}>
                            <TextBox
                                value={
                                    foundStreet
                                        ? foundStreet
                                        : formSignal.value.street
                                          ? formSignal.value.street
                                          : ""
                                }
                                label="الشارع"
                                icon={RoadIcon}
                                placeholder="اسم الشارع (اختياري)"
                                // Better: Encourages the user and explains the benefit
                                tooltip="إضافة اسم الشارع يساعد المندوب في الوصول إليك بسرعة أكبر."
                                readOnly={foundStreet !== undefined}
                                onChange={(e) =>
                                    (formSignal.value = {
                                        ...formSignal.value,
                                        street: e.target.value,
                                    })
                                }
                            />
                            <TextBox
                                value={
                                    foundPostalCode
                                        ? foundPostalCode
                                        : formSignal.value.postalCode
                                          ? formSignal.value.postalCode
                                          : ""
                                }
                                label="الرمز البريدي"
                                placeholder="مثال: 12271 (اختياري)"
                                // Better: Explains where to find it (Commonly found on the green building plates in KSA)
                                tooltip="الرمز البريدي (5 أرقام) موجود في تفاصيل عنوانك الوطني ."
                                readOnly={foundPostalCode !== undefined}
                                maxLength={5}
                                onChange={(e) =>
                                    (formSignal.value = {
                                        ...formSignal.value,
                                        postalCode: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* 2. Address Details (Manual Input) */}
                    <div className={styles.section}>
                        <h4 className={styles.title}>تفاصيل العنوان</h4>

                        {/* Row 1: Building Number & Short Code */}
                        <div className={styles.row}>
                            <TextBox
                                ref={buildingNumberRef}
                                label="رقم المبنى (4 أرقام)"
                                placeholder="مثال: 7422"
                                required
                                icon={Building}
                                maxLength={4}
                                error={formErrorsSignal.value.buildingNumber}
                                value={formSignal.value.buildingNumber}
                                onChange={(e) => {
                                    formSignal.value = {
                                        ...formSignal.value,
                                        buildingNumber: e.target.value.replace(/[^0-9]/g, ""),
                                    }
                                    validateForm()
                                }}
                            />
                            <TextBox
                                label="العنوان المختصر"
                                placeholder="مثال: RHOA3894 (اختياري)"
                                tooltip="رمز العنوان الوطني المكون من 8 أحرف وأرقام (اختياري)"
                                maxLength={8}
                                style={{ textTransform: "uppercase" }}
                                value={formSignal.value.shortCode || ""}
                                onChange={(e) =>
                                    (formSignal.value = {
                                        ...formSignal.value,
                                        shortCode: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Row 2: Combined Unit & Building Name */}
                        <div className={styles.row}>
                            {/* Combined Apartment / Floor */}
                            <TextBox
                                label="رقم الشقة / الطابق"
                                placeholder="مثال: شقة 12، الدور 3"
                                tooltip="رقم الشقة و الطابق (اتركه فارغاً إذا كان العنوان فيلا)"
                                icon={House}
                                value={formSignal.value.apartment_floor || ""}
                                onChange={(e) =>
                                    (formSignal.value = {
                                        ...formSignal.value,
                                        apartment_floor: e.target.value,
                                    })
                                }
                            />
                            <TextBox
                                label="اسم المبنى / المجمّع"
                                icon={Building}
                                placeholder="مثال: برج الراجحي / مجمع نجد (اختياري)"
                                tooltip="يساعد المندوب في التعرف على موقعك أسرع (اختياري)"
                                value={formSignal.value.buildingName || ""}
                                onChange={(e) =>
                                    (formSignal.value = {
                                        ...formSignal.value,
                                        buildingName: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <TextBox
                            label="وصف إضافي للموقع"
                            placeholder="مثال: بجوار مسجد الملك خالد (اختياري)"
                            tooltip="أي معالم قريبة أو تعليمات إضافية تساعدنا في الوصول إليك بسهولة"
                            value={formSignal.value.landmark || ""}
                            onChange={(e) =>
                                (formSignal.value = {
                                    ...formSignal.value,
                                    landmark: e.target.value,
                                })
                            }
                        />

                        <MultiSelect
                            className={styles.shortcutWrapper}
                            title="نوع العنوان"
                            value={formSignal.value.addressType}
                            items={[
                                { label: "المنزل", icon: Home, value: "home" },
                                { label: "العمل", icon: Building, value: "work" },
                                { label: "اخرى", icon: MoreHorizontal, value: "other" },
                            ]}
                            onChange={(value) =>
                                (formSignal.value = { ...formSignal.value, addressType: value })
                            }
                        />
                    </div>

                    {/* 3. Recipient Details */}
                    <div className={styles.section}>
                        <h4 className={styles.title}>تفاصيل المستلم</h4>
                        <div className={styles.row}>
                            {/* Combined First & Last Name */}
                            <TextBox
                                ref={recipientNameRef}
                                label="الاسم بالكامل"
                                placeholder="مثال: محمد الحربي"
                                required
                                icon={User}
                                tooltip="الاسم الكامل للشخص الذي سيستلم الطلب"
                                error={formErrorsSignal.value.recipientName}
                                value={formSignal.value.recipientName}
                                onChange={(e) => {
                                    formSignal.value = {
                                        ...formSignal.value,
                                        recipientName: e.target.value,
                                    }
                                    validateForm()
                                }}
                            />
                        </div>
                        <PhoneInput
                            ref={phoneNumberRef}
                            className={styles.phoneInput}
                            error={formErrorsSignal.value.phoneNumber}
                            value={formSignal.value.phoneNumber}
                            onChange={(value) => {
                                formSignal.value = {
                                    ...formSignal.value,
                                    phoneNumber: value,
                                }
                                validateForm()
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <Button
                    variant="primary"
                    className={styles.submitBtn}
                    disabled={false}
                    onClick={handleSaveAddress}
                >
                    حفظ العنوان
                </Button>
            </div>
        </div>
    )
}
