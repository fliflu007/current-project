"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Demo from "@/lib/auth/demo";
import Link from "next/link";

const registerSchema = z.object({
  companyName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(4),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Page() {
  const router = useRouter();
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      companyName: "",
    },
  });

  async function onSubmit(formdata: RegisterFormData) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formdata),
    });
    if (!res.ok) {
      toast.error("Registration failed");
      return;
    }
    const result = await res.json();

    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success("success creation");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: formdata.email,
      password: formdata.password,
    });
    if (error) {
      toast.error("Login Issue");
      return;
    }
    router.push("/");
  }
  return (
    <div className="bg-muted h-screen flex justify-center items-center">
      <div className="max-w-md w-96 flex flex-col items-center ">
        <div className="py-2">
          <Logo />
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full bg-background py-6 px-6 space-y-6 rounded-lg shadow-md"
        >
          <Field>
            <FieldLabel {...form.register("companyName")}>
              Company name :
            </FieldLabel>
            <Input id="companyName" {...form.register("companyName")} />
            {form.formState.errors.companyName && (
              <FieldDescription>
                {form.formState.errors.companyName.message}
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel>Email :</FieldLabel>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <FieldDescription>
                {form.formState.errors.email.message}
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel>Password :</FieldLabel>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <FieldDescription>
                {form.formState.errors.password.message}
              </FieldDescription>
            )}
            <FieldDescription>{""}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Confirm password</FieldLabel>
            <Input />
          </Field>

          <Field orientation="vertical">
            <Button type="submit">Create account</Button>
            <p className="text-center">or</p>
            {/* Try DEMO*/}
            <Demo />
          </Field>
        </form>
        <p className="text-center text-muted-foreground p-4 pb-52">
          Already have an account ?
          <Link
            className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            href="/login"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
