"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const DEMO_EMAIL = "email.company@test.com";
const DEMO_PASSWORD = "$test$5";

export default function Demo() {
  const router = useRouter();

  async function handleDemoLogin() {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    if (error) {
      toast.error("Demo login failed");
      return;
    }

    toast.success("Demo login successful");
    router.push("/");
  }

  return (
    <Button
      variant="outline"
      type="button"
      className="bg-secondary"
      onClick={handleDemoLogin}
    >
      Try Demo
    </Button>
  );
}
