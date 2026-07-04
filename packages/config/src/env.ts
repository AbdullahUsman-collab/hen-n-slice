function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get SUPABASE_URL() {
    return assertEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_URL',
    );
  },
  get SUPABASE_ANON_KEY() {
    return assertEnv(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  },
  get CLERK_PUBLISHABLE_KEY() {
    return assertEnv(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    );
  },
} as const;
