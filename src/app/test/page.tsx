"use client";
import { useSignal, useSignals } from "@preact/signals-react/runtime";
import styles from "./style.module.css";
import clsx from "clsx";
import { DownArrowIcon } from "@/images/icons";

export default function TestPage() {
  const items = ["عود", "بخورات", "عffffffffffffffffffنبر", "رجالي"];
  return (
    <div style={{ padding: "50px" }}>
      <TestComponent items={items}>عطورات</TestComponent>
    </div>
  );
}

function TestComponent({
  children,
  items = [],
}: {
  children: React.ReactNode;
  items?: string[];
}) {
  useSignals();
  const showMenu = useSignal<boolean>(false);
  const noItems = items.length === 0;
  return (
    <div
      className={clsx(styles.container, showMenu.value && styles.mouseHover)}
      onMouseEnter={() => (showMenu.value = true)}
      onMouseLeave={() => (showMenu.value = false)}
    >
      <div className={styles.title}>
        {!noItems && <DownArrowIcon className={styles.arrow} />}
        {children}
      </div>

      {!noItems && showMenu.value && (
        <div className={styles.items}>
          {items.map((item) => (
            <p key={item} className={styles.item}>
              {item}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
