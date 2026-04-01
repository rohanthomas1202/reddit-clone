import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Threadscape account and join the community",
};

export default function RegisterPage() {
  return <RegisterForm />;
}