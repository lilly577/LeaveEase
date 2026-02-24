import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import {
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getMyLeaves } from "@/services/leave.service";

type LeaveStatus = "pending" | "approved" | "denied";
type LeaveAttachment = {
  originalName: string;
  filePath: string;
};

type LeaveRequestItem = {
  id: string;
  reason: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: LeaveStatus;
  createdAt: string;
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  attachments?: LeaveAttachment[];
};

const normalizeStatus = (status: string): LeaveStatus => {
  if (status === "approved") return "approved";
  if (status === "denied" || status === "rejected") return "denied";
  return "pending";
};

const toAttachmentUrl = (filePath: string) => {
  if (!filePath) return "#";
  if (filePath.startsWith("http")) return filePath;
  return `http://localhost:5000/${filePath.replace(/^\/+/, "")}`;
};

export default function MyRequests() {
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "all">("all");

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const res = await getMyLeaves();
        const data = (res.data ?? []).map((item: any) => ({
          id: item?._id ?? "",
          reason: item?.reason ?? "other",
          description: item?.description ?? "",
          startDate: item?.startDate ?? item?.createdAt,
          endDate: item?.endDate ?? item?.startDate ?? item?.createdAt,
          startTime: item?.startTime ?? "--:--",
          endTime: item?.endTime ?? "--:--",
          status: normalizeStatus(item?.status),
          createdAt: item?.createdAt ?? new Date().toISOString(),
          reviewNote: item?.reviewNote,
          reviewedBy: item?.reviewedBy?.fullName,
          reviewedAt: item?.reviewedAt,
          attachments: (item?.attachments ?? []).map((attachment: any) => ({
            originalName: attachment?.originalName ?? "Attachment",
            filePath: attachment?.filePath ?? "",
          })),
        }));
        setRequests(data);
      } catch (err) {
        console.error("Failed to fetch leave requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "denied":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      pending: "bg-warning/20 text-warning border-warning/30",
      approved: "bg-success/20 text-success border-success/30",
      denied: "bg-destructive/20 text-destructive border-destructive/30",
    };

    return (
      <Badge variant="outline" className={`capitalize ${config[status]}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  return (
    <AppLayout title="My Requests">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Leave Request History</CardTitle>
            <CardDescription>
              View and track all your submitted leave requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as LeaveStatus | "all")}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
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
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Loading requests...
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">
                            {format(parseISO(request.startDate), "MMM d, yyyy")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.startTime} - {request.endTime}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{request.reason}</TableCell>
                        <TableCell>
                          {request.startDate === request.endDate
                            ? "1 day"
                            : `${format(parseISO(request.startDate), "MMM d")} - ${format(parseISO(request.endDate), "MMM d")}`}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Leave Request Details</DialogTitle>
                                <DialogDescription>
                                  Submitted on {format(parseISO(request.createdAt), "PPP")}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Status</span>
                                  {getStatusBadge(request.status)}
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Reason</span>
                                  <span className="capitalize font-medium">{request.reason}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Date</span>
                                  <span className="font-medium">
                                    {format(parseISO(request.startDate), "MMM d, yyyy")}
                                    {request.startDate !== request.endDate && (
                                      <> - {format(parseISO(request.endDate), "MMM d, yyyy")}</>
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Time</span>
                                  <span className="font-medium">{request.startTime} - {request.endTime}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block mb-2">Description</span>
                                  <p className="text-sm bg-muted p-3 rounded-lg">{request.description}</p>
                                </div>
                                {request.attachments && request.attachments.length > 0 && (
                                  <div>
                                    <span className="text-muted-foreground block mb-2">Attachments</span>
                                    <div className="space-y-1">
                                      {request.attachments.map((attachment, index) => (
                                        <a
                                          key={`${attachment.filePath}-${index}`}
                                          href={toAttachmentUrl(attachment.filePath)}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-sm text-primary hover:underline block"
                                        >
                                          {attachment.originalName}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {request.reviewNote && (
                                  <div>
                                    <span className="text-muted-foreground block mb-2">HR Notes</span>
                                    <p className="text-sm bg-muted p-3 rounded-lg">{request.reviewNote}</p>
                                    {request.reviewedBy && request.reviewedAt && (
                                      <p className="text-xs text-muted-foreground mt-2">
                                        Reviewed by {request.reviewedBy} on {format(parseISO(request.reviewedAt), "PPP")}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No requests found
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
