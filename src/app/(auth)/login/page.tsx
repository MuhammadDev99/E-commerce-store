"use client";
import { Button, Textbox } from "@/app/external/my-library/components";
import styles from "./style.module.css";
import { showMessage } from "@/app/utils/showMessage";
export default function RegisterPage() {
  const handleLogin = () => {
    showMessage("Logged in");
  };
  return (
    <div className={styles.page}>
      <Textbox label="Email" />
      <Textbox label="Password" type="password" />
      <Button onClick={handleLogin} styleType="primary">
        Login
      </Button>
    </div>
  );
}
