import { useSignal, useSignals } from "@preact/signals-react/runtime";
import styles from "./style.module.css";
import clsx from "clsx";
import { DownArrowIcon } from "@/images/icons";

export default function NavCategory({
  children,
  items = [],
}: {
  children: React.ReactNode;
  items?: string[];
}) {
  useSignals();
  const showMenu = useSignal<boolean>(false);
  const hasItems = items.length > 0;
  return (
    <div
      className={clsx(styles.container, showMenu.value && styles.mouseHover)}
      onMouseEnter={() => (showMenu.value = true)}
      onMouseLeave={() => (showMenu.value = false)}
    >
      <div className={styles.title}>
        {hasItems && <DownArrowIcon className={styles.arrow} />}
        {children}
      </div>

      {hasItems && (
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
