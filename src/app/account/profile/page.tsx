"use client"

import { useRef, useState } from "react"
import TextBox from "@/components/form-elements/TextBox"
import SelectBox from "@/components/form-elements/SelectBox"
import PhoneInput from "@/external/my-library/components/html-elements/PhoneInput"
import Button from "@/components/Button"
import styles from "./style.module.css"
import clsx from "clsx"

/**
 * Shared interface for our form components
 * This matches the useImperativeHandle logic in TextBox, SelectBox, and PhoneInput
 */
export interface FormElementRef {
    value: string
    error: string | undefined
    validate: () => boolean
    focus: () => void
}

export default function ProfilePage() {
    // 1. Phone State (PhoneInput is controlled)
    const [phone, setPhone] = useState<string>("")

    // 2. Create Refs for every field
    const phoneRef = useRef<FormElementRef>(null)
    const firstNameRef = useRef<FormElementRef>(null)
    const lastNameRef = useRef<FormElementRef>(null)
    const nationalityRef = useRef<FormElementRef>(null)
    const birthdayRef = useRef<FormElementRef>(null)

    const handleSave = () => {
        /**
         * 3. List refs in visual order (Top to Bottom).
         * This determines which field the page scrolls to first.
         */
        const fieldRefs = [phoneRef, firstNameRef, lastNameRef, nationalityRef, birthdayRef]

        // 4. Trigger validation for every field
        // We use .map to ensure all fields show their error messages simultaneously
        const validationResults = fieldRefs.map((ref) => ref.current?.validate())

        // 5. Find the index of the first field that returned 'false' (invalid)
        const firstErrorIndex = validationResults.indexOf(false)

        if (firstErrorIndex !== -1) {
            // 6. Scroll to and focus the first field that failed
            fieldRefs[firstErrorIndex].current?.focus()
            return
        }

        // 7. Success logic - All fields are valid
        const formData = {
            phone: phoneRef.current?.value,
            firstName: firstNameRef.current?.value,
            lastName: lastNameRef.current?.value,
            nationality: nationalityRef.current?.value,
            birthday: birthdayRef.current?.value,
        }

        console.log("Saving successfully:", formData)
        alert("تم حفظ المعلومات بنجاح")
    }

    return (
        <div className={clsx(styles.page)}>
            <h1>حسابك</h1>

            {/* Section 1: Contact Info */}
            <section className={styles.section}>
                <TextBox
                    label="البريد الإلكتروني"
                    defaultValue="mohammad.onthefloor@gmail.com"
                    readOnly
                />
                <PhoneInput ref={phoneRef} value={phone} onChange={setPhone} />
            </section>

            {/* Section 2: Personal Info */}
            <section className={styles.section}>
                <div className={styles.row}>
                    <TextBox
                        ref={firstNameRef}
                        label="الاسم الأول"
                        placeholder="أدخل الاسم الأول"
                        validation={(value) => {
                            if (!value) return "هذا الحقل مطلوب"
                            if (value.length < 3) return "يجب ان يكون الاسم اكبر من ثلاثة احرف"
                        }}
                    />
                    <TextBox
                        ref={lastNameRef}
                        label="اسم العائلة"
                        placeholder="أدخل اسم العائلة"
                        validation={(value) => (!value ? "هذا الحقل مطلوب" : undefined)}
                    />
                </div>

                <div className={styles.row}>
                    <SelectBox
                        ref={nationalityRef}
                        label="الجنسية"
                        defaultValue={"choose"}
                        options={[
                            { display: "اختر الجنسية", value: "choose" },
                            { display: "سعودي", value: "saudi" },
                            { display: "مصري", value: "egyption" },
                        ]}
                        validation={(val) => (val === "choose" ? "يرجى اختيار الجنسية" : undefined)}
                        helperText="لا يمكن تغييرها في وقت لاحق"
                    />
                    <TextBox
                        ref={birthdayRef}
                        label="يوم الميلاد"
                        type="date"
                        validation={(val) => (!val ? "يرجى تحديد التاريخ" : undefined)}
                        helperText="لا يمكن تغييرها في وقت لاحق"
                    />
                </div>
            </section>

            {/* Spacer for scroll testing */}
            <div style={{ height: "50vh", opacity: 0.1, pointerEvents: "none" }}>
                <p>{".\n".repeat(20)}</p>
                <p style={{ textAlign: "center" }}>
                    مساحة للتمرير لاختبار ميزة التمرير التلقائي للأخطاء
                </p>
            </div>

            <Button onClick={handleSave} className={styles.submitBtn}>
                حفظ المعلومات
            </Button>
        </div>
    )
}
