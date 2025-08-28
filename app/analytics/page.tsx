"use client";

// Force dynamic rendering to avoid build-time Clerk issues
export const dynamic = 'force-dynamic';

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  Clock,
  Target,
  Zap
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  conversionRate: number;
  averageSessionTime: number;
  topReferrers: Array<{ source: string; count: number }>;
  userGrowth: Array<{ date: string; users: number }>;
}

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics({
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        newUsersThisWeek: data.newUsers || 0,
        conversionRate: parseFloat(data.conversionRate) || 0,
        averageSessionTime: 8.5, // Mock for now
        topReferrers: data.topReferrers || [],
        userGrowth: [
          { date: "Jan", users: 100 },
          { date: "Feb", users: 150 },
          { date: "Mar", users: 200 },
          { date: "Apr", users: 300 },
          { date: "May", users: 450 },
          { date: "Jun", users: 650 }
        ]
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    fetchAnalytics();
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading analytics...</h2>
            <p className="text-slate-600">Please wait while we fetch your data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header breadcrumbs={["Analytics", "Overview"]} />
        
        <main className="flex-1 p-6 overflow-y-auto">

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{analytics?.totalUsers || 0}</div>
              <div className="text-sm text-gray-600">
                All time registered users
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{analytics?.activeUsers || 0}</div>
              <div className="text-sm text-gray-600">
                Users active this month
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">New Users</h3>
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{analytics?.newUsersThisWeek || 0}</div>
              <div className="text-sm text-gray-600">
                This week
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{analytics?.conversionRate || 0}%</div>
              <div className="text-sm text-gray-600">
                Signup to active
              </div>
            </div>
        </div>

        {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Referrers */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-gray-600" />
                Top Referrers
              </h3>
              <div className="space-y-3">
                {analytics?.topReferrers && analytics.topReferrers.length > 0 ? (
                  analytics.topReferrers.map((referrer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">{referrer.source}</span>
                      </div>
                      <span className="text-sm text-gray-600">{referrer.count} users</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No referrer data available</p>
                  </div>
                )}
              </div>
            </div>

          {/* Session Analytics */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                Session Analytics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-amber-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Average Session Time</span>
                  </div>
                  <span className="text-sm text-gray-600">{analytics?.averageSessionTime || 0} minutes</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Monthly Growth</span>
                  </div>
                  <span className="text-sm text-gray-600">+12.5%</span>
                </div>
              </div>
            </div>
        </div>
      </main>
      </div>
    </div>
  );
} 