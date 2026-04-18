"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { useRef, useState } from "react"
import { useSignals } from "@preact/signals-react/runtime"
import TextBox from "@/components/form-elements/TextBox"
import Button from "@/components/Button"
import CodeInput from "@/components/form-elements/CodeInput"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { showMessage } from "@/utils/showMessage"
import { passwordValidation } from "@/inputValidations"
import { FormElementRef } from "@/types"

export default function RegisterPage() {
    useSignals()
    const router = useRouter()

    const [isOtpSent, setIsOtpSent] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // STATE TO SAVE FORM DATA
    const [savedData, setSavedData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    })

    // Refs
    const firstNameRef = useRef<FormElementRef>(null)
    const lastNameRef = useRef<FormElementRef>(null)
    const emailRef = useRef<FormElementRef>(null)
    const passwordRef = useRef<FormElementRef>(null)
    const confirmPasswordRef = useRef<FormElementRef>(null)
    const otpRef = useRef<FormElementRef>(null)

    // Step 1: Create Account & Send OTP
    const handleSendOtp = async () => {
        const registrationFields = [
            firstNameRef,
            lastNameRef,
            emailRef,
            passwordRef,
            confirmPasswordRef, // Included this one
        ]
        const isValidForm = registrationFields.every((ref) => ref.current?.validate() === true)
        if (!isValidForm) {
            showMessage({ type: "error", content: "الرجاء تعبئة جميع الحقول بشكل صحيح" })
            return
        }

        // Extract values with fallbacks to satisfy TypeScript (string | undefined -> string)
        const emailVal = emailRef.current?.value ?? ""
        const passwordVal = passwordRef.current?.value ?? ""
        const firstNameVal = firstNameRef.current?.value ?? ""
        const lastNameVal = lastNameRef.current?.value ?? ""

        setSavedData({
            firstName: firstNameVal,
            lastName: lastNameVal,
            email: emailVal,
            password: passwordVal,
        })

        setIsLoading(true)

        // 1. Create the user account FIRST
        const { error: signUpError } = await authClient.signUp.email({
            email: emailVal,
            password: passwordVal,
            name: `${firstNameVal} ${lastNameVal}`,
            // If your better-auth schema expects these additional fields:
            // @ts-ignore (only if your custom fields aren't in the base type yet)
            firstName: firstNameVal,
            lastName: lastNameVal,
        })

        if (signUpError) {
            setIsLoading(false)
            showMessage({
                title: "خطأ",
                content: signUpError.message || "فشل إنشاء الحساب، قد يكون البريد مستخدماً بالفعل",
                type: "error",
            })
            return
        }

        // 2. Send the Verification OTP
        const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
            email: emailVal,
            type: "email-verification",
        })

        setIsLoading(false)

        if (otpError) {
            showMessage({
                title: "خطأ",
                content: otpError.message || "تم إنشاء الحساب ولكن فشل إرسال الكود",
                type: "error",
            })
            setIsOtpSent(true)
        } else {
            setIsOtpSent(true)
            showMessage({
                title: "تم الإرسال",
                content: "يرجى التحقق من بريدك الإلكتروني وإدخال الكود",
                type: "success",
            })
        }
    }

    // Step 2: Verify OTP
    const handleVerifyAndRegister = async () => {
        const isOtpValid = otpRef.current?.validate()
        const otpVal = otpRef.current?.value ?? "" // Handle undefined

        if (!isOtpValid || !otpVal) return

        setIsLoading(true)

        const { error: verifyError } = await authClient.emailOtp.verifyEmail({
            email: savedData.email,
            otp: otpVal,
        })

        setIsLoading(false)

        if (verifyError) {
            showMessage({
                title: "رمز غير صحيح",
                content: "تأكد من إدخال الرمز الصحيح والمحاولة مرة أخرى",
                type: "error",
            })
        } else {
            showMessage({
                title: "مرحباً بك",
                content: "تم التحقق من الحساب بنجاح",
                type: "success",
            })
            router.push("/dashboard")
        }
    }

    // Validation Rules
    const validateRequired = (val: string) => (!val ? "هذا الحقل مطلوب" : null)
    const validateEmail = (val: string) => {
        if (!val) return "البريد الإلكتروني مطلوب"
        if (!/\S+@\S+\.\S+/.test(val)) return "يرجى إدخال بريد إلكتروني صحيح"
        return null
    }

    return (
        <div className={clsx(styles.root)}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h3>{isOtpSent ? "تحقق من البريد" : "إنشاء حساب"}</h3>
                    <p>
                        {isOtpSent
                            ? `أدخل الكود المرسل إلى ${savedData.email}`
                            : "أدخل بياناتك للانضمام إلينا"}
                    </p>
                </div>

                <div className={styles.formSection}>
                    {!isOtpSent ? (
                        <>
                            <div className={styles.nameRow}>
                                <TextBox
                                    ref={firstNameRef}
                                    label="الاسم الأول"
                                    placeholder="أحمد"
                                    validation={validateRequired}
                                />
                                <TextBox
                                    ref={lastNameRef}
                                    label="الاسم الأخير"
                                    placeholder="محمد"
                                    validation={validateRequired}
                                />
                            </div>
                            <TextBox
                                ref={emailRef}
                                label="البريد الإلكتروني"
                                type="email"
                                placeholder="mail@example.com"
                                validation={validateEmail}
                            />
                            <TextBox
                                ref={passwordRef}
                                label="كلمة المرور"
                                type="password"
                                placeholder="••••••••"
                                validation={passwordValidation}
                                onChange={() => passwordRef.current?.validate()}
                            />
                            <TextBox
                                ref={confirmPasswordRef}
                                label="تأكيد كلمة المرور"
                                type="password"
                                placeholder="••••••••"
                                validation={(value) => {
                                    if (value !== passwordRef.current?.value) {
                                        return "كلمة المرور غير متطابقة"
                                    }
                                }}
                                onChange={() => confirmPasswordRef.current?.validate()}
                            />
                        </>
                    ) : (
                        <CodeInput ref={otpRef} length={6} />
                    )}
                </div>

                <div className={styles.actions}>
                    <Button
                        variant="primary"
                        onClick={isOtpSent ? handleVerifyAndRegister : handleSendOtp}
                        loading={isLoading}
                        className={styles.submitBtn}
                    >
                        {isLoading
                            ? "جاري المعالجة..."
                            : isOtpSent
                              ? "تأكيد الكود والمتابعة"
                              : "إنشاء الحساب وإرسال الرمز"}
                    </Button>

                    {isOtpSent && (
                        <button
                            className={styles.textBtn}
                            onClick={() => window.location.reload()}
                            style={{ textAlign: "center", textDecoration: "none" }}
                        >
                            تغيير البريد الإلكتروني؟
                        </button>
                    )}

                    <div className={styles.footer}>
                        <span>لديك حساب؟</span>
                        <button
                            type="button"
                            className={styles.textBtn}
                            onClick={() => router.push("/login")}
                        >
                            تسجيل الدخول
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
