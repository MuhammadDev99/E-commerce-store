// --- TYPES & INTERFACES ---

export type ReviewStatus = 'pending' | 'approved' | 'hidden';

export interface Customer {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string; // Optional if you want to display profile pictures later
}

export interface Product {
    id: string;
    name: string;
    slug: string; // Used to generate the link to the product page
}

export interface Review {
    id: string;
    customer: Customer;
    product: Product;
    rating: number; // 1 to 5
    comment: string;
    status: ReviewStatus;
    createdAt: string; // ISO string or formatted date
    adminReply?: string; // Optional field if the admin has already replied
}

export interface ReviewsSummary {
    totalReviews: number;
    averageRating: number;
    positivePercentage: number;
    pendingCount: number;
}


// --- MOCK DATA ---

// 1. KPI Stats Mock Data
export const mockReviewsSummary: ReviewsSummary = {
    totalReviews: 1248,
    averageRating: 4.7,
    positivePercentage: 85,
    pendingCount: 14,
};

// 2. Reviews Table Mock Data
export const mockReviews: Review[] = [
    {
        id: "REV-1001",
        customer: {
            id: "CUST-001",
            name: "أحمد محمود",
            email: "ahmed@example.com",
        },
        product: {
            id: "PROD-992",
            name: "هاتف ايفون 15 برو ماكس",
            slug: "iphone-15-pro-max",
        },
        rating: 4.7,
        comment: "منتج ممتاز جداً والتوصيل كان سريعاً. أنصح بالتعامل مع هذا المتجر.",
        status: "pending",
        createdAt: "منذ ساعتين",
    },
    {
        id: "REV-1002",
        customer: {
            id: "CUST-002",
            name: "سارة علي",
            email: "sara@example.com",
        },
        product: {
            id: "PROD-405",
            name: "سماعات أبل اللاسلكية",
            slug: "apple-airpods-pro",
        },
        rating: 3.5,
        comment: "الصوت جيد ولكن العلبة وصلتني مخدوشة قليلاً.",
        status: "approved",
        createdAt: "24 مارس 2026",
    },
    {
        id: "REV-1003",
        customer: {
            id: "CUST-003",
            name: "خالد عبدالله",
            email: "khaled@example.com",
        },
        product: {
            id: "PROD-112",
            name: "شاحن سيارة سريع 65W",
            slug: "fast-car-charger-65w",
        },
        rating: 1,
        comment: "المنتج تعطل بعد يومين من الاستخدام! أسوأ تجربة شراء.",
        status: "hidden",
        createdAt: "22 مارس 2026",
    },
    {
        id: "REV-1004",
        customer: {
            id: "CUST-004",
            name: "فاطمة حسن",
            email: "fatima.h@example.com",
        },
        product: {
            id: "PROD-883",
            name: "ماكينة قهوة اسبريسو",
            slug: "espresso-coffee-machine",
        },
        rating: 4.2,
        comment: "الماكينة رائعة وتصنع قهوة بجودة الكافيهات، لكن الكتالوج باللغة الإنجليزية فقط.",
        status: "approved",
        createdAt: "20 مارس 2026",
        adminReply: "شكراً لتقييمك يا فاطمة! سنقوم بتوفير نسخة عربية من الكتالوج قريباً بصيغة PDF.",
    },
    {
        id: "REV-1005",
        customer: {
            id: "CUST-005",
            name: "عمر الفاروق",
            email: "omar.f@example.com",
        },
        product: {
            id: "PROD-334",
            name: "ساعة ذكية رياضية",
            slug: "smart-sports-watch",
        },
        rating: 5,
        comment: "ساعة عملية جداً وتتبع النبض دقيق. التغليف كان ممتاز.",
        status: "pending",
        createdAt: "منذ 5 ساعات",
    }
];