export type TabType = 'home' | 'students' | 'sessions' | 'reports' | 'groups' | 'settings';

export type WhatsAppTone = 'friendly' | 'formal' | 'firm';

export type AbsenceAction = 'deduct' | 'credit';

export interface Group {
  id: string;
  name: string;
  grade: string;
  monthlyFee: number;
  sessionDays: number[]; // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  sessionTime: string; // "16:30"
  sessionsPerCycle: number; // e.g. 8
  color?: string;
}

export interface Student {
  id: string;
  name: string;
  studentPhone: string;
  parentPhone: string;
  groupId: string;
  subscriptionType: 'monthly' | 'fixed_course';
  joinDate: string; // YYYY-MM-DD
  cycleStartDate: string; // YYYY-MM-DD
  cycleTotalSessions?: number;
  customFee?: number;
  notes?: string;
  avatarSeed?: string;
  statusOverride?: 'active' | 'late' | 'ended' | 'auto';
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: 'present' | 'absent';
  absenceAction?: AbsenceAction; // 'deduct' from amount due or 'credit'
  note?: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  method?: 'cash' | 'vodafone_cash' | 'instapay' | 'bank';
}

export interface UserAuth {
  isLoggedIn: boolean;
  teacherName: string;
  assistantName?: string;
  subject: string;
  phone: string;
  recoveryCode: string;
  pin: string;
}

export interface AppSettings {
  teacherName: string;
  subjectTitle: string;
  currency: string;
  dueDayOfMonth: number;
  defaultTone: WhatsAppTone;
  customTemplates: {
    friendly: string;
    formal: string;
    firm: string;
  };
}
