import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    if (session.role === "main_admin" || session.role === "admin" || session.role === "staff") {
      redirect("/admin");
    } else {
      redirect("/menu");
    }
  }

  return <LoginForm />;
}
