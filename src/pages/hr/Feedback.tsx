import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { MessageSquare, User, Lock, Eye } from 'lucide-react';
import { getFeedbacks, markFeedbackAsRead } from '@/services/feedback.service';

type FeedbackItem = {
  id: string;
  subject: string;
  message: string;
  isAnonymous: boolean;
  isRead: boolean;
  userName: string;
  createdAt: string;
};

export default function HRFeedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const res = await getFeedbacks();
      const mapped: FeedbackItem[] = (res.data ?? []).map((item: any) => ({
        id: item?._id ?? '',
        subject: item?.subject ?? 'Staff Feedback',
        message: item?.message ?? '',
        isAnonymous: !!item?.isAnonymous,
        isRead: !!item?.isRead,
        userName: item?.isAnonymous ? 'Anonymous Member' : (item?.staff?.fullName ?? 'Unknown Staff'),
        createdAt: item?.createdAt ?? new Date().toISOString(),
      }));
      setFeedback(mapped);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markFeedbackAsRead(id);
      setFeedback(prev => prev.map(f => (f.id === id ? { ...f, isRead: true } : f)));
    } catch (error) {
      console.error('Failed to mark feedback as read:', error);
    }
  };

  const unreadCount = feedback.filter(f => !f.isRead).length;

  return (
    <AppLayout title="Staff Feedback" requireRoles={["hr_admin", "super_admin", "hr"]}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedback.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unread</CardTitle>
              <Badge variant="default">{unreadCount}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Anonymous</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedback.filter(f => f.isAnonymous).length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              All Feedback
            </CardTitle>
            <CardDescription>Confidential feedback from staff members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading feedback...</p>
              ) : feedback.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    item.isRead ? 'bg-background' : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{item.subject}</h3>
                        {!item.isRead && <Badge variant="default" className="text-xs">New</Badge>}
                        {item.isAnonymous && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Anonymous Member
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{item.message}</p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {item.isAnonymous ? <Lock className="h-3 w-3" /> : <User className="h-3 w-3" />}
                          {item.isAnonymous ? 'Anonymous Member' : item.userName}
                        </span>
                        <span>-</span>
                        <span>{format(parseISO(item.createdAt), 'MMM d, yyyy \a\t h:mm a')}</span>
                      </div>
                    </div>

                    {!item.isRead && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(item.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {!loading && feedback.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No feedback received yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
