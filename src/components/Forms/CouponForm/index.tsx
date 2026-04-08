"use client"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { useTransition } from "react"
import styles from "./style.module.css"
import clsx from "clsx"
import { getCpuponLinkById, getDisplayLanguage } from "@/utils"
import Card from "@/components/Card"
import { ControlsSVG, DateSVG } from "@/images"
import TextBox from "@/components/form-elements/TextBox"
import SelectBox from "@/components/form-elements/SelectBox"
import NumberInput from "@/components/form-elements/NumberInput"
import CouponPreview from "@/components/CouponPreview"
import { useRouter } from "next/navigation"
import { Button } from "@/external/my-library/components"
import { Coupon, NewCoupon } from "@/types"
import { upsertCoupon } from "@/utils/db/admin"
import { safe } from "@/utils/safe"
import { showMessage } from "@/utils/showMessage"

export default function CouponForm({ coupon }: { coupon?: Coupon }) {
    useSignals()
    const displayLanguage = getDisplayLanguage()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const form = useSignal<NewCoupon>(
        coupon
            ? coupon
            : {
                  name: "",
                  code: "",
                  type: "percentage",
                  value: 0,
                  minOrder: 0,
                  enabled: true, // This controls the 'enabled' boolean in your schema
                  startDate: null,
                  endDate: null,
                  globalUsageLimit: null,
                  customerUsageLimit: 1,
              },
    )

    // Typed helper to update the signal
    const update = (patch: Partial<NewCoupon>) => {
        form.value = { ...form.value, ...patch }
    }

    const handleSave = () => {
        if (!form.value.name || !form.value.code) {
            showMessage({ type: "error", content: "يرجى إدخال اسم الكوبون والكود" })
            return
        }

        startTransition(async () => {
            // The form.value now matches your Drizzle NewCoupon type exactly
            const result = await safe(upsertCoupon(form.value))

            if (result.success) {
                showMessage({ type: "success", content: "تم حفظ الكوبون بنجاح" })
                router.push(getCpuponLinkById(result.data.id))
            } else {
                showMessage({ type: "error", content: result.error.message })
            }
        })
    }

    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <div className={styles.form}>
                <Card icon={ControlsSVG} title="المعلومات العامة" className={styles.card}>
                    <div className={styles.row}>
                        <TextBox
                            label="اسم حملة الكوبون"
                            placeholder="تخفيضات رمضانية"
                            className={styles.field}
                            value={form.value.name}
                            onInput={(e: any) => update({ name: e.target.value })}
                        />

                        {/* Status Select Box (Mapping to 'enabled' boolean) */}
                        <SelectBox
                            className={styles.field}
                            label="حالة الكوبون"
                            options={[
                                { display: "مفعل", value: "true" },
                                { display: "معطل", value: "false" },
                            ]}
                            value={String(form.value.enabled)}
                            onChange={(e: any) => update({ enabled: e.target.value === "true" })}
                        />
                    </div>

                    <div className={styles.row}>
                        <TextBox
                            className={styles.field}
                            label="كود الخصم"
                            placeholder="RAMADAN25"
                            value={form.value.code}
                            onInput={(e: any) => update({ code: e.target.value.toUpperCase() })}
                        />

                        <SelectBox
                            className={styles.field}
                            label="نوع الكوبون"
                            options={[
                                { display: "نسبة (%)", value: "percentage" },
                                { display: "مبلغ ثابت (ر.س)", value: "fixed" },
                                { display: "شحن مجاني", value: "free_shipping" },
                            ]}
                            value={form.value.type}
                            onChange={(e: any) => update({ type: e.target.value as any })}
                        />
                    </div>

                    <div className={styles.row}>
                        <NumberInput
                            className={styles.field}
                            unit={form.value.type === "percentage" ? "%" : "ر.س"}
                            label="قيمة الخصم"
                            placeholder="0"
                            disabled={form.value.type === "free_shipping"}
                            value={form.value.value ?? ""}
                            onInput={(e: any) => update({ value: parseInt(e.target.value) || 0 })}
                        />
                        <NumberInput
                            className={styles.field}
                            unit="ر.س"
                            label="الحد الأدنى للطلب"
                            placeholder="0.00"
                            value={form.value.minOrder ?? ""}
                            onInput={(e: any) =>
                                update({ minOrder: parseInt(e.target.value) || 0 })
                            }
                        />
                    </div>
                </Card>

                <Card icon={DateSVG} title="حدود الإستخدام والجدولة" className={styles.card}>
                    <div className={styles.row}>
                        <TextBox
                            className={styles.field}
                            label="تاريخ البدء"
                            type="date"
                            value={
                                form.value.startDate
                                    ? new Date(form.value.startDate).toISOString().split("T")[0]
                                    : ""
                            }
                            onInput={(e: any) =>
                                update({
                                    startDate: e.target.value ? new Date(e.target.value) : null,
                                })
                            }
                        />
                        <TextBox
                            className={styles.field}
                            label="تاريخ الانتهاء"
                            type="date"
                            value={
                                form.value.endDate
                                    ? new Date(form.value.endDate).toISOString().split("T")[0]
                                    : ""
                            }
                            onInput={(e: any) =>
                                update({
                                    endDate: e.target.value ? new Date(e.target.value) : null,
                                })
                            }
                        />
                    </div>
                    <div className={styles.row}>
                        <NumberInput
                            className={styles.field}
                            unit="مرة"
                            min={0}
                            label="إجمالي مرات الاستخدام"
                            placeholder="لا نهائي"
                            value={form.value.globalUsageLimit ?? ""}
                            onInput={(e: any) =>
                                update({ globalUsageLimit: parseInt(e.target.value) || null })
                            }
                        />
                        <NumberInput
                            className={styles.field}
                            unit="مرة"
                            min={1}
                            label="الحد للعميل الواحد"
                            placeholder="1"
                            value={form.value.customerUsageLimit ?? 1}
                            onInput={(e: any) =>
                                update({ customerUsageLimit: parseInt(e.target.value) || 1 })
                            }
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

            <CouponPreview className={styles.couponPreview} form={form} />
        </div>
    )
}
