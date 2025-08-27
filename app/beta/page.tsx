"use client";

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
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckCircle2,
  Send,
  Clock,
  Zap,
  UserCheck,
  UserX
} from "lucide-react";

interface BetaUser {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'approved';
  joinedDate: string;
  source: string;
  approvalEmailSentAt?: string;
  approvalEmailStatus: 'not_sent' | 'sent' | 'delivered' | 'opened' | 'failed';
}

export default function BetaPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [betaUsers, setBetaUsers] = useState<BetaUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEmailStatus, setSelectedEmailStatus] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const fetchBetaUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/beta-users');
      if (!response.ok) {
        throw new Error('Failed to fetch beta users');
      }
      
      const data = await response.json();
      setBetaUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching beta users:', err);
      setError('Failed to load beta users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      
      const response = await fetch('/api/admin/beta-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve user');
      }

      // Refresh the data
      await fetchBetaUsers();
    } catch (err) {
      console.error('Error approving user:', err);
      setError('Failed to approve user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      
      const response = await fetch('/api/admin/beta-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject user');
      }

      // Refresh the data
      await fetchBetaUsers();
    } catch (err) {
      console.error('Error rejecting user:', err);
      setError('Failed to reject user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async (userId: string, isResend: boolean = false) => {
    try {
      setEmailLoading(userId);
      setError(null);
      
      const response = await fetch('/api/admin/beta-users/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          waitlistId: userId,
          isResend: isResend
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const result = await response.json();
      
      // Show success message
      setError(null);
      
      // Refresh the data
      await fetchBetaUsers();
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err instanceof Error ? err.message : 'Failed to send email. Please try again.');
    } finally {
      setEmailLoading(null);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    fetchBetaUsers();
  }, [isLoaded, isSignedIn, router]);

  const filteredUsers = betaUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    const matchesEmailStatus = selectedEmailStatus === 'all' || user.approvalEmailStatus === selectedEmailStatus;
    return matchesSearch && matchesStatus && matchesEmailStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Approved</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">{status}</Badge>;
    }
  };

  const getStatusCount = (status: string) => {
    return betaUsers.filter(user => user.status === status).length;
  };

  const canApprove = (status: string) => status === 'pending';
  const canReject = (status: string) => status === 'approved';
  
  const getEmailStatusBadge = (status: string, sentAt?: string) => {
    switch (status) {
      case 'not_sent':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Not Sent</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Sent</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
      case 'opened':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Opened</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Unknown</Badge>;
    }
  };

  const canSendEmail = (status: string, emailStatus: string) => {
    return status === 'approved' && emailStatus === 'not_sent';
  };

  const canResendEmail = (status: string, emailStatus: string) => {
    return status === 'approved' && emailStatus !== 'not_sent';
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading beta users...</h2>
            <p className="text-slate-600">Please wait while we fetch beta data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header breadcrumbs={["Beta", "Management"]} />
        
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

        {/* Beta Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Approval</h3>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{getStatusCount('pending')}</div>
              <div className="text-sm text-gray-600">
                Awaiting approval
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Approved</h3>
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{getStatusCount('approved')}</div>
              <div className="text-sm text-gray-600">
                Can sign up now
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Emails Sent</h3>
                <Send className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {betaUsers.filter(user => user.approvalEmailStatus !== 'not_sent').length}
              </div>
              <div className="text-sm text-gray-600">
                Approval emails sent
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Emails Opened</h3>
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {betaUsers.filter(user => user.approvalEmailStatus === 'opened').length}
              </div>
              <div className="text-sm text-gray-600">
                Emails opened by users
              </div>
            </div>
        </div>

        {/* Search and Filters */}
          <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
              />
            </div>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
            <select 
              value={selectedEmailStatus}
              onChange={(e) => setSelectedEmailStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Email Status</option>
              <option value="not_sent">Not Sent</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="failed">Failed</option>
            </select>
              <Button className="bg-gray-800 hover:bg-gray-700 text-white">
              <Send className="h-4 w-4 mr-2" />
              Bulk Approve
            </Button>
          </div>
        </div>

        {/* Beta Users List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Waitlist Users ({filteredUsers.length})</h3>
                <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {betaUsers.length} users
              </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Email Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Source</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Joined</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{user.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="py-4 px-6">
                        {getEmailStatusBadge(user.approvalEmailStatus, user.approvalEmailSentAt)}
                        {user.approvalEmailSentAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(user.approvalEmailSentAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {user.source}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(user.joinedDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {canApprove(user.status) && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleApproveUser(user.id)}
                              disabled={actionLoading === user.id}
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              {actionLoading === user.id ? (
                                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-1" />
                              ) : (
                                <UserCheck className="h-4 w-4 mr-1" />
                              )}
                              Approve
                            </Button>
                          )}
                          {canReject(user.status) && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRejectUser(user.id)}
                              disabled={actionLoading === user.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              {actionLoading === user.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1" />
                              ) : (
                                <UserX className="h-4 w-4 mr-1" />
                              )}
                              Revoke Access
                            </Button>
                          )}
                          {canSendEmail(user.status, user.approvalEmailStatus) && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSendEmail(user.id, false)}
                              disabled={emailLoading === user.id}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {emailLoading === user.id ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
                              ) : (
                                <Send className="h-4 w-4 mr-1" />
                              )}
                              Send Email
                            </Button>
                          )}
                          {canResendEmail(user.status, user.approvalEmailStatus) && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSendEmail(user.id, true)}
                              disabled={emailLoading === user.id}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              {emailLoading === user.id ? (
                                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-1" />
                              ) : (
                                <Send className="h-4 w-4 mr-1" />
                              )}
                              Resend
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </main>
      </div>
    </div>
  );
} 