import styles from "./style.module.css"
import clsx from "clsx"
import CouponForm from "@/components/Forms/CouponForm"

export default function GenerateCouponPage() {
    return (
        <div className={clsx(styles.page)}>
            <CouponForm />
        </div>
    )
}
