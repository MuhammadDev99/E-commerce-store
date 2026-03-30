import styles from "./style.module.css"
import clsx from "clsx"
import Card from "@/components/Card"
import CouponsTable from "@/components/Tables/CouponsTable"
import Button from "@/components/Button"
import { TicketSVG } from "@/images"
import { getCoupons } from "@/utils/db"
import { CouponTableKey } from "@/types"

export default async function MarketingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { items, totalPages } = await getCoupons(await searchParams)

    return (
        <div className={clsx(styles.page)}>
            <Card className={styles.header} title="الكوبونات" icon={TicketSVG}>
                <Button href="/dashboard/marketing/generate-coupon" type="primary">
                    إصنع كوبون
                </Button>
            </Card>

            <CouponsTable initialData={items} initialTotalPages={totalPages} />
        </div>
    )
}
