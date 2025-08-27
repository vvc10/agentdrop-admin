"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Chart from "@/components/Chart";
import { 
  Users, 
  DollarSign,
  BarChart3,
  AlertTriangle
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalWaitlist: number;
  betaInvited: number;
  betaActivated: number;
  conversionRate: string;
  recentSignups: number;
  proUsers: number;
  activeSubscriptions: number;
  totalInviteCodes: number;
  activeInviteCodes: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Check admin status
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/check-status');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
          if (!data.isAdmin) {
            router.push('/unauthorized');
            return;
          }
        } else {
          setError('Failed to check admin status');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        setError('Failed to check admin status');
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard-stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading admin dashboard...</h2>
            <p className="text-slate-600">Please wait while we verify your access.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Check Failed</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="flex space-x-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Try Again
              </button>
              <button 
                onClick={() => router.push('/sign-in')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign In Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect to sign-in
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header breadcrumbs={["Dashboard", "Analytics"]} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.totalUsers || 0}
              </div>
              <div className="text-sm text-gray-600">
                Pro: {stats?.proUsers || 0}, Free: {(stats?.totalUsers || 0) - (stats?.proUsers || 0)}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
                <DollarSign className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ${stats?.monthlyRevenue || 0}
              </div>
              <div className="text-sm text-gray-600">
                From {stats?.activeSubscriptions || 0} active subscriptions
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Beta Conversion</h3>
                <BarChart3 className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.conversionRate || 0}%
              </div>
              <div className="text-sm text-gray-600">
                {stats?.betaActivated || 0} of {stats?.betaInvited || 0} invited
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Signups</h3>
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.recentSignups || 0}
              </div>
              <div className="text-sm text-gray-600">
                Last 7 days
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Waitlist Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Waitlist:</span>
                  <span className="font-semibold">{stats?.totalWaitlist || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Beta Invited:</span>
                  <span className="font-semibold">{stats?.betaInvited || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Beta Activated:</span>
                  <span className="font-semibold">{stats?.betaActivated || 0}</span>
          </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Codes</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Codes:</span>
                  <span className="font-semibold">{stats?.totalInviteCodes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Codes:</span>
                  <span className="font-semibold">{stats?.activeInviteCodes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Usage Rate:</span>
                  <span className="font-semibold">
                    {stats?.totalInviteCodes ? 
                      Math.round(((stats?.totalInviteCodes - stats?.activeInviteCodes) / stats?.totalInviteCodes) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Free Users:</span>
                  <span className="font-semibold">{(stats?.totalUsers || 0) - (stats?.proUsers || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pro Users:</span>
                  <span className="font-semibold">{stats?.proUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate:</span>
                  <span className="font-semibold">
                    {stats?.totalUsers ? 
                      Math.round(((stats?.proUsers || 0) / stats?.totalUsers) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/invite-codes')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-900">Manage Invite Codes</div>
                <div className="text-sm text-gray-600">Create and manage invite codes</div>
              </button>
              <button 
                onClick={() => router.push('/users')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-900">View All Users</div>
                <div className="text-sm text-gray-600">Manage user accounts</div>
              </button>
              <button 
                onClick={() => router.push('/beta')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-900">Beta Management</div>
                <div className="text-sm text-gray-600">Manage beta invitations</div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 