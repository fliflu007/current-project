"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function RegisterForm() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyName,
        email,
        password,
      }),
    });

    const body = await res.json();

    if (body.error) {
      console.log(body.error.message);
      setErrorMessage(body.error.message);
    } else {
      console.log("Registed", body.data);
    }
  }

  return (
    <div>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={companyName}
          placeholder="company"
          onChange={(eventobject) => setCompanyName(eventobject.target.value)}
        ></input>

        <input
          type="email"
          value={email}
          placeholder="email"
          onChange={(eventobject) => setEmail(eventobject.target.value)}
        ></input>
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Register</Button>
      </form>
      <p> {errorMessage} </p>
    </div>
  );
}
