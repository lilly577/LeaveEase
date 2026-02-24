import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { getAllSchedules, createSchedule, deleteSchedule } from '@/services/schedule.service';
import { getStaffUsers } from '@/services/user.service';

type StaffItem = { id: string; name: string };

type OffDayItem = {
  id: string;
  userId: string;
  userName: string;
  date: string;
  type: 'scheduled' | 'approved_leave';
  note?: string;
};

export default function HRSchedule() {
  const { toast } = useToast();
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [offDays, setOffDays] = useState<OffDayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [note, setNote] = useState('');

  const loadData = async () => {
    try {
      const [staffRes, scheduleRes] = await Promise.all([getStaffUsers(), getAllSchedules()]);

      const mappedStaff: StaffItem[] = (staffRes.data ?? []).map((item: any) => ({
        id: item?._id ?? '',
        name: item?.fullName ?? 'Unknown Staff',
      }));

      const mappedSchedules: OffDayItem[] = (scheduleRes.data ?? []).map((item: any) => ({
        id: item?._id ?? '',
        userId: item?.staff?._id ?? '',
        userName: item?.staff?.fullName ?? 'Unknown Staff',
        date: item?.offDate,
        type: item?.type ?? 'scheduled',
        note: item?.note,
      }));

      setStaffList(mappedStaff);
      setOffDays(mappedSchedules);
    } catch (error) {
      console.error('Failed to load schedule data:', error);
      toast({
        title: 'Load Failed',
        description: 'Could not load schedule data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedStaff || !selectedDate) {
      toast({
        title: 'Missing Information',
        description: 'Please select a staff member and date',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createSchedule({
        staff: selectedStaff,
        offDate: selectedDate.toISOString(),
        note: note || undefined,
        type: 'scheduled',
      });

      const staff = staffList.find(s => s.id === selectedStaff);
      toast({
        title: 'Off-Day Scheduled',
        description: `${staff?.name || 'Staff'} has been scheduled off on ${format(selectedDate, 'MMM d, yyyy')}.`,
      });

      setSelectedStaff('');
      setSelectedDate(undefined);
      setNote('');
      setIsDialogOpen(false);

      await loadData();
    } catch (error) {
      toast({
        title: 'Schedule Failed',
        description: 'Could not schedule off-day.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchedule(id);
      setOffDays(prev => prev.filter(d => d.id !== id));
      toast({
        title: 'Off-Day Removed',
        description: 'The scheduled off-day has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Could not remove off-day.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout title="Schedule Management" requireRoles={["hr_admin", "super_admin", "hr"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Schedule Management</h1>
            <p className="text-muted-foreground">Manage staff off-days and schedules</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Off-Day
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Off-Day</DialogTitle>
                <DialogDescription>
                  Assign an off-day to a staff member. They will be notified via email.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Staff Member *</Label>
                  <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !selectedDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Input
                    id="note"
                    placeholder="e.g., Weekend rotation, Shift off"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              All Scheduled Off-Days
            </CardTitle>
            <CardDescription>
              {offDays.length} off-day{offDays.length !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Loading schedules...
                      </TableCell>
                    </TableRow>
                  ) : offDays.length > 0 ? (
                    offDays.map((day) => (
                      <TableRow key={day.id}>
                        <TableCell className="font-medium">{day.userName}</TableCell>
                        <TableCell>{format(parseISO(day.date), 'EEE, MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={day.type === 'scheduled' ? 'default' : 'secondary'}>
                            {day.type === 'scheduled' ? 'Scheduled' : 'Approved Leave'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{day.note || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(day.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No off-days scheduled yet
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
