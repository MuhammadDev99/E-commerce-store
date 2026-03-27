"use client"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import styles from "./style.module.css"
import clsx from "clsx"
import SelectBox from "@/components/form-elements/SelectBox"
import NumberInput from "@/components/form-elements/NumberInput"
import TextBox from "@/components/form-elements/TextBox"

export default function TestPage() {
    return (
        <div className={styles.page}>
            <TextBox label="كود الخصم" placeholder="RAMADAN25" />

            <SelectBox
                label="نوع الكوبون"
                options={[
                    { display: "نسبة (%)", value: "percentage" },
                    { display: "مبلغ ثابت (ر.س)", value: "fixed" },
                    { display: "شحن مجاني", value: "free_shipping" },
                ]}
            />
            <NumberInput unit="%" min={1} max={99} label="قيمة الخصم" />
        </div>
    )
}
