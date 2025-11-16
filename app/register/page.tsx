import { AuthForm } from "../components/AuthForm";

export default function Register() {
  return (
    <AuthForm
      type="Register"
      callToAction={<p>Have an account? <a className="underline-offset-5 hover:underline" href="/login">Login</a></p>}
    />
  );
}