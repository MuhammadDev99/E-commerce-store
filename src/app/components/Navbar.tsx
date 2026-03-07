// components/Navbar.tsx
import Link from "next/link";

const Navbar = () => {
  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <ul style={{ display: "flex", gap: "20px", listStyle: "none" }}>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/Dashboard">Dashboard</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
