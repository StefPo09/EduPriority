import AuthForm from "../components/auth/AuthForm";
import AuthLayout from "../components/auth/AuthLayout";

export function SignupPage() {
  return (
    <AuthLayout
      title="Creează un cont"
      description="Începe să folosești EduPriority."
    >
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}

export function LoginPage() {
  return (
    <AuthLayout
      title="Bine ai revenit"
      description="Autentifică-te pentru a continua."
    >
      <AuthForm mode="login" />
    </AuthLayout>
  );
}
