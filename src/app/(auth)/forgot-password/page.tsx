"use client"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import clsx from "clsx"
import styles from "./style.module.css"
import { useSignals } from "@preact/signals-react/runtime"
import TextBox from "@/components/form-elements/TextBox"
import Button from "@/components/Button"
import CodeInput from "@/components/form-elements/CodeInput"
import { authClient } from "@/lib/auth-client"
import { showMessage } from "@/utils/showMessage"
import { emailValidation, passwordValidation } from "@/inputValidations"
import { FormElementRef } from "@/types"

export default function ForgotPasswordPage() {
    useSignals()
    const router = useRouter()
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")

    const emailRef = useRef<FormElementRef>(null)
    const otpRef = useRef<FormElementRef>(null)
    const passwordRef = useRef<FormElementRef>(null)
    const confirmPasswordRef = useRef<FormElementRef>(null)

    // Step 1: Request OTP
    const handleSendOtp = async () => {
        const isValid = emailRef.current?.validate()
        if (!isValid) return

        const emailVal = emailRef.current?.value ?? ""
        setIsLoading(true)

        const { error } = await authClient.emailOtp.sendVerificationOtp({
            email: emailVal,
            type: "forget-password",
        })

        setIsLoading(false)

        if (error) {
            showMessage({
                title: "خطأ",
                content: error.message || "فشل إرسال الكود، تأكد من البريد الإلكتروني",
                type: "error",
            })
        } else {
            setEmail(emailVal)
            setIsOtpSent(true)
            showMessage({
                title: "تم الإرسال",
                content: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
                type: "success",
            })
        }
    }

    // Step 2: Reset Password
    const handleResetPassword = async () => {
        const otpVal = otpRef.current?.value ?? ""
        const passVal = passwordRef.current?.value ?? ""

        const isOtpValid = otpRef.current?.validate()
        const isPassValid = passwordRef.current?.validate()
        const isConfirmValid = confirmPasswordRef.current?.validate()

        if (!isOtpValid || !isPassValid || !isConfirmValid) return

        setIsLoading(true)

        const { error } = await authClient.emailOtp.resetPassword({
            email: email,
            otp: otpVal,
            password: passVal, // Change 'newPassword' to 'password' here
        })

        setIsLoading(false)

        if (error) {
            showMessage({
                title: "خطأ",
                content:
                    error.message || "فشل إعادة تعيين كلمة المرور، قد يكون الكود منتهي الصلاحية",
                type: "error",
            })
        } else {
            showMessage({
                title: "تم بنجاح",
                content: "تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول",
                type: "success",
            })
            router.push("/login")
        }
    }

    return (
        <div className={clsx(styles.root)}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h3>إعادة تعيين كلمة المرور</h3>
                    <p>
                        {isOtpSent
                            ? `أدخل الكود المرسل إلى ${email} وكلمة المرور الجديدة`
                            : "أدخل بريدك الإلكتروني للحصول على رمز التحقق"}
                    </p>
                </div>

                <div className={styles.formSection}>
                    {!isOtpSent ? (
                        <TextBox
                            ref={emailRef}
                            label="البريد الإلكتروني"
                            placeholder="example@mail.com"
                            validation={emailValidation}
                        />
                    ) : (
                        <>
                            <CodeInput ref={otpRef} length={6} />
                            <TextBox
                                ref={passwordRef}
                                label="كلمة المرور الجديدة"
                                type="password"
                                placeholder="••••••••"
                                validation={passwordValidation}
                            />
                            <TextBox
                                ref={confirmPasswordRef}
                                label="تأكيد كلمة المرور"
                                type="password"
                                placeholder="••••••••"
                                validation={(val) =>
                                    val !== passwordRef.current?.value
                                        ? "كلمة المرور غير متطابقة"
                                        : null
                                }
                            />
                        </>
                    )}
                </div>

                <div className={styles.actions}>
                    <Button
                        variant="primary"
                        onClick={isOtpSent ? handleResetPassword : handleSendOtp}
                        loading={isLoading}
                    >
                        {isOtpSent ? "تحديث كلمة المرور" : "إرسال كود التحقق"}
                    </Button>

                    <button className={styles.textBtn} onClick={() => router.push("/login")}>
                        العودة لتسجيل الدخول
                    </button>
                </div>
            </div>
        </div>
    )
}
