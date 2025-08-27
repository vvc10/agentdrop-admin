"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChevronRight, User } from "lucide-react";

interface HeaderProps {
  title?: string;
  breadcrumbs?: string[];
}

export default function Header({ title = "Dashboard", breadcrumbs = ["Dashboard"] }: HeaderProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />}
            <span className={`text-sm ${
              index === breadcrumbs.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-500'
            }`}>
              {crumb}
            </span>
          </div>
        ))}
      </div>

      {/* User Menu */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
        >
          <User className="h-4 w-4 text-white" />
        </button>
      </div>
    </header>
  );
}
