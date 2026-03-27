// types.ts (Optional: If you are using TypeScript)
export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';
export type ClientStatus = 'Active' | 'Inactive' | 'Blocked';

export interface Order {
    id: string;
    date: string;
    status: OrderStatus;
    total: number;
}

export interface Address {
    street: string;
    apt?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string | null;
    status: ClientStatus;
    address: Address;
    customerSince: string;
    marketingSubscribed: boolean;
    lifetimeValue: number;
    totalOrders: number;
    recentOrders: Order[];
}

// mockClients.ts
// mockClients.ts
export const mockClients: Client[] = [
    {
        id: "CLI-20001",
        firstName: "محمد",
        lastName: "القحطاني",
        email: "m.alqahtani@example.sa",
        phone: "+966 50 123 4567",
        avatarUrl: null, // Will fall back to initials "م ق"
        status: "Active",
        address: {
            street: "طريق الملك فهد",
            apt: "شقة 12",
            city: "الرياض",
            state: "منطقة الرياض",
            zipCode: "12211",
            country: "المملكة العربية السعودية"
        },
        customerSince: "2023-01-15T10:30:00Z",
        marketingSubscribed: true,
        lifetimeValue: 4500.00,
        totalOrders: 15,
        recentOrders: [
            { id: "ORD-20101", date: "2026-03-21T14:20:00Z", status: "Processing", total: 850.00 },
            { id: "ORD-19842", date: "2025-12-15T09:15:00Z", status: "Delivered", total: 1200.50 }
        ]
    },
    {
        id: "CLI-20002",
        firstName: "سارة",
        lastName: "الغامدي",
        email: "s.alghamdi@webmail.sa",
        phone: "+966 55 987 6543",
        avatarUrl: "https://i.pravatar.cc/150?u=sarah.g",
        status: "Active",
        address: {
            street: "حي الروضة، شارع الأمير سلطان",
            city: "جدة",
            state: "منطقة مكة المكرمة",
            zipCode: "23431",
            country: "المملكة العربية السعودية"
        },
        customerSince: "2022-05-18T11:00:00Z",
        marketingSubscribed: true,
        lifetimeValue: 12340.50,
        totalOrders: 28,
        recentOrders: [
            { id: "ORD-20551", date: "2026-03-10T18:30:00Z", status: "Shipped", total: 2450.00 },
            { id: "ORD-19211", date: "2026-01-01T12:00:00Z", status: "Delivered", total: 550.00 }
        ]
    },
    {
        id: "CLI-20003",
        firstName: "فهد",
        lastName: "العتيبي",
        email: "f.alotaibi@provider.com",
        phone: "+966 56 444 3322",
        avatarUrl: null,
        status: "Inactive",
        address: {
            street: "طريق الملك عبدالعزيز",
            apt: "الدور الثاني",
            city: "الدمام",
            state: "المنطقة الشرقية",
            zipCode: "32413",
            country: "المملكة العربية السعودية"
        },
        customerSince: "2021-11-05T14:22:00Z",
        marketingSubscribed: false,
        lifetimeValue: 320.00,
        totalOrders: 2,
        recentOrders: [
            { id: "ORD-05020", date: "2024-02-05T14:25:00Z", status: "Delivered", total: 320.00 }
        ]
    },
    {
        id: "CLI-20004",
        firstName: "Noura",
        lastName: "Alshahri",
        email: "noura.sh@example.com",
        phone: "+966 54 222 1188",
        avatarUrl: null,
        status: "Active",
        address: {
            street: "حي النرجس",
            apt: "فيلا 4",
            city: "الرياض",
            state: "منطقة الرياض",
            zipCode: "13322",
            country: "المملكة العربية السعودية"
        },
        customerSince: "2024-08-20T09:45:00Z",
        marketingSubscribed: true,
        lifetimeValue: 850.75,
        totalOrders: 3,
        recentOrders: [
            { id: "ORD-20884", date: "2026-03-10T15:30:00Z", status: "Shipped", total: 210.25 },
            { id: "ORD-20452", date: "2025-11-11T08:20:00Z", status: "Delivered", total: 140.50 }
        ]
    },
    {
        id: "CLI-20005",
        firstName: "عبدالله",
        lastName: "الزهراني",
        email: "a.alzahrani@outlook.sa",
        phone: "+966 53 111 2233",
        avatarUrl: "https://i.pravatar.cc/150?u=a.zahrani",
        status: "Blocked",
        address: {
            street: "طريق الهجرة",
            city: "المدينة المنورة",
            state: "منطقة المدينة المنورة",
            zipCode: "42313",
            country: "المملكة العربية السعودية"
        },
        customerSince: "2025-01-10T11:15:00Z",
        marketingSubscribed: false,
        lifetimeValue: 0.00,
        totalOrders: 1,
        recentOrders: [
            { id: "ORD-20999", date: "2026-01-12T10:00:00Z", status: "Cancelled", total: 1500.00 }
        ]
    }
];