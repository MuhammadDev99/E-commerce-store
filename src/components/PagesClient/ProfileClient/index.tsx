"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import TextBox from "@/components/form-elements/TextBox"
import SelectBox from "@/components/form-elements/SelectBox"
import PhoneInput from "@/external/my-library/components/html-elements/PhoneInput"
import Button from "@/components/Button"
import styles from "./style.module.css"
import clsx from "clsx"
import { getNationalityOptions } from "@/external/my-library/utils/getCountries"
import RadioSelect from "@/components/RadioSelect"
import { User } from "lucide-react"
import { FormElementRef, UserProfile } from "@/types"
import { saveUserProfile } from "@/utils/db/user"
import { safe } from "@/utils/safe"
import { showMessage } from "@/utils/showMessage"

export default function ProfileClient({ profile }: { profile: UserProfile }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasChanged, setHasChanged] = useState(false) // 1. Track if anything changed
    const phoneRef = useRef<FormElementRef>(null)
    const firstNameRef = useRef<FormElementRef>(null)
    const lastNameRef = useRef<FormElementRef>(null)
    const nationalityRef = useRef<FormElementRef>(null)
    const birthdayRef = useRef<FormElementRef>(null)
    const sexRef = useRef<FormElementRef>(null)

    const nationalityOptions = getNationalityOptions()

    // 2. Helper to enable the button when a user interacts
    const onFieldChange = () => {
        if (!hasChanged) setHasChanged(true)
    }

    const handleSave = async () => {
        const fieldRefs = [phoneRef, firstNameRef, lastNameRef, nationalityRef, birthdayRef, sexRef]

        const validationResults = fieldRefs.map((ref) => ref.current?.validate())
        const firstErrorIndex = validationResults.indexOf(false)

        if (firstErrorIndex !== -1) {
            fieldRefs[firstErrorIndex].current?.focus()
            return
        }

        setIsSubmitting(true)

        const dobValue = birthdayRef.current?.value
        const profileData = {
            phoneNumber: phoneRef.current?.value,
            firstName: firstNameRef.current?.value,
            lastName: lastNameRef.current?.value,
            nationality: nationalityRef.current?.value,
            dateOfBirth: dobValue ? new Date(dobValue) : undefined,
            sex: (sexRef.current?.value as "male" | "female") || undefined,
        } as UserProfile

        const result = await safe(saveUserProfile(profileData))

        if (!result.success) {
            showMessage({
                content: result.error + " حدث خطأ أثناء حفظ البيانات",
                type: "error",
            })
        } else {
            showMessage({ content: "تم حفظ البيانات بنجاح", type: "success" })
            setHasChanged(false) // 3. Reset change tracker on success
            router.refresh()
        }

        setIsSubmitting(false)
    }
    console.log(profile.nationality)
    return (
        <div className={clsx(styles.page)}>
            <h1>حسابك</h1>

            <section className={styles.section}>
                <h4>معلومات التواصل</h4>
                <TextBox
                    label="البريد الإلكتروني"
                    defaultValue="mohammad.onthefloor@gmail.com"
                    readOnly
                />
                {/* 4. Add onChange to all components */}
                <PhoneInput ref={phoneRef} onChange={onFieldChange} value={profile.phoneNumber} />
            </section>

            <section className={styles.section}>
                <h4>معلوماتك الشخصية</h4>
                <div className={styles.row}>
                    <TextBox
                        ref={firstNameRef}
                        label="الاسم الأول"
                        placeholder="أدخل الاسم الأول"
                        onChange={onFieldChange}
                        defaultValue={profile.firstName}
                        validation={(value) => {
                            if (value && value.length < 3) {
                                return "يجب ان يكون الاسم اكبر من ثلاثة احرف"
                            }
                            return undefined
                        }}
                    />
                    <TextBox
                        ref={lastNameRef}
                        label="اسم العائلة"
                        placeholder="أدخل اسم العائلة"
                        onChange={onFieldChange}
                        defaultValue={profile.lastName}
                    />
                </div>

                <div className={styles.row}>
                    <SelectBox
                        ref={nationalityRef}
                        label="الجنسية"
                        placeholder="اختر الجنسية"
                        options={nationalityOptions}
                        onChange={onFieldChange}
                        defaultValue={profile.nationality}
                    />
                    <TextBox
                        ref={birthdayRef}
                        label="يوم الميلاد"
                        type="date"
                        onChange={onFieldChange}
                        defaultValue={profile.dateOfBirth}
                    />
                </div>

                <RadioSelect
                    ref={sexRef}
                    label="الجنس"
                    icon={User}
                    onChange={() => {
                        onFieldChange() // Trigger change on radio select
                    }}
                    options={[
                        { display: "ذكر", value: "male" },
                        { display: "أنثى", value: "female" },
                    ]}
                    defaultValue={profile.sex}
                />
            </section>

            <Button
                type="primary"
                onClick={handleSave}
                className={styles.submitBtn}
                // 5. Disable if no changes OR if currently submitting
                disabled={isSubmitting || !hasChanged}
            >
                {isSubmitting ? "جاري الحفظ..." : "حفظ المعلومات"}
            </Button>
        </div>
    )
}
