"use client"

import { useRef, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import clsx from "clsx"
import { User } from "lucide-react"

// Components
import TextBox from "@/components/form-elements/TextBox"
import SelectBox from "@/components/form-elements/SelectBox"
import PhoneInput from "@/external/my-library/components/html-elements/PhoneInput"
import RadioSelect from "@/components/RadioSelect"
import Button from "@/components/Button"

// Utils & Types
import styles from "./style.module.css"
import { getNationalityOptions } from "@/external/my-library/utils/getCountries"
import { FormElementRef, UserProfile } from "@/types"
import { saveUserProfile } from "@/utils/db/user"
import { safe } from "@/utils/safe"
import { showMessage } from "@/utils/showMessage"
import { nameValidation } from "@/inputValidations"

interface Props {
    profile: UserProfile
}

export default function ProfileClient({ profile }: Props) {
    const router = useRouter()

    // State
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasChanged, setHasChanged] = useState(false)

    // Refs
    const phoneRef = useRef<FormElementRef>(null)
    const firstNameRef = useRef<FormElementRef>(null)
    const lastNameRef = useRef<FormElementRef>(null)
    const nationalityRef = useRef<FormElementRef>(null)
    const birthdayRef = useRef<FormElementRef>(null)
    const sexRef = useRef<FormElementRef>(null)

    const nationalityOptions = useMemo(() => getNationalityOptions(), [])

    // Helper: Mark form as dirty and trigger validation if needed
    const handleChange = (ref?: React.RefObject<FormElementRef | null>) => {
        if (!hasChanged) setHasChanged(true)
        if (ref?.current) ref.current.validate()
    }

    const handleSave = async () => {
        const fieldRefs = [phoneRef, firstNameRef, lastNameRef, nationalityRef, birthdayRef, sexRef]

        // Validate all fields
        const isInvalid = fieldRefs.some((ref) => ref.current?.validate() === false)
        if (isInvalid) {
            const firstError = fieldRefs.find((ref) => ref.current?.validate() === false)
            firstError?.current?.focus()
            return
        }

        setIsSubmitting(true)

        const profileData: UserProfile = {
            phoneNumber: phoneRef.current?.value,
            firstName: firstNameRef.current?.value,
            lastName: lastNameRef.current?.value,
            nationality: nationalityRef.current?.value,
            dateOfBirth: birthdayRef.current?.value
                ? new Date(birthdayRef.current.value)
                : undefined,
            sex: (sexRef.current?.value as "male" | "female") || undefined,
        }

        const { success, error } = await safe(saveUserProfile(profileData))

        if (!success) {
            showMessage({
                content: `${error} حدث خطأ أثناء حفظ البيانات`,
                type: "error",
            })
        } else {
            showMessage({ content: "تم حفظ البيانات بنجاح", type: "success" })
            setHasChanged(false)
            router.refresh()
        }

        setIsSubmitting(false)
    }

    return (
        <div className={clsx(styles.page)}>
            <h1>حسابك</h1>

            {/* Contact Section */}
            <section className={styles.section}>
                <h4>معلومات التواصل</h4>
                <TextBox label="البريد الإلكتروني" defaultValue={profile.email || "—"} readOnly />
                <PhoneInput
                    ref={phoneRef}
                    onChange={() => handleChange()}
                    value={profile.phoneNumber}
                />
            </section>

            {/* Personal Info Section */}
            <section className={styles.section}>
                <h4>معلوماتك الشخصية</h4>
                <div className={styles.row}>
                    <TextBox
                        ref={firstNameRef}
                        label="الاسم الأول"
                        placeholder="أدخل الاسم الأول"
                        defaultValue={profile.firstName}
                        validation={nameValidation}
                        onChange={() => handleChange(firstNameRef)}
                    />
                    <TextBox
                        ref={lastNameRef}
                        label="اسم العائلة"
                        placeholder="أدخل اسم العائلة"
                        defaultValue={profile.lastName}
                        validation={nameValidation}
                        onChange={() => handleChange(lastNameRef)}
                    />
                </div>

                <div className={styles.row}>
                    <SelectBox
                        ref={nationalityRef}
                        label="الجنسية"
                        placeholder="اختر الجنسية"
                        options={nationalityOptions}
                        defaultValue={profile.nationality}
                        onChange={() => handleChange()}
                    />
                    <TextBox
                        ref={birthdayRef}
                        label="يوم الميلاد"
                        type="date"
                        defaultValue={profile.dateOfBirth}
                        onChange={() => handleChange()}
                    />
                </div>

                <RadioSelect
                    ref={sexRef}
                    label="الجنس"
                    icon={User}
                    options={[
                        { display: "ذكر", value: "male" },
                        { display: "أنثى", value: "female" },
                    ]}
                    defaultValue={profile.sex}
                    onChange={() => handleChange()}
                />
            </section>

            <Button
                variant="primary"
                onClick={handleSave}
                className={styles.submitBtn}
                disabled={isSubmitting || !hasChanged}
            >
                {isSubmitting ? "جاري الحفظ..." : "حفظ المعلومات"}
            </Button>
        </div>
    )
}
