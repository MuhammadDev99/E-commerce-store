"use client"
import { Button, Text, Textbox } from "@/external/my-library/components"
import styles from "./style.module.css"
import { showMessage } from "@/utils/showMessage"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { safe } from "@/external/my-library/utils"
import { MessageUI } from "@/types"
// 1. Import the authClient
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

type LoginFrom = {
    email: string
    password: string
}

const loginSuccessMessage: MessageUI = {
    title: "Login Successful",
    content: "You have successfully logged in!",
    type: "success",
}

export default function LoginPage() {
    useSignals()
    const router = useRouter()
    const form = useSignal<LoginFrom>({ email: "", password: "" })

    // 2. Implement the auth logic
    const loginAuth = async (formData: LoginFrom) => {
        const { data, error } = await authClient.signIn.email({
            email: formData.email,
            password: formData.password,
            callbackURL: "/dashboard", // Redirects after login
        })

        if (error) {
            // Throw the error so the 'safe' utility catches it
            throw new Error(error.message || "Invalid email or password")
        }

        return data
    }

    const handleLogin = async () => {
        const result = await safe(loginAuth(form.value))

        if (result.success) {
            showMessage(loginSuccessMessage)
        } else {
            showMessage({ content: result.error.message, type: "error" })
        }
    }

    return (
        <div className={styles.page}>
            <Textbox
                label="البريد الإلكتروني"
                type="email"
                value={form.value.email}
                onChange={(value) => (form.value = { ...form.value, email: value })}
            />
            <Textbox
                label="كلمة السر"
                type="password"
                value={form.value.password}
                onChange={(value) => (form.value = { ...form.value, password: value })}
            />
            <Button onClick={handleLogin} styleType="primary">
                تسجيل الدخول
            </Button>
            <Text>لا تملك حساب؟</Text>
            <Button onClick={() => router.push("/register")}>تسجيل حساب</Button>
        </div>
    )
}
