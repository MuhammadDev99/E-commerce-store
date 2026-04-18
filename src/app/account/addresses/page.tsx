import styles from "./style.module.css"
import clsx from "clsx"
import { safe } from "@/utils/safe"
import AddressCardsContainer from "@/components/AddressCardsContainer"
import { getAddresses } from "@/utils/db/user"
import { showMessage } from "@/utils/showMessage"
import ErrorDisplay from "@/components/ErrorDisplay"
import { OSMPlace } from "@/types"

export default async function AddressesPage() {
    const addressesResult = await safe(getAddresses())

    if (!addressesResult.success) {
        showMessage({ content: "فشل تحميل العناوين، الرجاء المحاولة لاحقًا", type: "error" })
        return <ErrorDisplay error={addressesResult.error} />
    }
    return (
        <div className={clsx(styles.page)}>
            <div className={styles.titleWrapper}>
                <h2>العناوين</h2>
                <p>أدر عناوينك المحفوظة لتتمكن من إنهاء عمليات الشراء بسرعة وسهولة عبر متاجرنا</p>
            </div>
            <AddressCardsContainer addresses={addressesResult.data} />
        </div>
    )
}
