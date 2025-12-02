import Link from "next/link";
import { AuthForm } from "../components/AuthForm";

export default async function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <AuthForm
        type="Login"
        callToAction={<p>Don't have an account? <Link className="underline-offset-5 hover:underline" href="/register">Register</Link></p>}
      />
    </div>
  );
}