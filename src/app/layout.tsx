import "./global.css";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import { MessageRenderer } from "@/components/ShowMessage";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Store",
  description: "My Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MessageRenderer />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
