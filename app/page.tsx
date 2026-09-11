"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ProductUtilityBar from "@/components/product-utility-bar";
import ProductCard from "@/components/product-card";
import ProductToolbar from "@/components/product-toolbar";

export default function Page() {
  return (
    <div>
      <Navbar isLoggedIn={true}></Navbar>
      <ProductToolbar></ProductToolbar>
      <ProductUtilityBar />
      <div className="grid grid-cols-1 lg:grid-cols-2  2xl:grid-cols-3 gap-6 container mx-auto">
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
      </div>
    </div>
  );
}
