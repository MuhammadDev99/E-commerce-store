"use client";
import { Button, Textbox } from "@/app/external/my-library/components";
import styles from "./style.module.css";
import { showMessage } from "@/app/utils/showMessage";
import { useSignal, useSignals } from "@preact/signals-react/runtime";
import { MessageUI } from "@/types";
import { safe } from "@/app/external/my-library/utils";
import PhoneInput from "@/app/external/my-library/components/html-elements/PhoneInput";
type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  retypedPassword: string;
  phoneNumber: string;
  birthDate: string;
};
const passwordMismatchError: MessageUI = {
  title: "Error",
  content: "Passwords do not match",
  durationMs: 3000,
  type: "error",
};

const missingInformationError: MessageUI = {
  title: "Error",
  content: "Please fill in all fields",
  durationMs: 3000,
  type: "error",
};

const registerationSuccessMessage: MessageUI = {
  title: "Success",
  content: "Registered successfully",
  durationMs: 3000,
  type: "success",
};

export default function RegisterPage() {
  useSignals();
  const form = useSignal<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    retypedPassword: "",
    phoneNumber: "",
    birthDate: new Date().toISOString().split("T")[0],
  });
  const registerAuth = async (form: RegisterForm) => {};
  const handleRegister = async () => {
    const {
      firstName,
      lastName,
      email,
      password,
      retypedPassword,
      birthDate,
      phoneNumber,
    } = form.value;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !retypedPassword ||
      !phoneNumber ||
      !birthDate
    ) {
      showMessage(missingInformationError);
      return;
    }
    if (password !== retypedPassword) {
      showMessage(passwordMismatchError);
      return;
    }
    const result = await safe(registerAuth(form.value));
    if (result.success) {
      showMessage(registerationSuccessMessage);
    } else {
      showMessage({
        title: "Error",
        content: result.error.toString(),
        durationMs: 3000,
        type: "error",
      });
    }
  };
  return (
    <div className={styles.page}>
      <div className={styles.name}>
        <Textbox
          label="First Name"
          value={form.value.firstName}
          onChange={(value) =>
            (form.value = { ...form.value, firstName: value })
          }
        />
        <Textbox
          label="Last Name"
          value={form.value.lastName}
          onChange={(value) =>
            (form.value = { ...form.value, lastName: value })
          }
        />
      </div>
      <Textbox
        label="Email"
        type="email"
        value={form.value.email}
        onChange={(value) => (form.value = { ...form.value, email: value })}
      />
      <PhoneInput
        value={form.value.phoneNumber}
        onChange={(value) =>
          (form.value = { ...form.value, phoneNumber: value })
        }
      />
      <Textbox
        label="Password"
        type="password"
        value={form.value.password}
        onChange={(value) => (form.value = { ...form.value, password: value })}
      />
      <Textbox
        label="Retype Password"
        type="password"
        value={form.value.retypedPassword}
        onChange={(value) =>
          (form.value = { ...form.value, retypedPassword: value })
        }
      />
      <Textbox
        label="Birth Date"
        type="date"
        value={form.value.birthDate}
        onChange={(value) => (form.value = { ...form.value, birthDate: value })}
      />
      <Button onClick={handleRegister} styleType="primary">
        Register
      </Button>
    </div>
  );
}
