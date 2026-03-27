"use client"
import { useState } from "react"
import styles from "./style.module.css"
import { ShippingSVG, PrintSVG, EditSVG } from "@/images" // Assuming you have these icons

// Mock Data for demonstration
const pendingOrders = [
    { id: "#1024", customer: "أحمد محمود", city: "الرياض", status: "جاهز للشحن", weight: "2.5kg" },
    { id: "#1023", customer: "سارة علي", city: "جدة", status: "جاهز للشحن", weight: "1.2kg" },
    { id: "#1022", customer: "خالد عمر", city: "الدمام", status: "جاهز للشحن", weight: "0.8kg" },
]

const shippingCompanies = [
    { name: "أرامكس", account: "Connected", status: "Active" },
    { name: "SMSA", account: "Connected", status: "Active" },
]

export default function ShippingPage() {
    const [selectedOrders, setSelectedOrders] = useState<string[]>([])

    const toggleOrder = (id: string) => {
        setSelectedOrders((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        )
    }

    return (
        <div className={styles.pageContainer}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <div className={styles.titleSection}>
                    <ShippingSVG className={styles.headerIcon} />
                    <h1>الشحن والتوصيل</h1>
                </div>
                <p>إدارة أوامر الشحن والتحكم في شركات التوصيل</p>
            </div>

            {/* Main Content Grid */}
            <div className={styles.gridLayout}>
                {/* Left Column: Shipping Management */}
                <div className={styles.mainColumn}>
                    {/* Section 1: Pending Shipments Table */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>طلبات جاهزة للشحن</h2>
                            <button className={styles.primaryBtn}>
                                <ShippingSVG className={styles.btnIcon} />
                                طلب شحن ({selectedOrders.length})
                            </button>
                        </div>

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>
                                            <input type="checkbox" />
                                        </th>
                                        <th>رقم الطلب</th>
                                        <th>العميل</th>
                                        <th>المدينة</th>
                                        <th>الوزن</th>
                                        <th>إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className={
                                                selectedOrders.includes(order.id)
                                                    ? styles.selectedRow
                                                    : ""
                                            }
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(order.id)}
                                                    onChange={() => toggleOrder(order.id)}
                                                />
                                            </td>
                                            <td>{order.id}</td>
                                            <td>{order.customer}</td>
                                            <td>{order.city}</td>
                                            <td>{order.weight}</td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <button className={styles.iconBtn}>
                                                        <PrintSVG />
                                                    </button>
                                                    <button className={styles.iconBtn}>
                                                        <EditSVG />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Info */}
                <div className={styles.sideColumn}>
                    {/* Section 2: Shipping Companies */}
                    <div className={styles.card}>
                        <h2>شركات الشحن</h2>
                        <div className={styles.companiesList}>
                            {shippingCompanies.map((company, idx) => (
                                <div key={idx} className={styles.companyItem}>
                                    <div className={styles.companyInfo}>
                                        <strong>{company.name}</strong>
                                        <span className={styles.statusActive}>
                                            {company.status}
                                        </span>
                                    </div>
                                    <button className={styles.linkBtn}>إعدادات</button>
                                </div>
                            ))}
                            <button className={styles.outlineBtn}>+ ربط شركة جديدة</button>
                        </div>
                    </div>

                    {/* Section 3: Pricing Zones */}
                    <div className={styles.card}>
                        <h2>مناطق التوصيل والتكلفة</h2>
                        <div className={styles.zoneItem}>
                            <span>المنطقة الوسطى</span>
                            <span className={styles.price}>15 ر.س</span>
                        </div>
                        <div className={styles.zoneItem}>
                            <span>المنطقة الغربية</span>
                            <span className={styles.price}>20 ر.س</span>
                        </div>
                        <div className={styles.zoneItem}>
                            <span>المنطقة الشرقية</span>
                            <span className={styles.price}>18 ر.س</span>
                        </div>
                        <button className={styles.linkBtn}>تعديل المناطق</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
