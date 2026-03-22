import { DisplayLanguage, Product } from "@/types";

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
import { addedItemSignal } from "@/signals";
import { ADD_TO_CART_NOTIFICATION_DELAY } from "@/config";
export async function searchProducts(query: string): Promise<Product[]> {
    return new Promise(resolve => {
        resolve(MOCK_PRODUCTS.filter(product => product.title.toLowerCase().includes(query.toLowerCase())))
    })
}

export async function getProductById(id: number): Promise<Product> {
    return new Promise(resolve => {
        const foundProduct = MOCK_PRODUCTS.find(product => product.id === id);
        if (!foundProduct) {
            throw new Error("Product not found")
        }
        resolve(foundProduct)
    })
}

export async function getCartItems(): Promise<Product[]> {
    return new Promise(resolve => {
        resolve(MOCK_PRODUCTS.filter(x => x.id < 4))
    })
}
let timeout: ReturnType<typeof setTimeout>
export async function addItemToCart(product: Product, qunaitity: number = 1): Promise<boolean> {
    return new Promise(resolve => {
        if (timeout) {
            clearTimeout(timeout)
        }
        addedItemSignal.value = { ...product }
        timeout = setTimeout(() => addedItemSignal.value = null, ADD_TO_CART_NOTIFICATION_DELAY)
        resolve(true)
    })
}

interface FormatOptions {
    style?: 'short' | 'medium' | 'long' | 'full'; // Preset styles (short, medium, etc.)
    showDate?: boolean;  // Whether to include the date
    showTime?: boolean;  // Whether to include the time
    useWesternArabicNumerals?: boolean; // Use 1,2,3 instead of ٠,١,٢
}

export function formatTime(
    time: Date | string | number,
    language: 'ar' | 'en',
    options: FormatOptions = {}
): string {
    const {
        style = 'medium',
        showDate = true,
        showTime = true,
        useWesternArabicNumerals = false
    } = options;

    const date = new Date(time);
    if (isNaN(date.getTime())) return 'Invalid Date';

    // Build the Intl options
    const intlOptions: Intl.DateTimeFormatOptions = {
        // If showDate is true, apply the style to dateStyle
        ...(showDate && { dateStyle: style }),
        // If showTime is true, apply the style to timeStyle
        ...(showTime && { timeStyle: style }),
    };

    /**
     * Locale Logic:
     * 'ar-EG' uses Eastern Arabic numerals (٠١٢) by default.
     * 'ar-u-nu-latn' forces Western numerals (123) while keeping Arabic text.
     */
    let locale = language === 'ar' ? 'ar-EG' : 'en-US';
    if (language === 'ar' && useWesternArabicNumerals) {
        locale = 'ar-u-nu-latn';
    }

    return new Intl.DateTimeFormat(locale, intlOptions).format(date);
}


export function getProductLinkById(id: number): string {
    return '/product/' + id
}