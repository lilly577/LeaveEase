import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  Users,
  Clock,
  CheckCircle2,
  MessageSquare,
  Megaphone,
  ArrowRight,
  FileText,
  Calendar,
} from 'lucide-react';
import { getAllLeaves } from '@/services/leave.service';
import { getFeedbacks } from '@/services/feedback.service';
import { getAnnouncements } from '@/services/announcement.service';

type LeaveDashboardItem = {
  id: string;
  userName: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
};

type FeedbackDashboardItem = {
  id: string;
  subject: string;
  message: string;
  isRead: boolean;
  isAnonymous: boolean;
  userName: string;
  createdAt: string;
};

type AnnouncementDashboardItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function HRDashboard() {
  const [requests, setRequests] = useState<LeaveDashboardItem[]>([]);
  const [feedback, setFeedback] = useState<FeedbackDashboardItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementDashboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [leavesRes, feedbackRes, announcementsRes] = await Promise.all([
          getAllLeaves(),
          getFeedbacks(),
          getAnnouncements(),
        ]);

        const mappedLeaves: LeaveDashboardItem[] = (leavesRes.data ?? []).map((item: any) => ({
          id: item?._id ?? '',
          userName: item?.staff?.fullName ?? 'Unknown Staff',
          reason: item?.reason ?? 'other',
          status: item?.status === 'rejected' ? 'denied' : (item?.status ?? 'pending'),
          createdAt: item?.createdAt ?? new Date().toISOString(),
        }));

        const mappedFeedback: FeedbackDashboardItem[] = (feedbackRes.data ?? []).map((item: any) => ({
          id: item?._id ?? '',
          subject: item?.subject ?? 'Staff Feedback',
          message: item?.message ?? '',
          isRead: !!item?.isRead,
          isAnonymous: !!item?.isAnonymous,
          userName: item?.isAnonymous ? 'Anonymous Member' : (item?.staff?.fullName ?? 'Unknown Staff'),
          createdAt: item?.createdAt ?? new Date().toISOString(),
        }));

        const mappedAnnouncements: AnnouncementDashboardItem[] = (announcementsRes.data ?? []).map((item: any) => ({
          id: item?._id ?? '',
          title: item?.title ?? 'Untitled',
          content: item?.message ?? '',
          createdAt: item?.createdAt ?? new Date().toISOString(),
        }));

        setRequests(mappedLeaves);
        setFeedback(mappedFeedback);
        setAnnouncements(mappedAnnouncements);
      } catch (error) {
        console.error('Failed to fetch HR dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const unreadFeedback = feedback.filter(f => !f.isRead).length;
  const activeAnnouncements = announcements.length;

  return (
    <AppLayout title="HR Dashboard" requireRoles={["hr_admin", "super_admin", "hr"]}>
      {loading ? (
        <p className="text-center text-muted-foreground py-10">Loading dashboard...</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">HR Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage leave requests, staff schedules and announcements
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/hr/announcements">
                  <Megaphone className="h-4 w-4 mr-2" />
                  New Announcement
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-warning">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Requests
                </CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRequests.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Requires action</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Approved Requests
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Total approved</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unread Feedback
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unreadFeedback}</div>
                <p className="text-xs text-muted-foreground mt-1">New submissions</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Announcements
                </CardTitle>
                <Megaphone className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAnnouncements}</div>
                <p className="text-xs text-muted-foreground mt-1">Published</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pending Leave Requests</CardTitle>
                  <CardDescription>Requests awaiting your review</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/hr/requests">
                    View all <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.slice(0, 4).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {request.userName
                              .split(' ')
                              .filter(Boolean)
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{request.userName}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {request.reason} - {format(parseISO(request.createdAt), 'MMM d')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-warning/20 text-warning">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  ))}
                  {pendingRequests.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No pending requests</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Feedback</CardTitle>
                  <CardDescription>Staff submissions</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/hr/feedback">
                    View all <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{item.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.message}
                          </p>
                        </div>
                        {!item.isRead && (
                          <Badge variant="default" className="shrink-0">New</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{item.isAnonymous ? 'Anonymous Member' : item.userName}</span>
                        <span>-</span>
                        <span>{format(parseISO(item.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  ))}
                  {feedback.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No feedback submissions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common HR management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/hr/requests">
                    <FileText className="h-5 w-5" />
                    <span>Review Requests</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/hr/schedule">
                    <Calendar className="h-5 w-5" />
                    <span>Manage Schedule</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/hr/announcements">
                    <Megaphone className="h-5 w-5" />
                    <span>Post Announcement</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/hr/staff">
                    <Users className="h-5 w-5" />
                    <span>View Staff</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
