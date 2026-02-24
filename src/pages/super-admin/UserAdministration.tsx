import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  listUsers,
  createUserByAdmin,
  updateUserRoleByAdmin,
  updateUserStatusByAdmin,
  resetUserPasswordByAdmin,
  deleteUserByAdmin,
  type AdminUser,
} from "@/services/super-admin.service";
import { useAuth } from "@/contexts/AuthContext";

type Role = "staff" | "hr_admin" | "super_admin" | "hr";

export default function SuperAdminUserAdministration() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPasswordById, setNewPasswordById] = useState<Record<string, string>>({});

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");

  const loadUsers = async () => {
    try {
      const res = await listUsers();
      setUsers(res.data ?? []);
    } catch (error) {
      console.error("Failed to load users", error);
      toast({ title: "Load Failed", description: "Could not load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async () => {
    if (!fullName || !email || !password) {
      toast({ title: "Missing fields", description: "Name, email and password are required", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      await createUserByAdmin({ fullName, email, password, role, department, location });
      toast({ title: "User created", description: "New user account has been created." });
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("staff");
      setDepartment("");
      setLocation("");
      await loadUsers();
    } catch (error) {
      console.error("Failed to create user", error);
      toast({ title: "Create failed", description: "Could not create user", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRoleChange = async (userId: string, nextRole: Role) => {
    try {
      await updateUserRoleByAdmin(userId, nextRole);
      toast({ title: "Role updated", description: "User role has been changed." });
      await loadUsers();
    } catch (error) {
      console.error("Failed to update role", error);
      toast({ title: "Role update failed", description: "Could not update role", variant: "destructive" });
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      await updateUserStatusByAdmin(user.id, !user.isActive);
      toast({ title: "Status updated", description: `${user.fullName} is now ${!user.isActive ? "active" : "deactivated"}.` });
      await loadUsers();
    } catch (error) {
      console.error("Failed to toggle status", error);
      toast({ title: "Status update failed", description: "Could not update account status", variant: "destructive" });
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = newPasswordById[userId] || "";
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Invalid password", description: "Use at least 6 characters", variant: "destructive" });
      return;
    }
    try {
      await resetUserPasswordByAdmin(userId, newPassword);
      toast({ title: "Password reset", description: "User password has been reset." });
      setNewPasswordById((prev) => ({ ...prev, [userId]: "" }));
    } catch (error) {
      console.error("Failed to reset password", error);
      toast({ title: "Reset failed", description: "Could not reset password", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (target: AdminUser) => {
    if (target.id === currentUser?.id) {
      toast({ title: "Blocked", description: "You cannot delete your own account.", variant: "destructive" });
      return;
    }
    const confirmed = window.confirm(`Delete account for ${target.fullName} (${target.email})? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteUserByAdmin(target.id);
      toast({ title: "User deleted", description: `${target.fullName} has been removed.` });
      await loadUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
      toast({ title: "Delete failed", description: "Could not delete user", variant: "destructive" });
    }
  };

  return (
    <AppLayout title="User Administration" requireRoles={["super_admin"]}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create User</CardTitle>
            <CardDescription>Create users and assign roles as Super Admin.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 chars" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="hr_admin">HR Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Operations" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nairobi" />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={isCreating}>{isCreating ? "Creating..." : "Create User"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users & Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Password Reset</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading users...</TableCell></TableRow>
                  ) : users.map((rowUser) => (
                    <TableRow key={rowUser.id}>
                      <TableCell>{rowUser.fullName}</TableCell>
                      <TableCell>{rowUser.email}</TableCell>
                      <TableCell>
                        <Select value={rowUser.role} onValueChange={(value) => handleRoleChange(rowUser.id, value as Role)}>
                          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="hr_admin">HR Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rowUser.isActive ? "default" : "secondary"}>{rowUser.isActive ? "Active" : "Deactivated"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            value={newPasswordById[rowUser.id] || ""}
                            onChange={(e) => setNewPasswordById((prev) => ({ ...prev, [rowUser.id]: e.target.value }))}
                            placeholder="New password"
                            className="w-[180px]"
                          />
                          <Button variant="outline" onClick={() => handleResetPassword(rowUser.id)}>Reset</Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => handleToggleActive(rowUser)}>
                            {rowUser.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteUser(rowUser)}
                            disabled={rowUser.id === currentUser?.id}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
