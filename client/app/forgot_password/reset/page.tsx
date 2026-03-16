import { redirect } from "next/navigation";

export default function ForgotPasswordResetRedirect() {
  redirect("/forgot-password/reset");
}
