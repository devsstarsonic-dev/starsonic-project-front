import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Criar conta · Star Sonic",
};

export default function CadastroPage() {
  return <AuthForm mode="signup" />;
}
