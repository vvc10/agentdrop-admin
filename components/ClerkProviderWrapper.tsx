import { ClerkProvider } from '@clerk/nextjs';

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // Always render ClerkProvider to ensure it's available during build and runtime
  // The environment variables will be available at runtime
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
