"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Users,
  Gift,
  Eye,
  EyeOff
} from "lucide-react";

interface InviteCode {
  id: string;
  code: string;
  description: string | null;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  plan_type: string;
  duration_months: number;
  invite_code_redemptions: Array<{
    id: string;
    user_email: string;
    redeemed_at: string;
    plan_granted: string;
    expires_at: string;
  }>;
}

interface InviteCodesClientProps {
  user?: any;
}

export default function InviteCodesClient({ user }: InviteCodesClientProps = {}) {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCode, setEditingCode] = useState<InviteCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    max_uses: 1,
    plan_type: "pro",
    duration_months: 1,
    expires_at: "",
    is_active: true
  });

  useEffect(() => {
    fetchInviteCodes();
  }, []);

  const fetchInviteCodes = async () => {
    try {
      const response = await fetch("/api/admin/invite-codes");
      if (response.ok) {
        const data = await response.json();
        setInviteCodes(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch invite codes");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleCreateCode = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess("Invite code created successfully");
        setShowCreateForm(false);
        resetForm();
        fetchInviteCodes();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create invite code");
      }
    } catch (error) {
      setError("Network error");
    }
  };

  const handleUpdateCode = async () => {
    if (!editingCode) return;

    try {
      setError(null);
      const response = await fetch("/api/admin/invite-codes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCode.id, ...formData }),
      });

      if (response.ok) {
        showSuccess("Invite code updated successfully");
        setEditingCode(null);
        resetForm();
        fetchInviteCodes();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update invite code");
      }
    } catch (error) {
      setError("Network error");
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invite code?")) return;

    try {
      setError(null);
      const response = await fetch(`/api/admin/invite-codes?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSuccess("Invite code deleted successfully");
        fetchInviteCodes();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete invite code");
      }
    } catch (error) {
      setError("Network error");
    }
  };

  const handleEditCode = (code: InviteCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      description: code.description || "",
      max_uses: code.max_uses,
      plan_type: code.plan_type,
      duration_months: code.duration_months,
      expires_at: code.expires_at ? new Date(code.expires_at).toISOString().split('T')[0] : "",
      is_active: code.is_active
    });
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      max_uses: 1,
      plan_type: "pro",
      duration_months: 1,
      expires_at: "",
      is_active: true
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Code copied to clipboard!");
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code: result });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header breadcrumbs={["Invite Codes", "Management"]} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invite Codes Management</h1>
              <p className="text-gray-600 mt-1">Create and manage invite codes for Pro access</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Code
            </Button>
          </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Create/Edit Form */}
        {(showCreateForm || editingCode) && (
          <Card className="mb-6 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-gray-900">
                {editingCode ? "Edit Invite Code" : "Create New Invite Code"}
              </CardTitle>
              <CardDescription>
                {editingCode ? "Update the invite code details" : "Create a new invite code for Pro access"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="code" className="text-gray-700 font-medium">Code *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., PROMO2024"
                      className="font-mono border-gray-300 focus:border-gray-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomCode}
                      className="px-3 border-gray-300"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="max_uses" className="text-gray-700 font-medium">Max Uses</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) })}
                    min="1"
                    className="mt-1 border-gray-300 focus:border-gray-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Influencer promo code for free pro access"
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="plan_type" className="text-gray-700 font-medium">Plan Type</Label>
                  <select
                    id="plan_type"
                    value={formData.plan_type}
                    onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:border-gray-500"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="duration_months" className="text-gray-700 font-medium">Duration (Months)</Label>
                  <Input
                    id="duration_months"
                    type="number"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                    min="1"
                    className="mt-1 border-gray-300 focus:border-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="expires_at" className="text-gray-700 font-medium">Expires At (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="mt-1 border-gray-300 focus:border-gray-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-gray-800 focus:ring-gray-500"
                />
                <Label htmlFor="is_active" className="text-gray-700 font-medium">Active</Label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={editingCode ? handleUpdateCode : handleCreateCode}
                  className="bg-gray-800 hover:bg-gray-700 text-white"
                >
                  {editingCode ? "Update Code" : "Create Code"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCode(null);
                    resetForm();
                    setError(null);
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invite Codes List */}
        <div className="grid gap-4">
          {inviteCodes.map((code) => (
            <Card key={code.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold bg-gray-100 px-3 py-1 rounded border">
                          {code.code}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code.code)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        {code.is_active ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize border-gray-300">
                          {code.plan_type}
                        </Badge>
                      </div>
                    </div>

                    {code.description && (
                      <p className="text-gray-600 mb-4">{code.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 font-medium">Usage:</span>
                        <div className="font-semibold text-gray-900">{code.used_count} / {code.max_uses}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Duration:</span>
                        <div className="font-semibold text-gray-900">{code.duration_months} month(s)</div>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Created:</span>
                        <div className="font-semibold text-gray-900">
                          {new Date(code.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Expires:</span>
                        <div className="font-semibold text-gray-900">
                          {code.expires_at 
                            ? new Date(code.expires_at).toLocaleDateString()
                            : "Never"
                          }
                        </div>
                      </div>
                    </div>

                    {/* Redemptions */}
                    {code.invite_code_redemptions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium mb-3 flex items-center gap-2 text-gray-900">
                          <Users className="w-4 h-4" />
                          Redemptions ({code.invite_code_redemptions.length})
                        </h4>
                        <div className="space-y-2">
                          {code.invite_code_redemptions.slice(0, 3).map((redemption) => (
                            <div key={redemption.id} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded border">
                              <span className="font-medium text-gray-900">{redemption.user_email}</span>
                              <span className="text-gray-500">
                                {new Date(redemption.redeemed_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                          {code.invite_code_redemptions.length > 3 && (
                            <p className="text-sm text-gray-500 text-center py-2">
                              +{code.invite_code_redemptions.length - 3} more redemptions
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCode(code)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCode(code.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {inviteCodes.length === 0 && !loading && (
          <Card className="shadow-sm">
            <CardContent className="p-12 text-center">
              <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2 text-gray-900">No invite codes yet</h3>
              <p className="text-gray-500 mb-6">Create your first invite code to start giving Pro access to users</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Code
              </Button>
            </CardContent>
          </Card>
        )}
        </main>
      </div>
    </div>
  );
}
