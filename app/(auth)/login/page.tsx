"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import z from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Demo from "@/lib/auth/demo";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export default function Page() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  type LoginFormData = z.infer<typeof loginSchema>;

  const onSubmit = async (formdata: LoginFormData) => {
    // Client Supabase Log
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formdata.email,
      password: formdata.password,
    });
    if (error) {
      toast.error(error.message, {
        className: "bg-red-50 border-red-200 text-red-700",
      });
      return;
    } else {
      toast.success("You are logged in", {
        duration: 500,
      });

      setTimeout(() => {
        router.push("/");
      }, 600);
    }
  };

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
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" {...form.register("email")} />

            {form.formState.errors.email && (
              <FieldDescription>
                {form.formState.errors.email.message}
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
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

          <Field orientation="vertical">
            <Button type="submit">Login</Button>
            <p className="text-center">or</p>
            <Demo />
          </Field>
        </form>
        <p className="text-center text-muted-foreground p-4 pb-52">
          Need an account ?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Sign up
          </span>
        </p>
      </div>
      <Toaster
        position="top-left"
        toastOptions={{
          classNames: {
            success: "bg-green-50! border-green-200! text-green-700!",
            error: "bg-red-50! border-red-200! text-red-700!",
          },
        }}
      />
    </div>
  );
}
