import { redirect } from "next/navigation";

export default function ForgotPasswordVerifyRedirect() {
  redirect("/forgot-password/verify");
}
