"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";
import styles from "./style.module.css";
import { Iti } from "intl-tel-input";

type Props = {
  value?: string;
  className?: string;
  label?: string;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
};

export default function PhoneInput({
  value,
  className,
  label,
  children,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const itiRef = useRef<Iti | null>(null);

  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Initialize Library
  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement) return;

    itiRef.current = intlTelInput(inputElement, {
      initialCountry: "auto",
      strictMode: true,
      separateDialCode: true,
      geoIpLookup: (success: (iso2: any) => void, failure: () => void) => {
        fetch("https://ipapi.co/json")
          .then((res) => res.json())
          .then((data) => success(data.country_code))
          .catch(() => {
            if (typeof failure === "function") failure();
          });
      },
      loadUtils: () => import("intl-tel-input/utils"),
    });

    // Set initial value if provided
    if (value) {
      itiRef.current.setNumber(value);
    }

    return () => {
      itiRef.current?.destroy();
    };
  }, []);

  // Sync external value changes to the library instance
  useEffect(() => {
    if (
      itiRef.current &&
      value !== undefined &&
      value !== itiRef.current.getNumber()
    ) {
      itiRef.current.setNumber(value);
    }
  }, [value]);

  const handleChange = () => {
    const instance = itiRef.current;
    if (instance) {
      const isNumberValid = instance.isValidNumber();
      setIsValid(isNumberValid);

      // 1. Get the number from the library
      const fullNumber = instance.getNumber();

      // 2. CLEANING: Remove all spaces, dashes, and brackets
      // but keep the "+" at the start.
      const cleanNumber = fullNumber.replace(/[\s\(\)\-\.]/g, "");

      // 3. Send the clean number back to the parent
      onChange?.(cleanNumber);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isNumber = /^[0-9]$/.test(e.key);
    const isControlKey = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Enter",
    ].includes(e.key);

    if (!isNumber && !isControlKey && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
    }
  };

  return (
    <div className={clsx(styles.container, className)}>
      <label htmlFor="phone" className={styles.label}>
        {label ?? children}
      </label>

      <input
        type="tel"
        id="phone"
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onInput={handleChange}
        className={clsx(styles.inputField)}
        placeholder=" "
      />

      <div className={styles.statusMessage}>
        {isValid === true && (
          <span className={styles.successText}>✓ Valid</span>
        )}
        {isValid === false && (
          <span className={styles.errorText}>Invalid format</span>
        )}
      </div>
    </div>
  );
}
