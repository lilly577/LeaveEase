import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Send, AlertCircle } from 'lucide-react';
import { LeaveReason } from '@/types';
import { createLeave } from '@/services/leave.service';

const leaveReasons: { value: LeaveReason; label: string; description: string }[] = [
  { value: 'illness', label: 'Illness', description: 'Medical appointment or health-related absence' },
  { value: 'funeral', label: 'Funeral', description: 'Bereavement or funeral attendance' },
  { value: 'emergency', label: 'Emergency', description: 'Urgent personal or family emergency' },
  { value: 'personal', label: 'Personal', description: 'Personal matters requiring time off' },
  { value: 'other', label: 'Other', description: 'Other reasons not listed above' },
];

export default function LeaveRequest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [reason, setReason] = useState<LeaveReason | ''>('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current) return;
    
    if (!reason || !description || !startDate || !endDate || !startTime || !endTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (endDate < startDate) {
      toast({
        title: 'Invalid Dates',
        description: 'End date must be after start date',
        variant: 'destructive',
      });
      return;
    }
    
    submitLockRef.current = true;
    setIsSubmitting(true);
      
    try {
    const payload = new FormData();
    payload.append('reason', reason);
    payload.append('description', description);
    payload.append('startDate', startDate.toISOString());
    payload.append('endDate', endDate.toISOString());
    payload.append('startTime', startTime);
    payload.append('endTime', endTime);
    attachments.forEach((file) => payload.append('attachments', file));

    await createLeave(payload);
    
    toast({
      title: 'Request Submitted',
      description: 'Your leave request has been sent to HR for review.',
    });
    
    navigate('/leave/my-requests');
  } catch (error) {
    toast({
      title: 'Submission Failed',
      description: 'There was an error submitting your request. Please try again later.',
      variant: 'destructive',
    });
  } finally {
    submitLockRef.current = false;
    setIsSubmitting(false);
  }
  };

  return (
    <AppLayout title="Request Leave">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>New Leave Request</CardTitle>
            <CardDescription>
              Fill out the form below to request leave. HR will review your request and notify you of the decision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave *</Label>
                <Select value={reason} onValueChange={(v) => setReason(v as LeaveReason)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveReasons.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        <div>
                          <span className="font-medium">{r.label}</span>
                          <span className="text-muted-foreground ml-2 text-sm">- {r.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="pointer-events-auto"
                        disabled={(date) => date < (startDate || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide details about your leave request..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Provide sufficient detail to help HR understand your request.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments (Optional)</Label>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                />
                <p className="text-xs text-muted-foreground">
                  Upload limits are configured by system policy.
                </p>
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Important</p>
                  <p className="text-muted-foreground">
                    Leave requests should be submitted at least 24 hours in advance for non-emergency situations.
                    Emergency requests will be processed as soon as possible.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
