export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentMethod = 'mada' | 'visa' | 'apple_pay' | 'tamara' | 'tabby' | 'cash_on_delivery';

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface OrderItem {
    id: string;
    sku: string;
    name: { ar: string; en: string };
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    customer: Customer; // Added Customer details
    date: string;
    status: OrderStatus;

    // Financial details
    subtotal: number;
    tax: number;
    shippingFees: number;
    total: number;
    currency: { ar: string; en: string };

    paymentMethod: PaymentMethod;
    items: OrderItem[];

    shippingAddress: {
        city: { ar: string; en: string };
        district: { ar: string; en: string };
        street: { ar: string; en: string };
        postalCode?: string;
    };
}
export const MOCK_ORDERS: Order[] = [
    {
        id: "ord-101",
        orderNumber: "SA-99281",
        customer: {
            id: "cust-501",
            firstName: "Ahmed",
            lastName: "Al-Sudais",
            email: "ahmed.s@example.com",
            phone: "+966 50 123 4567"
        },
        date: "2023-10-24T14:30:00Z",
        status: "delivered",
        subtotal: 1250.00,
        tax: 187.50,
        shippingFees: 0.00,
        total: 1437.50,
        currency: { ar: "ر.س", en: "SAR" },
        paymentMethod: "mada",
        items: [
            {
                id: "p-1",
                sku: "WCH-PRO-01",
                name: { ar: "ساعة ذكية برو", en: "Smart Watch Pro" },
                price: 850,
                quantity: 1,
                image: "https://placehold.co/200x200?text=Smart+Watch"
            },
            {
                id: "p-2",
                sku: "EAR-WRL-02",
                name: { ar: "سماعات لاسلكية", en: "Wireless Earbuds" },
                price: 400,
                quantity: 1,
                image: "https://placehold.co/200x200?text=Earbuds"
            }
        ],
        shippingAddress: {
            city: { ar: "الرياض", en: "Riyadh" },
            district: { ar: "الملقا", en: "Al Malqa" },
            street: { ar: "طريق الملك فهد", en: "King Fahd Road" },
            postalCode: "13521"
        }
    },
    {
        id: "ord-102",
        orderNumber: "SA-99282",
        customer: {
            id: "cust-502",
            firstName: "Sara",
            lastName: "Mansour",
            email: "sara.m@example.com",
            phone: "+966 55 987 6543"
        },
        date: "2023-10-25T10:15:00Z",
        status: "processing",
        subtotal: 210.50,
        tax: 31.58,
        shippingFees: 25.00,
        total: 267.08,
        currency: { ar: "ر.س", en: "SAR" },
        paymentMethod: "tamara",
        items: [
            {
                id: "p-3",
                sku: "TSH-COT-03",
                name: { ar: "قميص قطني كاجوال", en: "Casual Cotton Shirt" },
                price: 210.50,
                quantity: 1,
                image: "https://placehold.co/200x200?text=Shirt"
            }
        ],
        shippingAddress: {
            city: { ar: "جدة", en: "Jeddah" },
            district: { ar: "الروضة", en: "Al Rawdah" },
            street: { ar: "شارع الأمير سلطان", en: "Prince Sultan St" }
        }
    },
    {
        id: "ord-103",
        orderNumber: "SA-99283",
        customer: {
            id: "cust-503",
            firstName: "Khalid",
            lastName: "Hassan",
            email: "k.hassan@web.com",
            phone: "+966 54 000 1122"
        },
        date: "2023-10-26T18:45:00Z",
        status: "shipped",
        subtotal: 3200.00,
        tax: 480.00,
        shippingFees: 0.00,
        total: 3680.00,
        currency: { ar: "ر.س", en: "SAR" },
        paymentMethod: "apple_pay",
        items: [
            {
                id: "p-4",
                sku: "LPT-MAC-14",
                name: { ar: "جهاز لابتوب مخصص", en: "Custom Laptop" },
                price: 3200.00,
                quantity: 1,
                image: "https://placehold.co/200x200?text=Laptop"
            }
        ],
        shippingAddress: {
            city: { ar: "الدمام", en: "Dammam" },
            district: { ar: "الشاطئ", en: "Ash Shati" },
            street: { ar: "طريق الخليج", en: "Gulf Road" }
        }
    },
    {
        id: "ord-104",
        orderNumber: "SA-99284",
        customer: {
            id: "cust-504",
            firstName: "Noura",
            lastName: "Al-Otaibi",
            email: "noura.otb@provider.com",
            phone: "+966 56 333 4455"
        },
        date: "2023-10-27T09:00:00Z",
        status: "pending",
        subtotal: 150.00,
        tax: 22.50,
        shippingFees: 35.00,
        total: 207.50,
        currency: { ar: "ر.س", en: "SAR" },
        paymentMethod: "cash_on_delivery",
        items: [
            {
                id: "p-5",
                sku: "BOK-AR-09",
                name: { ar: "كتاب فن التصميم", en: "The Art of Design Book" },
                price: 75.00,
                quantity: 2,
                image: "https://placehold.co/200x200?text=Book"
            }
        ],
        shippingAddress: {
            city: { ar: "مكة المكرمة", en: "Makkah" },
            district: { ar: "العزيزية", en: "Al Aziziyah" },
            street: { ar: "طريق المسجد الحرام", en: "Masjid Al Haram Rd" }
        }
    },
    {
        id: "ord-105",
        orderNumber: "SA-99285",
        customer: {
            id: "cust-505",
            firstName: "Omar",
            lastName: "Bakri",
            email: "o.bakri@service.sa",
            phone: "+966 50 999 8877"
        },
        date: "2023-10-27T11:20:00Z",
        status: "cancelled",
        subtotal: 550.00,
        tax: 82.50,
        shippingFees: 15.00,
        total: 647.50,
        currency: { ar: "ر.س", en: "SAR" },
        paymentMethod: "visa",
        items: [
            {
                id: "p-6",
                sku: "KIT-CH-22",
                name: { ar: "طقم أواني طبخ", en: "Cooking Set" },
                price: 550.00,
                quantity: 1,
                image: "https://placehold.co/200x200?text=Kitchen"
            }
        ],
        shippingAddress: {
            city: { ar: "المدينة المنورة", en: "Medina" },
            district: { ar: "باء", en: "Ba'a" },
            street: { ar: "طريق قباء", en: "Quba Road" }
        }
    }
    ,
    {
        id: "ord-106",
        orderNumber: "SA-99285",
        customer: {
            id: "cust-505",
            firstName: "Ahmad",
            lastName: "Khalid",
            email: "a.khalid@service.sa",
            phone: "+966 50 999 8877"
        },
        date: "2023-11-21T11:20:00Z",
        status: "refunded",
        subtotal: 550.00,
        tax: 82.50,
        shippingFees: 15.00,
        total: 647.50,
        currency: { ar: "ر.س", en: "SAR" },
        paymentMethod: "visa",
        items: [
            {
                id: "p-6",
                sku: "KIT-CH-22",
                name: { ar: "طقم أواني طبخ", en: "Cooking Set" },
                price: 550.00,
                quantity: 1,
                image: "https://placehold.co/200x200?text=Kitchen"
            }
        ],
        shippingAddress: {
            city: { ar: "المدينة المنورة", en: "Medina" },
            district: { ar: "باء", en: "Ba'a" },
            street: { ar: "طريق قباء", en: "Quba Road" }
        }
    }
];