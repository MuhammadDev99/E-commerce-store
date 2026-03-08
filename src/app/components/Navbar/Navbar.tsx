import NavButtonDisplay from "@/components/NavButton";
import styles from "./style.module.css";
import Link from "next/link";
import { DashboardNav, HomeNav, loginNav, registerNav } from "@/images";

const Navbar = () => {
  return (
    <div className={styles.navbar}>
      <NavButtonDisplay icon={HomeNav} href={"/"}>
        Home
      </NavButtonDisplay>
      <NavButtonDisplay icon={DashboardNav} href={"/dashboard"}>
        dashboard
      </NavButtonDisplay>
      <NavButtonDisplay icon={loginNav} href={"/login"}>
        login
      </NavButtonDisplay>
      <NavButtonDisplay icon={registerNav} href={"/register"}>
        register
      </NavButtonDisplay>
    </div>
  );
};

export default Navbar;
