import clsx from "clsx";
import styles from "./style.module.css";

type Props = {
  className?: string;
  src: string;
  fitDirection: "horizontal" | "vertical";
  onClick?: () => void;
};
export default function Logo({
  fitDirection = "horizontal",
  className,
  src,
  onClick,
}: Props) {
  return (
    <img
      src={src}
      className={clsx(className, styles.logo, styles[fitDirection])}
      onClick={onClick}
    />
  );
}
