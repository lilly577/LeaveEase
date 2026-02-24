import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckSquare, AlertTriangle, Megaphone, MessageSquare, ArrowRight } from "lucide-react";
import { getAllLeaves } from "@/services/leave.service";
import { getAnnouncements } from "@/services/announcement.service";
import { getFeedbacks } from "@/services/feedback.service";
import { getStaffUsers } from "@/services/user.service";

type LeaveOverview = {
  status: "pending" | "approved" | "denied";
  currentStage: "hr_pending" | "completed" | "escalated";
};

export default function SuperAdminDashboard() {
  const [leaves, setLeaves] = useState<LeaveOverview[]>([]);
  const [staffCount, setStaffCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [staffRes, leavesRes, announcementsRes, feedbackRes] = await Promise.all([
          getStaffUsers(),
          getAllLeaves(),
          getAnnouncements(),
          getFeedbacks(),
        ]);

        const normalizeStatus = (status: string) => (status === "rejected" ? "denied" : status) as "pending" | "approved" | "denied";
        const mappedLeaves: LeaveOverview[] = (leavesRes.data ?? []).map((item: any) => ({
          status: normalizeStatus(item?.status ?? "pending"),
          currentStage: item?.currentStage ?? "hr_pending",
        }));

        setStaffCount((staffRes.data ?? []).length);
        setLeaves(mappedLeaves);
        setAnnouncementCount((announcementsRes.data ?? []).length);
        setUnreadFeedbackCount((feedbackRes.data ?? []).filter((item: any) => !item?.isRead).length);
      } catch (error) {
        console.error("Failed to load super admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const pendingApprovals = useMemo(() => leaves.filter((leave) => leave.status === "pending").length, [leaves]);
  const escalatedCount = useMemo(() => leaves.filter((leave) => leave.currentStage === "escalated").length, [leaves]);

  return (
    <AppLayout title="Super Admin Dashboard" requireRoles={["super_admin"]}>
      {loading ? (
        <p className="text-center text-muted-foreground py-10">Loading dashboard...</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Global oversight for staff, approvals, communication, and escalations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{staffCount}</div></CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
                <CheckSquare className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{pendingApprovals}</div></CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Escalated Requests</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{escalatedCount}</div></CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Announcements</CardTitle>
                <Megaphone className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{announcementCount}</div></CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unread Feedback</CardTitle>
                <MessageSquare className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{unreadFeedbackCount}</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Global Admin Actions</CardTitle>
                <CardDescription>Use these pages to monitor and manage end-to-end operations.</CardDescription>
              </div>
              <Button variant="ghost" asChild size="sm">
                <Link to="/hr/requests">
                  Open approvals <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button variant="outline" className="h-auto py-4" asChild><Link to="/super-admin/users">User Administration</Link></Button>
              <Button variant="outline" className="h-auto py-4" asChild><Link to="/super-admin/system-control">System Control</Link></Button>
              <Button variant="outline" className="h-auto py-4" asChild><Link to="/hr/requests">Leave Requests</Link></Button>
              <Button variant="outline" className="h-auto py-4" asChild><Link to="/hr/staff">Staff Directory</Link></Button>
              <Button variant="outline" className="h-auto py-4" asChild><Link to="/hr/schedule">Schedule Management</Link></Button>
              <Button variant="outline" className="h-auto py-4" asChild><Link to="/hr/announcements">Announcements</Link></Button>
              <Button variant="outline" className="h-auto py-4" asChild><Link to="/hr/feedback">Feedback Inbox</Link></Button>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
