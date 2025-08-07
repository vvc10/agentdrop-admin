"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button 
                onClick={() => router.push('/')} 
                variant="ghost" 
                size="icon"
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
                <p className="text-sm text-slate-600">Configure platform settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-600">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
              <Button onClick={handleSignOut} variant="ghost" size="icon">
                <LogOut className="h-5 w-5 text-slate-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">System Settings ⚙️</h2>
          <p className="text-slate-600 text-lg">Configure platform settings and preferences.</p>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Globe className="h-6 w-6 mr-2 text-slate-600" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-900 mb-2 block">Site Name</label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-900 mb-2 block">Site URL</label>
                <Input
                  value={settings.siteUrl}
                  onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                  placeholder="https://yourdomain.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-900 mb-2 block">Max Agents Per User</label>
                <Input
                  type="number"
                  value={settings.maxAgentsPerUser}
                  onChange={(e) => setSettings({...settings, maxAgentsPerUser: parseInt(e.target.value)})}
                  placeholder="10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Beta Settings */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Zap className="h-6 w-6 mr-2 text-slate-600" />
                Beta Program Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Beta Invites</h3>
                  <p className="text-xs text-slate-600">Allow new users to join beta</p>
                </div>
                <Button
                  variant={settings.betaInvites ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings({...settings, betaInvites: !settings.betaInvites})}
                  className={settings.betaInvites ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                >
                  {settings.betaInvites ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Email Notifications</h3>
                  <p className="text-xs text-slate-600">Send email notifications</p>
                </div>
                <Button
                  variant={settings.emailNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                  className={settings.emailNotifications ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                >
                  {settings.emailNotifications ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Maintenance Mode</h3>
                  <p className="text-xs text-slate-600">Put site in maintenance mode</p>
                </div>
                <Button
                  variant={settings.maintenanceMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                  className={settings.maintenanceMode ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  {settings.maintenanceMode ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Lock className="h-6 w-6 mr-2 text-slate-600" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-900 mb-2 block">Session Timeout (minutes)</label>
                <Input
                  type="number"
                  defaultValue="30"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-900 mb-2 block">Max Login Attempts</label>
                <Input
                  type="number"
                  defaultValue="5"
                  placeholder="5"
                />
              </div>
              <Button variant="outline" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Change Admin Password
              </Button>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Database className="h-6 w-6 mr-2 text-slate-600" />
                Database Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Database Status</h3>
                  <p className="text-xs text-slate-600">Connection and health</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Backup Status</h3>
                  <p className="text-xs text-slate-600">Last backup time</p>
                </div>
                <span className="text-sm text-slate-600">2 hours ago</span>
              </div>
              <Button variant="outline" className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </main>
    </div>
  );
} 