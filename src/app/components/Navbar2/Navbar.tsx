"use client"; // 1. Must be a client component to use hooks

import NavButtonDisplay from "@/components/NavButton";
import styles from "./style.module.css";
// 2. Import the authClient
import { authClient } from "@/lib/auth-client";
import { DashboardNav, HomeNav, loginNav, registerNav } from "@/images";

export default function Navbar2() {
  // 3. Get the session data
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className={styles.navbar}>
      <NavButtonDisplay icon={HomeNav} href={"/"}>
        Home
      </NavButtonDisplay>

      {/* 4. Only show Dashboard if session exists */}
      {session && (
        <NavButtonDisplay icon={DashboardNav} href={"/dashboard"}>
          dashboard
        </NavButtonDisplay>
      )}

      {/* 5. Usually, you want to hide Login/Register if the user IS logged in */}
      {!session && !isPending && (
        <>
          <NavButtonDisplay icon={loginNav} href={"/login"}>
            login
          </NavButtonDisplay>
          <NavButtonDisplay icon={registerNav} href={"/register"}>
            register
          </NavButtonDisplay>
        </>
      )}
    </div>
  );
}
