import { useEffect, useRef, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Megaphone, Plus, CalendarIcon, Trash2, AlertTriangle, Bell, Info } from 'lucide-react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/services/announcement.service';

type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
};

export default function HRAnnouncements() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const publishLockRef = useRef(false);
  const deleteLockRef = useRef<Record<string, boolean>>({});

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [expiresAt, setExpiresAt] = useState<Date>();

  const fetchAnnouncements = async () => {
    try {
      const res = await getAnnouncements();
      const mapped: AnnouncementItem[] = (res.data ?? []).map((item: any) => ({
        id: item?._id ?? '',
        title: item?.title ?? 'Untitled',
        content: item?.message ?? '',
        priority: item?.priority ?? 'medium',
        createdBy: item?.createdBy?.fullName ?? 'HR',
        createdAt: item?.createdAt ?? new Date().toISOString(),
        expiresAt: item?.expiresAt,
      }));
      setAnnouncements(mapped);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async () => {
    if (publishLockRef.current) return;

    if (!title || !content) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      publishLockRef.current = true;
      setIsPublishing(true);
      await createAnnouncement({
        title,
        message: content,
        priority,
        expiresAt: expiresAt?.toISOString(),
      });

      toast({
        title: 'Announcement Published',
        description: 'Your announcement is now visible to all staff.',
      });

      setTitle('');
      setContent('');
      setPriority('medium');
      setExpiresAt(undefined);
      setIsDialogOpen(false);
      await fetchAnnouncements();
    } catch (error) {
      toast({
        title: 'Publish Failed',
        description: 'Could not publish announcement.',
        variant: 'destructive',
      });
    } finally {
      publishLockRef.current = false;
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteLockRef.current[id]) return;

    try {
      deleteLockRef.current[id] = true;
      setDeletingId(id);
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Announcement Deleted', description: 'The announcement has been removed.' });
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete announcement.',
        variant: 'destructive',
      });
    } finally {
      deleteLockRef.current[id] = false;
      setDeletingId(null);
    }
  };

  const getPriorityConfig = (level: string) => {
    switch (level) {
      case 'high':
        return { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' };
      case 'medium':
        return { icon: Bell, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' };
      default:
        return { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
    }
  };

  return (
    <AppLayout title="Announcements" requireRoles={["hr_admin", "super_admin", "hr"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Announcements</h1>
            <p className="text-muted-foreground">Create and manage company-wide announcements</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  This announcement will be visible to all staff members.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" placeholder="Announcement title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea id="content" placeholder="Write your announcement..." value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Expires On (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn('w-full justify-start text-left font-normal', !expiresAt && 'text-muted-foreground')}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expiresAt ? format(expiresAt, 'PPP') : 'No expiry'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={expiresAt}
                          onSelect={setExpiresAt}
                          initialFocus
                          className="pointer-events-auto"
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isPublishing}>
                  <Megaphone className="h-4 w-4 mr-2" />
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              All Announcements
            </CardTitle>
            <CardDescription>
              {announcements.length} announcement{announcements.length !== 1 ? 's' : ''} published
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading announcements...</p>
              ) : announcements.map((announcement) => {
                const config = getPriorityConfig(announcement.priority);
                const Icon = config.icon;

                return (
                  <div key={announcement.id} className={`p-4 rounded-lg border ${config.border} ${config.bg}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{announcement.title}</h3>
                            <Badge variant="outline" className={`capitalize text-xs ${config.color}`}>
                              {announcement.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{announcement.content}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>Posted by {announcement.createdBy}</span>
                            <span>-</span>
                            <span>Posted {format(parseISO(announcement.createdAt), 'MMM d, yyyy')}</span>
                            {announcement.expiresAt && <span>- Expires {format(parseISO(announcement.expiresAt), 'MMM d, yyyy')}</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={deletingId === announcement.id}
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {!loading && announcements.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No announcements yet. Create one to get started.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
