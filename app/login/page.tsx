"use client";

import { Button } from "@/components/ui/button";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";

export default function Page() {
  return (
    <div className="bg-muted h-screen flex justify-center items-center">
      <div className="max-w-md w-96 flex flex-col items-center ">
        <div className="py-2">
          <Logo />
        </div>

        <form className="w-full bg-background py-6 px-6 space-y-6 rounded-lg shadow-md">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input />
            <FieldDescription>contain at least 3 letters</FieldDescription>
          </Field>

          <Field orientation="vertical">
            <Button type="submit">Login</Button>
            <p className="text-center">or</p>
            <Button variant="outline" type="button" className="bg-secondary">
              Try Demo
            </Button>
          </Field>
        </form>
        <p className="text-center text-muted-foreground p-4 pb-52">
          Need an account ? <span className="text-foreground">Sign up</span>
        </p>
      </div>
    </div>
  );
}
