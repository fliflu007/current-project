"use client";

import Image from "next/image";

import { Menu } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { useState } from "react";

const items = [
  { value: "admin", label: "admin" },
  { value: "editor", label: "editor" },
  { value: "viewer", label: "viewer" },
];

export default function Navbar() {
  const [showMobileNav, setMobileNav] = useState(false);
  return (
    <nav className="h-14 ">
      {/*desktop*/}
      <div className="container mx-auto px-6 grid grid-cols-2    sm:grid-cols-3 items-center h-full">
        <div className=" navbar-brand flex gap-5 items-center p-3">
          <Image
            src="/logo.svg"
            alt="Inventory System Logo"
            width={24}
            height={24}
          ></Image>
          <p className="text-sm font-extrabold whitespace-nowrap">
            INVENTORY SYSTEM
          </p>
        </div>
        <div className="text-c-label text-center sm:block hidden ">
          {" "}
          PRODUCT PAGE
        </div>
        <div className="right_side_block gap-4 hidden sm:flex ml-auto">
          {" "}
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
          <Button variant="secondary" size="lg">
            Login
          </Button>
          <Button size="lg">SignUp</Button>
        </div>
        <Button
          onClick={() => {
            setMobileNav((prev) => !prev);
          }}
          variant="ghost"
          size="icon"
          className="ml-auto sm:hidden hover:bg-accent"
        >
          <Menu />
        </Button>
      </div>
      {/*mobile */}
      {showMobileNav && (
        <div className="sm:hidden grid h-52 grid-rows-4 items-center justify-items-center">
          <p className="hover:bg-accent w-full h-full text-center flex items-center justify-center">
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
          <Button
            variant="ghost"
            size="lg"
            className="rounded-none h-full w-full hover:bg-accent"
          >
            Login
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="rounded-none h-full w-full hover:bg-accent"
          >
            SignUp
          </Button>
        </div>
      )}
    </nav>
  );
}
