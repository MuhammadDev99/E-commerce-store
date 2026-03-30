import { useState } from "react"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginatedTable from "../PaginatedTable"
import Price from "../Price"
import { mockClients } from "@/MockDataClients"
import { getClientLinkById, stringToRandom } from "@/utils"
import Link from "next/link"
import { MailSVG, PhoneSVG, PinSVG } from "@/images"

export default function ClientsTable({ className }: { className?: string }) {
    // 1. Manage pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const pagesCount = 3

    const headers = ["العميل", "معلومات التواصل", "عدد الطلبات", "إجمالي الدفع"]

    // 2. (Optional) Slice your data so it actually paginates
    const currentData = mockClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    )
    const items = currentData.map((client) => {
        const clientImage = ""
        // const clientImage = "https://images.unsplash.com/photo-1560250097-0b93528c311a"
        const hue = stringToRandom(client.id.toString(), 0, 360)
        return (
            /* Note: Use a unique key like client.id */
            <div key={client.id} className={styles.item}>
                <div className={styles.customer}>
                    <div
                        className={styles.imageWrapper}
                        style={{
                            backgroundColor: `hsl(${hue} 100% 40%)`,
                        }}
                    >
                        {clientImage ? (
                            <img
                                src="https://images.unsplash.com/photo-1560250097-0b93528c311a"
                                className={styles.image}
                            />
                        ) : (
                            <p className={styles.nameShort}>{client.firstName[0]}</p>
                        )}
                    </div>
                    <Link href={getClientLinkById(client.id ?? 1)} className={styles.name}>
                        {client.firstName} {client.lastName}
                    </Link>
                </div>
                <div className={styles.contact}>
                    <p className={styles.email}>
                        <MailSVG />
                        {client.email}
                    </p>
                    <p className={styles.phone}>
                        <PhoneSVG />
                        <span>{client.phone}</span>
                    </p>
                    {/* <p className={styles.adress}>
                        <PinSVG />
                        {client.address.city}
                    </p> */}
                </div>
                <p className={styles.orderCount}>{client.totalOrders}</p>
                <Price className={styles.totalSpent} price={client.lifetimeValue} />
            </div>
        )
    })

    return (
        <div className={clsx(styles.root, className)}>
            <PaginatedTable
                headers={headers}
                items={items}
                className={styles.table}
                gridTemplate="2fr 2fr 1fr 1fr"
                pagesCount={pagesCount}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
                onSearch={(query) => {}}
                onSearchSubmit={() => {}}
                label=""
            />
        </div>
    )
}
