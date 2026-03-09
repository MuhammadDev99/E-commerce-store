"use client";
import { Button, Textbox } from "@/app/external/my-library/components";
import styles from "./style.module.css";
import { showMessage } from "@/app/utils/showMessage";
import { useSignal, useSignals } from "@preact/signals-react/runtime";
import { safe } from "@/app/external/my-library/utils";
import { MessageUI } from "@/types";
// 1. Import the authClient
import { authClient } from "@/lib/auth-client";

type LoginFrom = {
  email: string;
  password: string;
};

const loginSuccessMessage: MessageUI = {
  type: "success",
  title: "Success",
  content: "Login successful!",
  durationMs: 3000,
};

export default function LoginPage() {
  useSignals();
  const form = useSignal<LoginFrom>({ email: "", password: "" });

  // 2. Implement the auth logic
  const loginAuth = async (formData: LoginFrom) => {
    const { data, error } = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
      callbackURL: "/dashboard", // Redirects after login
    });

    if (error) {
      // Throw the error so the 'safe' utility catches it
      throw new Error(error.message || "Invalid email or password");
    }

    return data;
  };

  const handleLogin = async () => {
    const result = await safe(loginAuth(form.value));

    if (result.success) {
      showMessage(loginSuccessMessage);
    } else {
      showMessage({
        type: "error",
        title: "Login Failed",
        content: result.error.message,
        durationMs: 3000,
      });
    }
  };

  return (
    <div className={styles.page}>
      <Textbox
        label="Email"
        type="email"
        value={form.value.email}
        onChange={(value) => (form.value = { ...form.value, email: value })}
      />
      <Textbox
        label="Password"
        type="password"
        value={form.value.password}
        onChange={(value) => (form.value = { ...form.value, password: value })}
      />
      <Button onClick={handleLogin} styleType="primary">
        Login
      </Button>
    </div>
  );
}
