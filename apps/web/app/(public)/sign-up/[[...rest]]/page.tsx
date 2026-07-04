import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-sm items-center justify-center px-4">
      <SignUp routing="path" path="/sign-up" />
    </main>
  );
}
