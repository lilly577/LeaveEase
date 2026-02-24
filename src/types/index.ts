export type UserRole = 'staff' | 'hr_admin' | 'super_admin' | 'hr';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  location?: string;
  avatar?: string;
}

export type LeaveStatus = 'pending' | 'approved' | 'denied';

export type LeaveReason = 'illness' | 'funeral' | 'emergency' | 'personal' | 'other';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  department: string;
  reason: LeaveReason;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: LeaveStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  currentStage?: 'hr_pending' | 'completed' | 'escalated';
  slaDueAt?: string;
  escalatedAt?: string;
  escalationReason?: string;
  hrApproval?: {
    status: 'pending' | 'approved' | 'denied';
    actedBy?: string;
    actedAt?: string;
    note?: string;
  };
}

export interface OffDay {
  id: string;
  userId: string;
  userName: string;
  date: string;
  type: 'scheduled' | 'approved_leave';
  note?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  isAnonymous: boolean;
  createdAt: string;
  isRead: boolean;
}
