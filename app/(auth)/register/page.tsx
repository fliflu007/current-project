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

const registerSchema = z
  .object({
    companyName: z
      .string()
      .min(2, "Company name must contain at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(4, "Password must contain at least 4 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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
      confirmPassword: "",
    },
  });

  async function onSubmit(formdata: RegisterFormData) {
    const { confirmPassword, ...registrationData } = formdata;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
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

    toast.success("Account successfully created");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formdata.email,
      password: formdata.password,
    });

    if (error) {
      toast.error("Login issue");
      return;
    }

    router.push("/");
  }

  return (
    <div className="bg-muted h-screen flex justify-center items-center">
      <div className="max-w-md w-96 flex flex-col items-center">
        <div className="py-2">
          <Logo />
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full bg-background py-6 px-6 space-y-6 rounded-lg shadow-md"
        >
          <Field>
            <FieldLabel htmlFor="companyName">Company name:</FieldLabel>

            <Input id="companyName" {...form.register("companyName")} />

            {form.formState.errors.companyName && (
              <FieldDescription>
                {form.formState.errors.companyName.message}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email:</FieldLabel>

            <Input id="email" type="email" {...form.register("email")} />

            {form.formState.errors.email && (
              <FieldDescription>
                {form.formState.errors.email.message}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password:</FieldLabel>

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
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm password:</FieldLabel>

            <Input
              id="confirmPassword"
              type="password"
              {...form.register("confirmPassword")}
            />

            {form.formState.errors.confirmPassword && (
              <FieldDescription>
                {form.formState.errors.confirmPassword.message}
              </FieldDescription>
            )}
          </Field>

          <Field orientation="vertical">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Creating account..."
                : "Create account"}
            </Button>

            <p className="text-center">or</p>

            <Demo />
          </Field>
        </form>

        <p className="text-center text-muted-foreground p-4 pb-52">
          Already have an account?
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
