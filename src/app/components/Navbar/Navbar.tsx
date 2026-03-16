"use client"; // 1. Must be a client component to use hooks
import Link from "next/link";
import NavButtonDisplay from "@/components/NavButton";
import styles from "./style.module.css";
import Image from "next/image";
// 2. Import the authClient
import { authClient } from "@/lib/auth-client";
import {
  cartImg,
  accountImg,
  searchImg,
  DashboardNav,
  HomeNav,
  loginNav,
  logoHorizontal,
  registerNav,
} from "@/images";
import { Product } from "@/types";
import arabicProductsRaw from "./perfumes_arabic.json";
import NavCategory from "@/components/NavCatergory";
const arabicProducts = arabicProductsRaw as Product[];
const categories = [
  "الافضل مبيعاً",
  "عروض",
  "منتجات جديدة",
  "العطور",
  "زيوت",
  "العود",
  "عالم العربية للعود",
];
const Navbar = () => {
  const items = ["عود", "بخورات", "عffffffffffffffffffنبر", "رجالي"];
  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <Link href={"/login"} className={styles.account}>
          <Image src={accountImg} alt="account" />
        </Link>
        <Link href={"/cart"} className={styles.cart}>
          <Image src={cartImg} alt="cart" />
        </Link>
        <Link href={"/search"} className={styles.search}>
          <Image src={searchImg} alt="search" />
        </Link>
      </div>
      <div className={styles.categories}>
        {categories.map((category: string) => {
          return (
            <NavCategory items={items} key={category}>
              {category}
            </NavCategory>
          );
        })}
      </div>

      <Link href={"/"} className={styles.logo}>
        <Image src={logoHorizontal} alt="logo" />
      </Link>
    </div>
  );
};

export default Navbar;
