"use client";

import { ClerkProvider } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render ClerkProvider during SSR/build to avoid environment variable issues
  if (!mounted) {
    return <>{children}</>;
  }

  // Only render ClerkProvider on the client side
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
