"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useState } from "react";
import { logOut } from "@/lib/auth/logout";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import AccountMenu from "@/components/account-menu";

const items = [
  { value: "admin", label: "admin" },
  { value: "editor", label: "editor" },
  { value: "viewer", label: "viewer" },
];

export default function Navbar() {
  const [showMobileNav, setMobileNav] = useState(false);

  return (
    <nav className="relative h-14">
      {/* Desktop */}
      <div className="container mx-auto grid h-full grid-cols-2 items-center px-6 sm:grid-cols-3">
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

        <div className="text-c-label hidden text-center sm:block">
          PRODUCTS PAGE
        </div>

        <AccountMenu
          items={items}
          className="ml-auto hidden sm:block lg:hidden"
        />

        <div className="right_side_block ml-auto hidden gap-4 lg:flex">
          <Select items={items}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Role" />
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
          className="ml-auto hover:bg-accent sm:hidden"
        >
          <Menu />
        </Button>
      </div>

      {/* Mobile menu */}
      {showMobileNav && (
        <div className="absolute left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-full bg-background sm:hidden">
          <div className="grid h-52 grid-rows-4 items-center justify-items-center">
            <p className="flex h-full w-full items-center justify-center text-center hover:bg-accent">
              PRODUCT PAGE
            </p>

            <Select items={items}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Role" />
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
