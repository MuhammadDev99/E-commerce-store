"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import stylesLibrary from "@/style/stylesLibrary.module.css"
import TextArea from "@/components/form-elements/TextArea"
import Card from "@/components/Card"
import { PinAndPaperSVG } from "@/images"
import ReviewStarsInput from "@/components/form-elements/ReviewStarsInput"
import { useSignals, useSignal } from "@preact/signals-react/runtime"
import TextBox from "@/components/form-elements/TextBox"
import Button from "@/components/Button"
export default function ReviewForm({ className }: { className?: string }) {
    useSignals()
    const starRateSignal = useSignal<number>(0)
    return (
        <Card className={clsx(styles.root, className)} title="أكتب تقييمك" icon={PinAndPaperSVG}>
            <div className={styles.form}>
                <ReviewStarsInput
                    className={styles.inputStars}
                    value={starRateSignal.value}
                    onChange={(value) => (starRateSignal.value = value)}
                    showLabel={true}
                    language="ar"
                />
                <TextBox placeholder="أضف عنوان" className={styles.titleInput} />
                <TextArea
                    placeholder="ما يخطر ببالك عن المنتج..."
                    className={styles.contentInput}
                    charLimit={2000}
                />
                <Button type="primary" className={styles.submitButton}>
                    أرسل التقييم
                </Button>
            </div>
        </Card>
    )
}
