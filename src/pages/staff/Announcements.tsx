import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Megaphone, AlertTriangle, Info, Bell } from 'lucide-react';
import { getAnnouncements } from '@/services/announcement.service';

type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          icon: AlertTriangle,
          color: 'text-destructive',
          bg: 'bg-destructive/10',
          border: 'border-destructive/30',
          badge: 'bg-destructive/20 text-destructive border-destructive/30',
        };
      case 'medium':
        return {
          icon: Bell,
          color: 'text-warning',
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          badge: 'bg-warning/20 text-warning border-warning/30',
        };
      default:
        return {
          icon: Info,
          color: 'text-primary',
          bg: 'bg-primary/10',
          border: 'border-primary/30',
          badge: 'bg-primary/20 text-primary border-primary/30',
        };
    }
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await getAnnouncements();
        const data: Announcement[] = (res.data ?? []).map((item: any) => ({
          id: item?._id ?? '',
          title: item?.title ?? 'Untitled',
          content: item?.message ?? '',
          priority: item?.priority ?? 'medium',
          createdBy: item?.createdBy?.fullName ?? 'HR',
          createdAt: item?.createdAt ?? new Date().toISOString(),
          expiresAt: item?.expiresAt,
        }));
        setAnnouncements(data);
      } catch (error) {
        console.error('Failed to load announcements', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <AppLayout title="Announcements">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Company Announcements
            </CardTitle>
            <CardDescription>
              Stay updated with the latest news and updates from HR
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading && <p className="text-muted-foreground">Loading announcements...</p>}

            {!loading && announcements.length === 0 && (
              <p className="text-muted-foreground">No announcements available.</p>
            )}

            <div className="space-y-4">
              {announcements.map((announcement) => {
                const config = getPriorityConfig(announcement.priority);
                const Icon = config.icon;

                return (
                  <div key={announcement.id} className={`p-6 rounded-lg border ${config.border} ${config.bg}`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <h3 className="font-semibold text-lg">{announcement.title}</h3>
                          <Badge variant="outline" className={`capitalize ${config.badge}`}>
                            {announcement.priority} priority
                          </Badge>
                        </div>

                        <p className="mt-3 text-foreground/80 leading-relaxed">{announcement.content}</p>

                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Posted by {announcement.createdBy}</span>
                          <span>-</span>
                          <span>{format(parseISO(announcement.createdAt), 'MMMM d, yyyy')}</span>

                          {announcement.expiresAt && (
                            <>
                              <span>-</span>
                              <span>Expires {format(parseISO(announcement.expiresAt), 'MMM d, yyyy')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
