import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus, Shield, UserCog, Save, Crown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
  manual_pro_access: boolean;
}

interface PendingChange {
  userId: string;
  manual_pro_access?: boolean;
  roleChanges?: Array<{ role: string; action: 'add' | 'remove' }>;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Unauthorized",
          description: "Please log in to access this page",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error || !roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      loadUsers();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/dashboard");
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("list-users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setUsers(data.users || []);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !newPassword) {
      toast({
        title: "Validation Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: newEmail,
          password: newPassword,
          role: newRole,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${newEmail} created successfully`,
      });

      // Reset form
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      
      // Reload users
      loadUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleProAccessChange = (userId: string, checked: boolean) => {
    const changes = new Map(pendingChanges);
    const existing = changes.get(userId) || { userId };
    existing.manual_pro_access = checked;
    changes.set(userId, existing);
    setPendingChanges(changes);
    
    toast({
      title: checked ? "Pro Access Enabled" : "Pro Access Disabled",
      description: "Click Save Changes to apply this update",
    });
  };

  const handleRoleSelection = (userId: string, value: string) => {
    const [action, role] = value.split(":");
    const changes = new Map(pendingChanges);
    const existing = changes.get(userId) || { userId, roleChanges: [] };
    if (!existing.roleChanges) existing.roleChanges = [];
    existing.roleChanges.push({ role, action: action as "add" | "remove" });
    changes.set(userId, existing);
    setPendingChanges(changes);
    
    toast({
      title: "Change Queued",
      description: "Click Save Changes to apply",
    });
  };

  const handleSaveChanges = async () => {
    if (pendingChanges.size === 0) return;

    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      // Process all pending changes
      for (const [userId, changes] of pendingChanges.entries()) {
        // Update pro access if changed
        if (changes.manual_pro_access !== undefined) {
          const { error } = await supabase.functions.invoke("update-user-profile", {
            body: {
              userId,
              manual_pro_access: changes.manual_pro_access,
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (error) throw error;
        }

        // Process role changes
        if (changes.roleChanges) {
          for (const roleChange of changes.roleChanges) {
            const { error } = await supabase.functions.invoke("manage-role", {
              body: {
                userId,
                role: roleChange.role,
                action: roleChange.action,
              },
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });

            if (error) throw error;
          }
        }
      }

      toast({
        title: "Success",
        description: "All changes saved successfully",
      });

      setPendingChanges(new Map());
      loadUsers();
    } catch (error: any) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Shield className="h-10 w-10 text-primary" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Manage users and roles</p>
          </div>
          {pendingChanges.size > 0 && (
            <Button onClick={handleSaveChanges} disabled={saving} size="lg" className="animate-pulse">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : `Save ${pendingChanges.size} Change${pendingChanges.size > 1 ? 's' : ''}`}
            </Button>
          )}
        </div>

        {/* Create User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New User
            </CardTitle>
            <CardDescription>Add a new user to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Initial Role</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create User"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>View and manage user roles</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-center">Manual Pro Access</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const hasPendingChanges = pendingChanges.has(user.id);
                    const pending = pendingChanges.get(user.id);
                    const currentProAccess = pending?.manual_pro_access !== undefined 
                      ? pending.manual_pro_access 
                      : user.manual_pro_access;
                    
                    return (
                      <TableRow key={user.id} className={hasPendingChanges ? "bg-muted/50" : ""}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={currentProAccess}
                                onCheckedChange={(checked) => handleProAccessChange(user.id, checked as boolean)}
                                id={`pro-${user.id}`}
                              />
                              <Label htmlFor={`pro-${user.id}`} className="cursor-pointer text-sm">
                                {currentProAccess ? "Enabled" : "Disabled"}
                              </Label>
                            </div>
                            {currentProAccess && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                                <Crown className="h-3 w-3 mr-1" />
                                Pro
                              </Badge>
                            )}
                            {hasPendingChanges && pending?.manual_pro_access !== undefined && (
                              <Badge variant="outline" className="text-xs">Pending</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge key={role} variant="secondary">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No roles</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={(value) => handleRoleSelection(user.id, value)}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Manage roles" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="add:admin">Add Admin</SelectItem>
                              <SelectItem value="add:moderator">Add Moderator</SelectItem>
                              <SelectItem value="add:user">Add User</SelectItem>
                              <SelectItem value="remove:admin">Remove Admin</SelectItem>
                              <SelectItem value="remove:moderator">Remove Moderator</SelectItem>
                              <SelectItem value="remove:user">Remove User</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
