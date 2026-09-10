import React from "react";
import Image from "next/image";

export default function Logo() {
  return (
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
  );
}
