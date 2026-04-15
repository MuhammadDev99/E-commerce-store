"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { useRef, useState } from "react"
import { useSignals } from "@preact/signals-react/runtime"
import TextBox from "@/components/form-elements/TextBox"
import Button from "@/components/Button"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { showMessage } from "@/utils/showMessage" // أضفنا هذه لاستيراد رسائل التنبيه

export default function LoginPage() {
    useSignals()
    const router = useRouter()

    // Refs to access the TextBox imperative methods (validate, value)
    const emailRef = useRef<any>(null)
    const passwordRef = useRef<any>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleSubmit = async () => {
        // Trigger internal validation of both fields
        const isEmailValid = emailRef.current?.validate()
        const isPassValid = passwordRef.current?.validate()

        if (!isEmailValid || !isPassValid) return

        setIsLoading(true)

        // استدعاء دالة تسجيل الدخول من better-auth
        const { data, error } = await authClient.signIn.email({
            email: emailRef.current.value,
            password: passwordRef.current.value,
        })

        setIsLoading(false)

        if (error) {
            // عرض رسالة خطأ في حال فشل تسجيل الدخول
            showMessage({
                title: "خطأ في تسجيل الدخول",
                content: error.message || "البريد الإلكتروني أو كلمة السر غير صحيحة",
                type: "error",
            })
        } else {
            // عرض رسالة نجاح وتوجيه المستخدم للوحة التحكم
            showMessage({
                title: "أهلاً بك",
                content: "تم تسجيل الدخول بنجاح",
                type: "success",
            })
            router.push("/dashboard")
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
        <div className={clsx(styles.root)}>
            <div className={styles.card}>
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
                        <button
                            type="button"
                            className={styles.textBtn}
                            onClick={() => router.push("/register")}
                        >
                            تسجيل حساب جديد
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
