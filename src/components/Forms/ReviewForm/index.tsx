"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import TextArea from "@/components/form-elements/TextArea"
import ReviewStarsInput from "@/components/form-elements/ReviewStarsInput"
import { useSignals, useSignal } from "@preact/signals-react/runtime"
import TextBox from "@/components/form-elements/TextBox"
import Button from "@/components/Button"
import { NewReview, Review } from "@/types"
import { addReviewDB } from "@/utils/db/admin"
import { safe } from "@/utils/safe"
import { showMessage } from "@/utils/showMessage"

export default function ReviewForm({
    className,
    productId,
}: {
    className?: string
    productId: number
}) {
    useSignals()
    const loading = useSignal(false)
    const form = useSignal<NewReview>({ productId, rate: 0, title: "", content: "", userId: "" })

    const submitForm = async () => {
        const { rate, title } = form.value
        if (rate === 0) {
            throw Error("يرجى اختيار التقييم بالنجوم")
        }
        if (title.length === 0) {
            throw Error("يرجى إضافة عنوان للتقييم")
        }
        await addReviewDB(form.value)
    }
    const handleSubmit = async () => {
        loading.value = true
        const result = await safe(submitForm())
        loading.value = false
        if (result.success) {
            showMessage({
                content: "تم إرسال التقييم بنجاح",
                type: "success",
                durationMs: 4000,
                title: "نجاح",
            })
            form.value = { productId, rate: 0, title: "", content: "", userId: "" }
        } else {
            showMessage({
                content: result.error.message || "حدث خطأ أثناء إرسال التقييم",
                type: "error",
                durationMs: 4000,
                title: "خطأ",
            })
        }
    }

    return (
        <div className={clsx(styles.root, className)}>
            <ReviewStarsInput
                value={form.value.rate}
                onChange={(value) => (form.value = { ...form.value, rate: value })}
                language="ar"
                showLabel={true}
            />
            <TextBox
                placeholder="أضف عنوان"
                value={form.value.title}
                onChange={(e) => (form.value = { ...form.value, title: e.target.value })}
            />
            <TextArea
                placeholder="ما يخطر ببالك عن المنتج..."
                value={form.value.content ?? ""}
                onChange={(value) => (form.value = { ...form.value, content: value })}
            />
            <Button
                type="primary"
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={loading.value}
            >
                {loading.value ? "جاري الإرسال..." : "أرسل التقييم"}
            </Button>
        </div>
    )
}
