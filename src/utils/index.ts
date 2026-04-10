import { DisplayLanguage, NewAddress, NewProduct, OSMPlace, Product, User } from "@/types";

export function getDisplayLanguage(): DisplayLanguage {
    return 'arabic'
}

export function debounced<T extends (...args: any[]) => void>(
    cb: T,
    delay: number = 300
) {
    let timeout: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            cb(...args);
        }, delay);
    };
}

import { MOCK_PRODUCTS } from "@/mockData";
import { addedItemSignal, cartCountSignal } from "@/signals";
import { addItemToCartDB } from "./db/user";
import { db } from "@/db";
import { cartItems } from "@/schemas/drizzle";
export async function searchProducts(query: string): Promise<Product[]> {
    return new Promise(resolve => {
        resolve(MOCK_PRODUCTS.filter(product => product.name.toLowerCase().includes(query.toLowerCase())))
    })
}


let timeout: ReturnType<typeof setTimeout>;

export async function addItemToCart(product: Product, quantity: number = 1): Promise<boolean> {
    if (timeout) clearTimeout(timeout);

    addedItemSignal.value = { ...product };
    timeout = setTimeout(() => addedItemSignal.value = null, 4500);
    await addItemToCartDB(product, quantity);
    cartCountSignal.value++

    return true;
}
interface FormatOptions {
    style?: 'short' | 'medium' | 'long' | 'full'; // Preset styles (short, medium, etc.)
    showDate?: boolean;  // Whether to include the date
    showTime?: boolean;  // Whether to include the time
    useWesternArabicNumerals?: boolean; // Use 1,2,3 instead of ٠,١,٢
}

interface FormatOptions {
    style?: 'full' | 'long' | 'medium' | 'short';
    showDate?: boolean;
    showTime?: boolean;
    useWesternArabicNumerals?: boolean;
}



export function formatTime({
    time,
    language,
    options = {} // Default to empty object if not provided
}: {
    time: Date | string | number;
    language: 'ar' | 'en';
    options?: FormatOptions; // Made optional here
}): string {
    const {
        style = 'medium',
        showDate = true,
        showTime = true,
        useWesternArabicNumerals = false
    } = options;

    const date = new Date(time);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const intlOptions: Intl.DateTimeFormatOptions = {
        ...(showDate && { dateStyle: style }),
        ...(showTime && { timeStyle: style }),
    };

    let locale = language === 'ar' ? 'ar-EG' : 'en-US';

    if (language === 'ar' && useWesternArabicNumerals) {
        locale = 'ar-u-nu-latn';
    }

    return new Intl.DateTimeFormat(locale, intlOptions).format(date);
}


export function getProductLinkById(id: number): string {
    return '/product/' + id
}

export function getClientLinkById(id: string): string {
    return '/dashboard/customer/' + id
}
export function getReviewLinkById(id: string | number): string {
    return '/dashboard/review/' + id
}
export function getOrderLinkById(id: string | number): string {
    return '/dashboard/order/' + id
}
export function getCpuponLinkById(id: string | number): string {
    return '/dashboard/coupon/view/' + id
}
export function getCouponEditLink(id: number): string {
    return '/dashboard/coupon/edit/' + id
}
export function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}
/**
 * Converts a string into a consistent "random" number within a specific range.
 * The same input string will always produce the same output.
 */
export function stringToRandom(text: string, min: number = 0, max: number = 1): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        // Simple hash to turn string into a large integer
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    /**
     * Math.sin(hash) returns a value between -1 and 1.
     * This "scrambles" sequential inputs so that 1 and 2 
     * result in completely different parts of the sine wave.
     */
    const pseudoRandom = (Math.sin(hash) + 1) / 2; // Normalize -1..1 to 0..1

    return min + pseudoRandom * (max - min);
}

export const getEmptyProduct = (): NewProduct => ({
    name: "",
    description: "",
    price: 0,
    images: [],
    stockQuantity: 0,
    category: [],
    gender: "Men",
    sizeMl: 0,
    tags: [],
    discount: 0,
    userId: ""
});


export async function getAdressByCordinates(lat: number, lng: number, language: string = "ar"): Promise<OSMPlace> {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${language}`,
    )
    const data = await response.json() as OSMPlace
    return data
}

export async function searchForAddresses(query: string): Promise<OSMPlace[]> {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1&countrycodes=sa`,
        { headers: { "Accept-Language": "ar,en" } },
    )
    const data = await response.json() as OSMPlace[]
    return data
}


export function mapOSMToFormValue(
    osm: OSMPlace,
    currentForm: NewAddress
): NewAddress {
    const { address: addr } = osm;

    return {
        ...currentForm, // Preserve fields like userId, phoneNumber, recipientName
        latitude: osm.lat,
        longitude: osm.lon,

        // Mapping Logic:
        // 1. Region: Usually 'state' or 'province'
        region: addr.state || addr.province || "",

        // 2. City: OSM uses a hierarchy based on size
        city: addr.city || addr.town || addr.village || addr.municipality || "",

        // 3. District: 'suburb' is usually the best match for 'حي' (District)
        district: addr.suburb || addr.neighbourhood || addr.city_district || "",

        // 4. Street: 'road' is the standard OSM key for streets
        street: addr.road || "",

        // 5. Building Number: Handled via the index signature in your OSMAddress type
        buildingNumber: (addr["house_number"] as string) || "",

        // 6. Building Name: 'amenity' (like "Mall of Arabia") or 'building'
        buildingName: addr.amenity || (addr["building"] as string) || null,

        // 7. Metadata
        postalCode: addr.postcode || null,
        countryCode: addr.country_code?.toUpperCase() || "",

        // 8. Landmark: Use amenity or the most specific location name available
        landmark: addr.amenity || addr.neighbourhood || null,
    };
};

