"use client";

import { useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useSession } from "../context/SessionProvider";
import React from "react";

const SignInForm = () => {
  const toast = useToast();
  const router = useRouter();

  const { authenticated, setSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormValid, setIsFormValid] = useState({
    email: true,
    password: true,
  });

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      setIsFormValid((prevState) => ({ ...prevState, email: false }));
    }

    if (!password) {
      setIsFormValid((prevState) => ({ ...prevState, password: false }));
    }

    const validParams = email && password;

    if (validParams) {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw error;
        }
        const sessionData = await response.json();
        setSession(sessionData);
        authenticated.current = true;
        router.push("/dashboard");
        toast({ title: "Signed in", status: "info" });
      } catch (error) {
        toast({ title: `${error}`, status: "error" });
      }
    }
  };

  return (
    <>
      <form onSubmit={submitHandler} className="bg-white shadow-md rounded px-8 py-8 mb-4 max-w-md flex flex-col">
        <div className="mb-6">
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="shadow border rounded w-full py-3 px-3  focus:outline-teal-600"
            type="email"
            name="email"
            placeholder="Email"
          />
          {!email && !isFormValid.email && <span className="text-red-500 mt-1 text-sm block">Email cannot be empty</span>}
        </div>
        <div className="mb-6">
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="shadow border rounded w-full py-3 px-3  focus:outline-teal-600"
            type="password"
            name="password"
            placeholder="Password"
          />
          {!password && !isFormValid.password && <span className="text-red-500 mt-1 text-sm block">Password cannot be empty</span>}
        </div>
        <button className="bg-teal-700 hover:bg-teal-600  text-white py-2 px-4 rounded" type="submit">
          Sign In
        </button>
      </form>
    </>
  );
};

export default SignInForm;
