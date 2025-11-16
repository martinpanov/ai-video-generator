import { AuthForm } from "../components/AuthForm";

export default async function Login() {
  return (
    <AuthForm
      type="Login"
      callToAction={<p>Don't have an account? <a className="underline-offset-5 hover:underline" href="/register">Register</a></p>}
    />
  );
}