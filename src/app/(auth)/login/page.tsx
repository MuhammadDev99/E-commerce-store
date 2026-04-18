"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { useRef, useState } from "react"
import { useSignals } from "@preact/signals-react/runtime"
import TextBox from "@/components/form-elements/TextBox"
import Button from "@/components/Button"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { showMessage } from "@/utils/showMessage"
import { emailValidation, passwordValidation } from "@/inputValidations"

export default function LoginPage() {
    useSignals()
    const router = useRouter()

    const emailRef = useRef<any>(null)
    const passwordRef = useRef<any>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // أضفنا (e) لمنع الصفحة من التحديث عند الإرسال
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault() // منع تحديث الصفحة التلقائي

        const isEmailValid = emailRef.current?.validate()
        const isPassValid = passwordRef.current?.validate()

        if (!isEmailValid || !isPassValid) return

        setIsLoading(true)

        const { data, error } = await authClient.signIn.email({
            email: emailRef.current.value,
            password: passwordRef.current.value,
        })

        setIsLoading(false)

        if (error) {
            showMessage({
                title: "خطأ في تسجيل الدخول",
                content: error.message || "البريد الإلكتروني أو كلمة السر غير صحيحة",
                type: "error",
            })
        } else {
            showMessage({
                title: "أهلاً بك",
                content: "تم تسجيل الدخول بنجاح",
                type: "success",
            })
            router.push("/")
        }
    }

    return (
        <div className={clsx(styles.root)}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h3>تسجيل الدخول</h3>
                    <p>أهلاً بك مجدداً، يرجى إدخال بياناتك</p>
                </div>

                {/* تغليف الحقول بـ form واستخدام onSubmit */}
                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    <div className={styles.formSection}>
                        <TextBox
                            ref={emailRef}
                            label="البريد الإلكتروني"
                            placeholder="example@mail.com"
                            validation={emailValidation}
                            type="email"
                        />
                        <TextBox
                            ref={passwordRef}
                            label="كلمة السر"
                            placeholder="••••••••"
                            validation={passwordValidation}
                            type="password"
                        />
                        <div style={{ textAlign: "right", marginTop: "-10px" }}>
                            <button
                                type="button"
                                className={styles.textBtn}
                                style={{ fontSize: "0.85em" }}
                                onClick={() => router.push("/forgot-password")}
                            >
                                نسيت كلمة المرور؟
                            </button>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button
                            htmlType="submit"
                            variant="primary"
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
                </form>
            </div>
        </div>
    )
}
