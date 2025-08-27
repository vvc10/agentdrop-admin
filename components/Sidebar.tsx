"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Bell, 
  Users, 
  FileText, 
  Settings,
  Mail,
  BarChart3,
  Key,
  ChevronDown,
  ChevronRight,
  Gift
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
  collapsible?: boolean;
}

const sidebarSections: SidebarSection[] = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", href: "/", icon: Home },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Users", href: "/users", icon: Users },
      { name: "Beta Management", href: "/beta", icon: Bell },
      { name: "Blog", href: "/blog", icon: FileText },
      { name: "Invite Codes", href: "/invite-codes", icon: Gift },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  },
  {
    title: "Management",
    collapsible: true,
    items: [
      { name: "User Management", href: "/users", icon: Users },
      { name: "Email Analytics", href: "/email-analytics", icon: Mail },
      { name: "System Logs", href: "/logs", icon: FileText },
    ]
  },
  {
    title: "Integrations",
    collapsible: true,
    items: [
      { name: "Email Service", href: "/integrations/email", icon: Mail },
      { name: "Analytics", href: "/integrations/analytics", icon: BarChart3 },
      { name: "API Keys", href: "/integrations/api", icon: Key },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    "Management": false,
    "Integrations": false
  });

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  return (
    <div className="w-64 bg-gray-100 h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {sidebarSections.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {section.title}
              </h3>
              {section.collapsible && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {collapsedSections[section.title] ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            
            {(!section.collapsible || !collapsedSections[section.title]) && (
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-zinc-200 text-zinc-900'
                          : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'
                      }`}
                    >
                      <item.icon className={`h-4 w-4 mr-3 ${
                        isActive ? 'text-zinc-200' : 'text-zinc-500'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
