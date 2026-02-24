import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users, Mail, Building2 } from 'lucide-react';
import { getStaffUsers } from '@/services/user.service';
import { getAllLeaves } from '@/services/leave.service';

type StaffItem = {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'on_leave';
};

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, leavesRes] = await Promise.all([getStaffUsers(), getAllLeaves()]);

        const today = new Date();
        const onLeaveUserIds = new Set(
          (leavesRes.data ?? [])
            .filter((leave: any) => {
              if (leave?.status !== 'approved') return false;
              if (!leave?.startDate || !leave?.endDate) return false;
              const start = new Date(leave.startDate);
              const end = new Date(leave.endDate);
              return start <= today && end >= today;
            })
            .map((leave: any) => leave?.staff?._id)
            .filter(Boolean)
        );

        const mappedStaff: StaffItem[] = (usersRes.data ?? []).map((user: any) => ({
          id: user?._id ?? '',
          name: user?.fullName ?? 'Unknown Staff',
          email: user?.email ?? '-',
          department: user?.department ?? '-',
          status: onLeaveUserIds.has(user?._id) ? 'on_leave' : 'active',
        }));

        setStaffList(mappedStaff);
      } catch (error) {
        console.error('Failed to fetch staff data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStaff = staffList.filter((staff) =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase();
  };

  return (
    <AppLayout title="Staff Management" requireRoles={["hr_admin", "super_admin", "hr"]}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffList.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <Badge variant="default">Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffList.filter(s => s.status === 'active').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">On Leave</CardTitle>
              <Badge variant="secondary">On Leave</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffList.filter(s => s.status === 'on_leave').length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Staff Directory
            </CardTitle>
            <CardDescription>View and manage all staff members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Loading staff directory...
                      </TableCell>
                    </TableRow>
                  ) : filteredStaff.length > 0 ? (
                    filteredStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(staff.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{staff.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {staff.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {staff.department}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                            {staff.status === 'active' ? 'Active' : 'On Leave'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No staff records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
