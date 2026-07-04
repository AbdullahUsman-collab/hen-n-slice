import { SignIn } from '@clerk/nextjs';

export default function AuthPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-sm items-center justify-center px-4">
      <SignIn routing="path" path="/auth" signUpUrl="/sign-up" />
    </main>
  );
}
