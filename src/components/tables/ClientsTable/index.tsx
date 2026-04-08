"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginatedTable from "@/components/PaginatedTable"
import Price from "@/components/Price"
import { getClientLinkById, stringToRandom } from "@/utils"
import { CustomersTableConfig } from "@/types"
import { getCustomersPaged } from "@/utils/db/admin"
import Link from "next/link"
import { MailSVG, PhoneSVG } from "@/images"
import AvatarImage from "@/components/AvatarImage"

export default function CustomersTable({
    className,
    initialData,
    initialTotalPages,
    initialPageSize,
}: {
    className?: string
    initialData: CustomersTableConfig["row"][]
    initialTotalPages: number
    initialPageSize: number
}) {
    const headers: CustomersTableConfig["headers"][] = [
        {
            display: "تاريخ الإنشاء",
            value: "createdAt",
            searchable: false,
            sortable: true,
            hidden: true,
        },
        { display: "الزبون", value: "name", searchable: true, sortable: true },
        { display: "معلومات التواصل", value: "contact", searchable: true, sortable: true },
        { display: "عدد الطلبات", value: "totalOrders", searchable: false, sortable: true },
        { display: "إجمالي الإنفاق", value: "totalSpent", searchable: false, sortable: true },
    ]

    return (
        <PaginatedTable<CustomersTableConfig>
            className={clsx(styles.root, className)}
            initialData={initialData}
            initialTotalPages={initialTotalPages}
            defaultSearchColumn="name"
            defaultSortColumn="createdAt"
            gridTemplate="2fr 2fr 1fr 1fr"
            fetchData={async (params) => await getCustomersPaged(params)}
            headers={headers}
            pageSize={initialPageSize}
            renderItem={(customer, isPending) => {
                const clientImage = ""
                // const clientImage = "https://images.unsplash.com/photo-1560250097-0b93528c311a"
                const hue = stringToRandom(customer.id.toString(), 0, 360)
                return (
                    <div key={customer.id} className={styles.item}>
                        <div className={styles.customer}>
                            <AvatarImage
                                name={customer.name}
                                userId={customer.id}
                                src={clientImage}
                            />
                            <Link href={getClientLinkById(customer.id)} className={styles.name}>
                                {customer.name}
                            </Link>
                        </div>
                        <div className={styles.contact}>
                            <p className={styles.email}>
                                <MailSVG />
                                <span>{customer.email}</span>
                            </p>
                            <p className={styles.phone}>
                                <PhoneSVG />
                                <span>{customer.phoneNumber}</span>
                            </p>
                            {/* <p className={styles.adress}>
                        <PinSVG />
                        {client.address.city}
                    </p> */}
                        </div>
                        <p className={styles.orderCount}>{customer.totalOrders}</p>
                        <Price className={styles.totalSpent} price={customer.totalSpent} />
                    </div>
                )
            }}
        />
    )
}
