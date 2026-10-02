"use client";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { InfoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: login,
      password,
    });

    if (error) {
      setErrorMessage("unable to log?! try again asshole..");
      console.log("this is error at log: ", error);
    } else {
      // do something
    }
  }

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          value={login}
          placeholder="Login.."
          onChange={(e) => setLogin(e.target.value)}
        ></input>
        <input
          value={password}
          placeholder="password.."
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <Button type="submit" variant={"outline"}>
          click
        </Button>
      </form>

      {errorMessage && (
        <Alert className="max-w-2xl" variant="destructive">
          <InfoIcon />
          <AlertTitle>Error Login</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
