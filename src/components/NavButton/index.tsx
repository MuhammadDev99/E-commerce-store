import Link from "next/link";
import Image from "next/image";
import styles from "./style.module.css";
import { StaticImageData } from "next/image";
export default function NavButtonDisplay({
  children,
  href,
  icon,
}: {
  href: string;
  icon?: StaticImageData;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={styles.container}>
      {icon && <Image className={styles.icon} src={icon} alt="icon" />}
      <span>{children}</span>
    </Link>
  );
}
