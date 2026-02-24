import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Megaphone,
  FileText,
  ArrowRight,
} from "lucide-react";
import { getMyLeaves } from "@/services/leave.service";
import { getMySchedule } from "@/services/schedule.service";
import { getAnnouncements } from "@/services/announcement.service";

interface LeaveRequest {
  id: string;
  status: "pending" | "approved" | "denied";
  reason: string;
  startDate: string;
}

interface OffDay {
  id: string;
  date: string;
  note?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

const normalizeStatus = (status: string): "pending" | "approved" | "denied" => {
  if (status === "approved") return "approved";
  if (status === "denied" || status === "rejected") return "denied";
  return "pending";
};

export default function StaffDashboard() {
  const { user } = useAuth();

  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [offDays, setOffDays] = useState<OffDay[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [requestsRes, offDaysRes, announcementsRes] = await Promise.all([
          getMyLeaves(),
          getMySchedule(),
          getAnnouncements(),
        ]);

        const leaves = (requestsRes.data ?? []).map((item: any) => ({
          id: item?._id ?? "",
          status: normalizeStatus(item?.status),
          reason: item?.reason ?? "other",
          startDate: item?.startDate ?? item?.createdAt,
        }));

        const schedule = (offDaysRes.data ?? []).map((item: any) => ({
          id: item?._id ?? "",
          date: item?.offDate,
          note: item?.note,
        }));

        const about = (announcementsRes.data ?? []).map((item: any) => ({
          id: item?._id ?? "",
          title: item?.title ?? "Untitled",
          content: item?.message ?? "",
          priority: item?.priority ?? "medium",
          createdAt: item?.createdAt ?? new Date().toISOString(),
        }));

        setMyRequests(leaves);
        setOffDays(schedule);
        setAnnouncements(about);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingCount = myRequests.filter((r) => r.status === "pending").length;
  const approvedCount = myRequests.filter((r) => r.status === "approved").length;
  const deniedCount = myRequests.filter((r) => r.status === "denied").length;

  const today = new Date();
  const nextWeek = addDays(today, 7);
  const upcomingOffDays = offDays.filter((d) => {
    const date = parseISO(d.date);
    return isAfter(date, today) && isBefore(date, nextWeek);
  });

  const recentAnnouncements = announcements.slice(0, 2);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "denied":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      denied: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-destructive";
      case "medium":
        return "border-l-warning";
      default:
        return "border-l-muted-foreground";
    }
  };

  return (
    <AppLayout title="Dashboard">
      {loading ? (
        <p className="text-center text-muted-foreground py-10">Loading dashboard...</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]}!</h1>
              <p className="text-muted-foreground mt-1">Here's what's happening with your leave requests and schedule.</p>
            </div>
            <Button asChild>
              <Link to="/leave/request">
                <FileText className="h-4 w-4 mr-2" />
                New Leave Request
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting HR review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Denied</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deniedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Off-Days</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingOffDays.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Next 7 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Requests</CardTitle>
                  <CardDescription>Your latest leave requests</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/leave/my-requests">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <p className="font-medium capitalize">{request.reason}</p>
                          <p className="text-sm text-muted-foreground">{format(parseISO(request.startDate), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                  {myRequests.length === 0 && <p className="text-center text-muted-foreground py-4">No requests yet</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>Latest from HR</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/announcements">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className={`p-4 rounded-lg border-l-4 bg-muted/30 ${getPriorityColor(announcement.priority)}`}>
                      <div className="flex items-start gap-3">
                        <Megaphone className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">{announcement.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{announcement.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">{format(parseISO(announcement.createdAt), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Off-Days</CardTitle>
                <CardDescription>Your scheduled off-days for the next week</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/schedule">View schedule <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingOffDays.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {upcomingOffDays.map((offDay) => (
                    <div key={offDay.id} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">{format(parseISO(offDay.date), "EEE, MMM d")}</span>
                      {offDay.note && <span className="text-sm text-muted-foreground">({offDay.note})</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No scheduled off-days in the next 7 days</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
