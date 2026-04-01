import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import { safe } from "@/utils/safe"
import { getUserById } from "@/utils/db"
import ErrorDisplay from "@/components/ErrorDisplay"
import CustomerProfile from "@/components/UserDisplay"
import { User } from "@/types"

export default async function CustomerPage({
    params,
}: {
    params: Promise<{ customerId: string }>
}) {
    const { customerId } = await params
    const decodedId = decodeURIComponent(customerId)
    const displayLanguage = getDisplayLanguage()
    console.log(decodedId)
    const userResult = await safe<User>(getUserById(decodedId))
    if (!userResult.success) {
        return <ErrorDisplay error={userResult.error} />
    }
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <CustomerProfile className={styles.display} user={userResult.data} />
        </div>
    )
}
