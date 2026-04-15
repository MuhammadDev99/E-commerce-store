"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef, useRef } from "react"
import { useSignals } from "@preact/signals-react/runtime"
import TextBox from "@/components/form-elements/TextBox"
import Button from "@/components/Button"

// 1. Added meaningful props
type Props = {
    onLogin?: (data: { email: string; pass: string }) => void
    onRegister?: () => void
    isLoading?: boolean
} & ComponentPropsWithoutRef<"div">

export default function LoginView({ onLogin, onRegister, isLoading, className, ...rest }: Props) {
    useSignals()

    // Refs to access the TextBox imperative methods (validate, value)
    const emailRef = useRef<any>(null)
    const passwordRef = useRef<any>(null)

    const handleSubmit = () => {
        // Trigger internal validation of both fields
        const isEmailValid = emailRef.current?.validate()
        const isPassValid = passwordRef.current?.validate()

        if (isEmailValid && isPassValid) {
            onLogin?.({
                email: emailRef.current.value,
                pass: passwordRef.current.value,
            })
        }
    }

    // Validation Rules
    const validateEmail = (val: string) => {
        if (!val) return "البريد الإلكتروني مطلوب"
        if (!/\S+@\S+\.\S+/.test(val)) return "يرجى إدخال بريد إلكتروني صحيح"
        return null
    }

    const validatePassword = (val: string) => {
        if (!val) return "كلمة السر مطلوبة"
        if (val.length < 6) return "كلمة السر يجب أن تكون 6 أحرف على الأقل"
        return null
    }

    return (
        <div className={clsx(styles.root, className)} {...rest}>
            <div className={styles.header}>
                <h3>تسجيل الدخول</h3>
                <p>أهلاً بك مجدداً، يرجى إدخال بياناتك</p>
            </div>

            <div className={styles.formSection}>
                <TextBox
                    ref={emailRef}
                    label="البريد الإلكتروني"
                    placeholder="example@mail.com"
                    validation={validateEmail}
                    type="email"
                />
                <TextBox
                    ref={passwordRef}
                    label="كلمة السر"
                    placeholder="••••••••"
                    validation={validatePassword}
                    type="password"
                />
            </div>

            <div className={styles.actions}>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={styles.submitBtn}
                >
                    {isLoading ? "جاري التحميل..." : "تسجيل الدخول"}
                </Button>

                <div className={styles.footer}>
                    <span>ليس لديك حساب؟</span>
                    <button type="button" className={styles.textBtn} onClick={onRegister}>
                        تسجيل حساب جديد
                    </button>
                </div>
            </div>
        </div>
    )
}
