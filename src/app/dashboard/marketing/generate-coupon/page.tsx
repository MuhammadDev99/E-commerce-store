"use client"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { useTransition } from "react"
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import Card from "@/components/Card"
import { ControlsSVG, DateSVG } from "@/images"
import TextBox from "@/components/form-elements/TextBox"
import SelectBox from "@/components/form-elements/SelectBox"
import NumberInput from "@/components/form-elements/NumberInput"
import CouponPreview from "@/components/CouponPreview"
import { createCouponDB } from "@/utils/db"
import { useRouter } from "next/navigation"
import { Button } from "@/external/my-library/components"

export default function GenerateCouponPage() {
    useSignals()
    const displayLanguage = getDisplayLanguage()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // --- General Info Signals ---
    const name = useSignal("")
    const code = useSignal("")
    const type = useSignal<"percentage" | "fixed" | "free_shipping">("percentage")
    const value = useSignal("")
    const minOrder = useSignal("")

    // --- Usage Limits Signals ---
    const startDate = useSignal("")
    const endDate = useSignal("")
    const globalUsageLimit = useSignal("")
    const customerUsageLimit = useSignal("1")

    const handleSave = () => {
        // Simple Validation
        if (!name.value || !code.value) {
            alert("يرجى إدخال اسم الكوبون والكود")
            return
        }

        startTransition(async () => {
            try {
                const result = await createCouponDB({
                    name: name.value,
                    code: code.value,
                    type: type.value,
                    value: value.value,
                    minOrder: minOrder.value,
                    startDate: startDate.value,
                    endDate: endDate.value,
                    globalUsageLimit: globalUsageLimit.value,
                    customerUsageLimit: customerUsageLimit.value,
                })

                if (result.success) {
                    alert("تم إنشاء الكوبون بنجاح")
                    router.push("/admin/coupons") // Or wherever your list is
                }
            } catch (error: any) {
                console.error(error)
                alert(error.message || "حدث خطأ أثناء حفظ الكوبون")
            }
        })
    }

    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <div className={styles.form}>
                <Card icon={ControlsSVG} title="المعلومات العامة" className={styles.card}>
                    <TextBox
                        label="اسم حملة الكوبون"
                        placeholder="تخفيضات رمضانية"
                        className={styles.field}
                        value={name.value}
                        onInput={(e: any) => (name.value = e.target.value)}
                    />
                    <div className={styles.row}>
                        <TextBox
                            className={styles.field}
                            label="كود الخصم"
                            placeholder="RAMADAN25"
                            value={code.value}
                            onInput={(e: any) => (code.value = e.target.value.toUpperCase())}
                        />

                        <SelectBox
                            className={styles.field}
                            label="نوع الكوبون"
                            options={[
                                { display: "نسبة (%)", value: "percentage" },
                                { display: "مبلغ ثابت (ر.س)", value: "fixed" },
                                { display: "شحن مجاني", value: "free_shipping" },
                            ]}
                            value={type.value}
                            onChange={(e: any) => (type.value = e.target.value)}
                        />
                    </div>

                    <div className={styles.row}>
                        <NumberInput
                            className={styles.field}
                            unit={type.value === "percentage" ? "%" : "ر.س"}
                            label="قيمة الخصم"
                            placeholder="الخصم"
                            disabled={type.value === "free_shipping"}
                            value={value.value}
                            onInput={(e: any) => (value.value = e.target.value)}
                        />
                        <NumberInput
                            className={styles.field}
                            unit="ر.س"
                            label="الحد الأدنى لسعر الطلب"
                            placeholder="0.00"
                            value={minOrder.value}
                            onInput={(e: any) => (minOrder.value = e.target.value)}
                        />
                    </div>
                </Card>

                <Card icon={DateSVG} title="حدود الإستخدام" className={styles.card}>
                    <div className={styles.row}>
                        <TextBox
                            className={styles.field}
                            label="تاريخ البدء"
                            type="date"
                            value={startDate.value}
                            onInput={(e: any) => (startDate.value = e.target.value)}
                        />
                        <TextBox
                            className={styles.field}
                            label="تاريخ الانتهاء"
                            type="date"
                            value={endDate.value}
                            onInput={(e: any) => (endDate.value = e.target.value)}
                        />
                    </div>
                    <div className={styles.row}>
                        <NumberInput
                            className={styles.field}
                            unit="مرة"
                            min={0}
                            label="حد عدد مرات الاستخدام"
                            placeholder="لا نهائي"
                            value={globalUsageLimit.value}
                            onInput={(e: any) => (globalUsageLimit.value = e.target.value)}
                        />
                        <NumberInput
                            className={styles.field}
                            unit="مرة"
                            min={1}
                            label="الحد للعميل الواحد"
                            placeholder="1"
                            value={customerUsageLimit.value}
                            onInput={(e: any) => (customerUsageLimit.value = e.target.value)}
                        />
                    </div>
                </Card>

                <div className={styles.actions}>
                    <Button
                        styleType="primary"
                        onClick={handleSave}
                        disabled={isPending}
                        className={styles.saveBtn}
                    >
                        {isPending ? "جاري الحفظ..." : "حفظ الكوبون"}
                    </Button>
                </div>
            </div>

            <CouponPreview
                className={styles.couponPreview}
                name={name}
                code={code}
                type={type}
                value={value}
            />
        </div>
    )
}
