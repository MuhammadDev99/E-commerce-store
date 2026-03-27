export type CouponType = "percentage" | "fixed" | "free_shipping";
export type CouponStatus = "active" | "expired"

export interface Coupon {
    id: string;
    name: string;
    code: string;
    type: CouponType;
    value: number | string;
    minOrderValue: number;
    startDate: string | null; // null = started from the beginning of time
    endDate: string | null;   // null = never expires
    usageLimit: number | null;
    userLimit: number | null;
}

export const MOCK_COUPONS: Coupon[] = [
    {
        id: "1",
        name: "تخفيضات الشتاء",
        code: "WINTER2024",
        type: "percentage",
        value: 15,
        minOrderValue: 100,
        startDate: "2024-11-01",
        endDate: "2024-12-31",
        usageLimit: 500,
        userLimit: 1
    },
    {
        id: "2",
        name: "خصم دائم للعملاء الجدد",
        code: "WELCOME",
        type: "fixed",
        value: 50,
        minOrderValue: 200,
        startDate: null, // لا يوجد تاريخ بدء محدد
        endDate: null,   // لا ينتهي أبداً
        usageLimit: null,
        userLimit: 1
    },
    {
        id: "3",
        name: "شحن مجاني للطلبات الكبيرة",
        code: "FREESHIP",
        type: "free_shipping",
        value: 0,
        minOrderValue: 500,
        startDate: "2024-01-01",
        endDate: null, // يبدأ بتاريخ معين لكن لا ينتهي
        usageLimit: 1000,
        userLimit: null
    },
    {
        id: "4",
        name: "تصفية عشوائية",
        code: "CLEARANCE",
        type: "percentage",
        value: 50,
        minOrderValue: 0,
        startDate: null, // بدأ بالفعل
        endDate: "2024-06-01", // ينتهي قريباً
        usageLimit: 100,
        userLimit: 2
    }
];