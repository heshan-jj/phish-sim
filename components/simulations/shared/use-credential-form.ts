"use client";

import { type FormEvent, useState } from "react";

export function useCredentialForm(
  onSubmit: (data: { email: string; password: string }) => Promise<void>,
) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ email, password });
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleFormSubmit,
  };
}
