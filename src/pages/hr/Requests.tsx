import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Eye, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { getAllLeaves, updateLeaveStatus } from '@/services/leave.service';
import { useAuth } from '@/contexts/AuthContext';

type LeaveStatusFilter = 'pending' | 'approved' | 'denied';
type LeaveStage = 'hr_pending' | 'completed' | 'escalated';

type LeaveAttachment = { originalName: string; filePath: string };

type HRLeaveRequest = {
  id: string;
  userName: string;
  department: string;
  reason: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: LeaveStatusFilter;
  currentStage: LeaveStage;
  createdAt: string;
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  slaDueAt?: string;
  escalatedAt?: string;
  escalationReason?: string;
  hrApproval?: {
    status: 'pending' | 'approved' | 'denied';
  };
  attachments?: LeaveAttachment[];
};

const normalizeRole = (role?: string) => (role === 'hr' ? 'hr_admin' : role);

const normalizeStatus = (status: string): LeaveStatusFilter => {
  if (status === 'rejected') return 'denied';
  if (status === 'approved') return 'approved';
  if (status === 'denied') return 'denied';
  return 'pending';
};

const toAttachmentUrl = (filePath: string) => {
  if (!filePath) return '#';
  if (filePath.startsWith('http')) return filePath;
  return `http://localhost:5000/${filePath.replace(/^\/+/, '')}`;
};

export default function HRRequests() {
  const { toast } = useToast();
  const { user } = useAuth();
  const actorRole = normalizeRole(user?.role);

  const [requests, setRequests] = useState<HRLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveStatusFilter | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<HRLeaveRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await getAllLeaves();
      const mapped: HRLeaveRequest[] = (res.data ?? []).map((item: any) => ({
        id: item?._id ?? '',
        userName: item?.staff?.fullName ?? 'Unknown Staff',
        department: item?.staff?.department ?? '-',
        reason: item?.reason ?? 'other',
        description: item?.description ?? '-',
        startDate: item?.startDate ?? item?.createdAt,
        endDate: item?.endDate ?? item?.startDate ?? item?.createdAt,
        startTime: item?.startTime ?? '--:--',
        endTime: item?.endTime ?? '--:--',
        status: normalizeStatus(item?.status),
        currentStage: item?.currentStage ?? 'hr_pending',
        createdAt: item?.createdAt ?? new Date().toISOString(),
        reviewNote: item?.reviewNote,
        reviewedBy: item?.reviewedBy?.fullName,
        reviewedAt: item?.reviewedAt,
        slaDueAt: item?.slaDueAt,
        escalatedAt: item?.escalatedAt,
        escalationReason: item?.escalationReason,
        hrApproval: {
          status: item?.hrApproval?.status ?? 'pending',
        },
        attachments: (item?.attachments ?? []).map((attachment: any) => ({
          originalName: attachment?.originalName ?? 'Attachment',
          filePath: attachment?.filePath ?? '',
        })),
      }));
      setRequests(mapped);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      toast({
        title: 'Load Failed',
        description: 'Could not load leave requests.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => requests.filter((request) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      request.userName.toLowerCase().includes(q) ||
      request.department.toLowerCase().includes(q) ||
      request.reason.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [requests, searchTerm, statusFilter]);

  const canHrAct = (request: HRLeaveRequest) => {
    if (!['hr_admin', 'super_admin'].includes(actorRole || '')) return false;
    return request.currentStage === 'hr_pending' || request.currentStage === 'escalated';
  };

  const canAct = (request: HRLeaveRequest) => canHrAct(request);

  const handleApprove = async (request: HRLeaveRequest) => {
    setIsProcessing(true);
    try {
      await updateLeaveStatus(request.id, 'approved', reviewNote);
      await fetchRequests();
      toast({ title: 'Request Approved', description: `Leave request for ${request.userName} has been approved.` });
      setSelectedRequest(null);
      setReviewNote('');
    } catch (error) {
      const description = axios.isAxiosError(error)
        ? (error.response?.data?.message || error.response?.data?.detail || error.message)
        : 'Could not approve request.';
      toast({ title: 'Approval Failed', description, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async (request: HRLeaveRequest) => {
    if (!reviewNote) {
      toast({ title: 'Note Required', description: 'Please provide a reason for denial', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    try {
      await updateLeaveStatus(request.id, 'denied', reviewNote);
      await fetchRequests();
      toast({ title: 'Request Denied', description: `Leave request for ${request.userName} has been denied.` });
      setSelectedRequest(null);
      setReviewNote('');
    } catch (error) {
      const description = axios.isAxiosError(error)
        ? (error.response?.data?.message || error.response?.data?.detail || error.message)
        : 'Could not deny request.';
      toast({ title: 'Denial Failed', description, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; className: string }> = {
      pending: { icon: <Clock className="h-3 w-3" />, className: 'bg-warning/20 text-warning border-warning/30' },
      approved: { icon: <CheckCircle2 className="h-3 w-3" />, className: 'bg-success/20 text-success border-success/30' },
      denied: { icon: <XCircle className="h-3 w-3" />, className: 'bg-destructive/20 text-destructive border-destructive/30' },
    };
    const { icon, className } = config[status] || config.pending;
    return (
      <Badge variant="outline" className={`capitalize ${className}`}>
        {icon}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  const getStageBadge = (stage: LeaveStage) => {
    const styles: Record<LeaveStage, string> = {
      hr_pending: 'bg-warning/20 text-warning',
      escalated: 'bg-destructive/20 text-destructive',
      completed: 'bg-muted text-muted-foreground',
    };
    return <Badge className={styles[stage]}>{stage.replace('_', ' ')}</Badge>;
  };

  return (
    <AppLayout title="Leave Requests" requireRoles={["hr_admin", "super_admin", "hr"]}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Leave Requests
            </CardTitle>
            <CardDescription>HR approvals, escalation, and SLA tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, department, or reason..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeaveStatusFilter | 'all')}>
                <SelectTrigger className="w-full sm:w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading requests...</TableCell></TableRow>
                  ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.userName}</p>
                            <p className="text-sm text-muted-foreground">{request.department}</p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{request.reason}</TableCell>
                        <TableCell>{getStageBadge(request.currentStage)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedRequest(request);
                                setReviewNote(request.reviewNote || '');
                              }}>
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Leave Request</DialogTitle>
                                <DialogDescription>Submitted on {format(parseISO(request.createdAt), 'PPP')}</DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 mt-4">
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(request.status)}
                                  {getStageBadge(request.currentStage)}
                                  {request.slaDueAt && <Badge variant="outline">SLA {format(parseISO(request.slaDueAt), 'PPP p')}</Badge>}
                                </div>

                                {request.escalatedAt && (
                                  <p className="text-sm text-destructive">
                                    Escalated on {format(parseISO(request.escalatedAt), 'PPP p')}: {request.escalationReason || 'SLA breach'}
                                  </p>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                  <div><span className="text-sm text-muted-foreground">Employee</span><p className="font-medium">{request.userName}</p></div>
                                  <div><span className="text-sm text-muted-foreground">Department</span><p className="font-medium">{request.department}</p></div>
                                </div>

                                <div>
                                  <span className="text-sm text-muted-foreground">Date & Time</span>
                                  <p className="font-medium">{format(parseISO(request.startDate), 'MMM d, yyyy')}{request.startDate !== request.endDate && <> - {format(parseISO(request.endDate), 'MMM d, yyyy')}</>}</p>
                                  <p className="text-sm text-muted-foreground">{request.startTime} - {request.endTime}</p>
                                </div>

                                <div>
                                  <span className="text-sm text-muted-foreground">Description</span>
                                  <p className="mt-1 p-3 rounded-lg bg-muted text-sm">{request.description}</p>
                                </div>

                                {request.attachments && request.attachments.length > 0 && (
                                  <div>
                                    <span className="text-sm text-muted-foreground">Attachments</span>
                                    <div className="mt-2 space-y-1">
                                      {request.attachments.map((attachment, index) => (
                                        <a key={`${attachment.filePath}-${index}`} href={toAttachmentUrl(attachment.filePath)} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline block">
                                          {attachment.originalName}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {canAct(request) && (
                                  <div className="space-y-2">
                                    <Label htmlFor="note">Review Note</Label>
                                    <Textarea id="note" placeholder="Add a note for this decision..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={3} />
                                  </div>
                                )}

                              </div>

                              {canAct(request) && request.status === 'pending' && (
                                <DialogFooter className="gap-2 mt-4">
                                  <Button variant="destructive" onClick={() => handleDeny(request)} disabled={isProcessing}><XCircle className="h-4 w-4 mr-1" />Deny</Button>
                                  <Button onClick={() => handleApprove(request)} disabled={isProcessing}><CheckCircle2 className="h-4 w-4 mr-1" />Approve</Button>
                                </DialogFooter>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No requests found</TableCell></TableRow>
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
