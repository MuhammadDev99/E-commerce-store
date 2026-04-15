"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import { useSignals } from "@preact/signals-react/runtime"
import { useSignal } from "@preact/signals-react"
import { authClient } from "@/lib/auth-client"
import { showMessage } from "@/utils/showMessage"

type Props = {} & ComponentPropsWithoutRef<"div">

export default function LoginWindow({ ...rest }: Props) {
    useSignals()

    // UI State
    const step = useSignal<"email" | "otp">("email")
    const email = useSignal("")
    const otp = useSignal("")
    const loading = useSignal(false)

    const handleSendCode = async () => {
        if (!email.value.includes("@")) {
            showMessage("Please enter a valid email")
            return
        }

        loading.value = true
        const { error } = await authClient.emailOtp.sendVerificationOtp({
            email: email.value,
            type: "sign-in", // This works for both login and registration
        })
        loading.value = false

        if (error) {
            showMessage(error.message || "Failed to send code")
        } else {
            step.value = "otp"
            showMessage("Code sent to your email!")
        }
    }

    const handleVerifyCode = async () => {
        if (otp.value.length < 6) {
            showMessage("Please enter the 6-digit code")
            return
        }

        loading.value = true

        // CHANGE THIS LINE:
        const { data, error } = await authClient.signIn.emailOtp({
            email: email.value,
            otp: otp.value,
        })

        if (error) {
            showMessage(error.message || "Invalid code")
            loading.value = false
        } else {
            showMessage("Success! Logging you in...")
            // You can also use router.push() if you use the useRouter hook
            window.location.reload()
        }
    }

    return (
        <div className={clsx(styles.root, rest.className)}>
            <div className={styles.window}>
                <h2>{step.value === "email" ? "Login or Register" : "Enter Code"}</h2>
                <p>Welcome to MeHappy</p>

                {step.value === "email" ? (
                    <div className={styles.form}>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email.value}
                            onChange={(e) => (email.value = e.target.value)}
                            className={styles.input}
                        />
                        <button
                            disabled={loading.value}
                            onClick={handleSendCode}
                            className={styles.button}
                        >
                            {loading.value ? "Sending..." : "Continue with Email"}
                        </button>
                    </div>
                ) : (
                    <div className={styles.form}>
                        <p className={styles.subtext}>
                            Code sent to <b>{email.value}</b>
                        </p>
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            value={otp.value}
                            onChange={(e) => (otp.value = e.target.value)}
                            className={styles.input}
                            style={{ textAlign: "center", letterSpacing: "8px", fontSize: "24px" }}
                        />
                        <button
                            disabled={loading.value}
                            onClick={handleVerifyCode}
                            className={styles.button}
                        >
                            {loading.value ? "Verifying..." : "Verify & Login"}
                        </button>
                        <button
                            onClick={() => (step.value = "email")}
                            className={styles.backButton}
                        >
                            Change Email
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
