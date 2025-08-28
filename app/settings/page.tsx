"use client";

// Force dynamic rendering to avoid build-time Clerk issues
export const dynamic = 'force-dynamic';

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { 
  Users, 
  Mail, 
  TrendingUp, 
  Activity,
  Shield,
  Settings,
  BarChart3,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  LogOut,
  ArrowLeft,
  Save,
  Globe,
  Bell,
  Lock,
  Database,
  Zap
} from "lucide-react";

export default function SettingsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: 'Agentify',
    siteUrl: 'https://agentify.com',
    emailNotifications: true,
    betaInvites: true,
    maxAgentsPerUser: 10,
    maintenanceMode: false
  });

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const handleSaveSettings = () => {
    // Here you would typically save to database
    console.log('Saving settings:', settings);
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    setIsLoading(false);
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading settings...</h2>
            <p className="text-slate-600">Please wait while we fetch configuration.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header breadcrumbs={["Settings", "Configuration"]} />
        
        <main className="flex-1 p-6 overflow-y-auto">

          {/* Settings Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-gray-600" />
                General Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Site Name</label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    placeholder="Enter site name"
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Site URL</label>
                  <Input
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                    placeholder="https://yourdomain.com"
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Max Agents Per User</label>
                  <Input
                    type="number"
                    value={settings.maxAgentsPerUser}
                    onChange={(e) => setSettings({...settings, maxAgentsPerUser: parseInt(e.target.value)})}
                    placeholder="10"
                    className="border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Beta Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-gray-600" />
                Beta Program Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Beta Invites</h4>
                    <p className="text-xs text-gray-600">Allow new users to join beta</p>
                  </div>
                  <Button
                    variant={settings.betaInvites ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings({...settings, betaInvites: !settings.betaInvites})}
                    className={settings.betaInvites ? "bg-green-600 hover:bg-green-700" : "border-gray-300"}
                  >
                    {settings.betaInvites ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-xs text-gray-600">Send email notifications</p>
                  </div>
                  <Button
                    variant={settings.emailNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                    className={settings.emailNotifications ? "bg-green-600 hover:bg-green-700" : "border-gray-300"}
                  >
                    {settings.emailNotifications ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                    <p className="text-xs text-gray-600">Put site in maintenance mode</p>
                  </div>
                  <Button
                    variant={settings.maintenanceMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                    className={settings.maintenanceMode ? "bg-red-600 hover:bg-red-700" : "border-gray-300"}
                  >
                    {settings.maintenanceMode ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-gray-600" />
                Security Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    defaultValue="30"
                    placeholder="30"
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Max Login Attempts</label>
                  <Input
                    type="number"
                    defaultValue="5"
                    placeholder="5"
                    className="border-gray-300"
                  />
                </div>
                <Button variant="outline" className="w-full border-gray-300">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Admin Password
                </Button>
              </div>
            </div>

            {/* Database Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2 text-gray-600" />
                Database Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Database Status</h4>
                    <p className="text-xs text-gray-600">Connection and health</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Backup Status</h4>
                    <p className="text-xs text-gray-600">Last backup time</p>
                  </div>
                  <span className="text-sm text-gray-600">2 hours ago</span>
                </div>
                <Button variant="outline" className="w-full border-gray-300">
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSaveSettings}
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
} 