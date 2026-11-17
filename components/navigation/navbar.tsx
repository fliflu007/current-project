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

const items = [
  { value: "admin", label: "admin" },
  { value: "staff", label: "staff" },
  { value: "viewer", label: "viewer" },
];

export default function Navbar({
  role = "not provided",
}: {
  role?: "admin" | "staff" | "viewer" | "not provided";
}) {
  // todo adjust the Nav according to isLoggedIn

  const [showMobileNav, setMobileNav] = useState(false);

  return (
    <nav className="sticky top-0 z-50 h-14 bg-white">
      {/* Desktop */}
      <div className="container mx-auto grid h-full grid-cols-3 items-center">
        <div className="navbar-brand flex items-center gap-5 p-3">
          <Image
            src="/logo.svg"
            alt="Inventory System Logo"
            width={24}
            height={24}
          />

          <p className="whitespace-nowrap text-sm font-extrabold">
            INVENTORY SYSTEM
          </p>
        </div>
        <Link href="/">
          <div className="text-c-label hidden text-center sm:block">
            PRODUCTS PAGE
          </div>
        </Link>

        <div className="right_side_block hidden md:flex gap-2">
          <Select items={items}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder={role} />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
            <Select items={items}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder={role} />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
