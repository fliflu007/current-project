"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useState } from "react";
import { logOut } from "@/lib/auth/logout";
import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import RoleSwitcher from "./role-switcher";

const items = [
  { value: "admin", label: "admin" },
  { value: "staff", label: "staff" },
  { value: "viewer", label: "viewer" },
];

export default function Navbar({
  role,
}: {
  role: "admin" | "staff" | "viewer";
}) {
  // todo adjust the Nav according to isLoggedIn

  const [showMobileNav, setMobileNav] = useState(false);

  return (
    <nav className="sticky top-0 z-50 h-14 bg-white">
      {/* Desktop */}
      <div className="container mx-auto grid h-full grid-cols-2 lg:grid-cols-3 items-center">
        <div className="navbar-brand flex items-center gap-5 p-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Inventory System Logo"
              width={24}
              height={24}
            />

            <p className="whitespace-nowrap text-sm font-extrabold">
              INVENTORY SYSTEM
            </p>
          </Link>
        </div>
        <Link href="/" className="hidden lg:block">
          <div className="text-c-label  text-center ">PRODUCTS PAGE</div>
        </Link>

        <div className="right_side_block hidden md:flex gap-2 ml-auto">
          <RoleSwitcher role={role} />
          <form action={logOut}>
            <Button type="submit" variant="secondary" size="lg">
              LogOut
            </Button>
          </form>

          <Button size="lg">SignUp</Button>
        </div>

        {/* Mobile hamburger */}
        <Button
          onClick={() => {
            setMobileNav((prev) => !prev);
          }}
          variant="ghost"
          size="icon"
          className="ml-auto hover:bg-accent md:hidden"
        >
          <Menu />
        </Button>
      </div>
      {showMobileNav && (
        <div className="absolute left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-full bg-background md:hidden">
          <div className="grid h-52 grid-rows-4 items-center justify-items-center">
            <RoleSwitcher role={role} />
            <form action={logOut}>
              <Button
                variant="ghost"
                size="lg"
                className="h-full w-full rounded-none hover:bg-accent"
              >
                Logout
              </Button>
            </form>

            <Button
              variant="ghost"
              size="lg"
              className="h-full w-full rounded-none hover:bg-accent"
            >
              SignUp
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
