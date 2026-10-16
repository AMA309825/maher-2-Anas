/**
 * Pure billing & phone formatting logic for Math Tutor Student Subscriptions
 */

export interface Group {
  id: string;
  name: string;
  grade: string;
  monthlyFee: number;
  sessionDays: number[]; // 0: Sunday, 1: Monday, ... 6: Saturday
  sessionTime: string; // "16:00"
  sessionsPerCycle: number; // default: sessionDays.length * 4
}

export type AbsenceAction = 'deduct' | 'credit';

export interface AbsenceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  date: string; // YYYY-MM-DD
  reason?: string;
  action: AbsenceAction; // 'deduct' from current month or 'credit'
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  method?: 'cash' | 'vodafone_cash' | 'instapay' | 'bank';
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
  cycleTotalSessions?: number; // for fixed_course
  customFee?: number; // override group fee if any
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
  absenceAction?: AbsenceAction;
  note?: string;
}

export interface BillingCalculation {
  baseFee: number;
  sessionsPerCycle: number;
  pricePerSession: number;
  isMidCycle: boolean;
  totalCycleSessions: number;
  remainingSessions: number;
  deductedAbsencesCount: number;
  creditAbsencesCount: number;
  deductedAmount: number;
  amountDueBeforeDeductions: number;
  finalAmountDue: number;
  totalPaid: number;
  remainingBalance: number;
  status: 'paid' | 'partial' | 'late' | 'due_soon' | 'active' | 'ended';
  statusLabelAr: string;
  statusColor: string;
}

/**
 * Formats an Egyptian phone number for WhatsApp wa.me links
 * e.g., 01012345678 -> 201012345678
 * Handles cleanups, spaces, dashes, leading pluses
 */
export function formatEgyptianPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return '';

  // If starts with 20 and has 12 digits (201012345678)
  if (digits.startsWith('20') && digits.length === 12) {
    return digits;
  }
  // If starts with 01 and has 11 digits (01012345678)
  if (digits.startsWith('01') && digits.length === 11) {
    return '2' + digits;
  }
  // If starts with 1 and has 10 digits (1012345678)
  if (digits.startsWith('1') && digits.length === 10) {
    return '20' + digits;
  }
  // If already full international number without + (e.g. 201...)
  if (digits.length >= 11) {
    return digits;
  }
  return digits;
}

/**
 * Calculates session price and amount due for a student
 */
export function calculateStudentBilling(
  student: Student,
  group: Group | undefined,
  payments: PaymentRecord[],
  attendances: AttendanceRecord[],
  settings: { dueDayOfMonth: number; currentMonthName?: string } = { dueDayOfMonth: 5 }
): BillingCalculation {
  const baseFee = student.customFee ?? (group?.monthlyFee ?? 0);
  const sessionsPerCycle = Math.max(1, student.subscriptionType === 'fixed_course'
    ? (student.cycleTotalSessions || 8)
    : (group?.sessionsPerCycle || (group ? group.sessionDays.length * 4 : 8))
  );

  const pricePerSession = Math.round((baseFee / sessionsPerCycle) * 100) / 100;

  // Absences for this student
  const studentAttendances = attendances.filter(a => a.studentId === student.id);
  const deductedAbsences = studentAttendances.filter(a => a.status === 'absent' && a.absenceAction === 'deduct');
  const creditAbsences = studentAttendances.filter(a => a.status === 'absent' && a.absenceAction === 'credit');

  const deductedAbsencesCount = deductedAbsences.length;
  const creditAbsencesCount = creditAbsences.length;

  // Check mid-cycle join:
  // If student joined after cycleStartDate, calculate how many sessions remain in cycle
  let remainingSessions = sessionsPerCycle;
  let isMidCycle = false;

  // Let's compute remaining sessions if join date is specified
  if (student.joinDate && student.cycleStartDate && student.joinDate > student.cycleStartDate) {
    isMidCycle = true;
    // Simple estimation if explicit days: calculate session dates or default ratio
    // If sessions attended + remaining in cycle
    const join = new Date(student.joinDate);
    const cycleStart = new Date(student.cycleStartDate);
    const diffTime = Math.abs(join.getTime() - cycleStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Standard cycle is ~30 days. Estimated missed before joining:
    const missedBeforeJoin = Math.min(sessionsPerCycle - 1, Math.floor((diffDays / 30) * sessionsPerCycle));
    remainingSessions = Math.max(1, sessionsPerCycle - missedBeforeJoin);
  }

  const amountDueBeforeDeductions = Math.round(remainingSessions * pricePerSession);
  const deductedAmount = Math.round(deductedAbsencesCount * pricePerSession);
  const finalAmountDue = Math.max(0, amountDueBeforeDeductions - deductedAmount);

  const totalPaid = payments
    .filter(p => p.studentId === student.id)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const remainingBalance = Math.max(0, finalAmountDue - totalPaid);

  // Determine status
  const now = new Date();
  const currentDay = now.getDate();
  const dueDay = settings.dueDayOfMonth;

  let status: BillingCalculation['status'] = 'active';
  let statusLabelAr = 'نشط';
  let statusColor = 'text-blue-600 bg-blue-50 border-blue-200';

  if (student.statusOverride && student.statusOverride !== 'auto') {
    status = student.statusOverride;
  } else if (remainingBalance <= 0 && totalPaid > 0) {
    status = 'paid';
    statusLabelAr = 'تم الدفع بالكامل';
    statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (totalPaid > 0 && remainingBalance > 0) {
    status = 'partial';
    statusLabelAr = 'دفع جزئي';
    statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (currentDay > dueDay && remainingBalance > 0) {
    status = 'late';
    statusLabelAr = 'متأخر عن السداد';
    statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (currentDay >= dueDay - 3 && currentDay <= dueDay && remainingBalance > 0) {
    status = 'due_soon';
    statusLabelAr = 'مستحق قريباً';
    statusColor = 'text-amber-600 bg-amber-50 border-amber-200';
  } else {
    status = 'active';
    statusLabelAr = 'نشط / ساري';
    statusColor = 'text-blue-600 bg-blue-50 border-blue-200';
  }

  return {
    baseFee,
    sessionsPerCycle,
    pricePerSession,
    isMidCycle,
    totalCycleSessions: sessionsPerCycle,
    remainingSessions,
    deductedAbsencesCount,
    creditAbsencesCount,
    deductedAmount,
    amountDueBeforeDeductions,
    finalAmountDue,
    totalPaid,
    remainingBalance,
    status,
    statusLabelAr,
    statusColor,
  };
}

/**
 * Message template generator with 3 tones (Friendly, Formal, Firm)
 */
export type WhatsAppTone = 'friendly' | 'formal' | 'firm';

export interface WhatsAppTemplateOptions {
  studentName: string;
  parentName?: string;
  amount: number;
  monthName: string;
  sessionsCount: number;
  teacherName: string;
  dueDateStr: string;
  tone: WhatsAppTone;
  customTemplate?: string;
}

export function buildWhatsAppMessage(opts: WhatsAppTemplateOptions): string {
  const parent = opts.parentName?.trim() || 'ولي أمر الطالب';
  const student = opts.studentName;
  const amount = opts.amount;
  const month = opts.monthName;
  const sessions = opts.sessionsCount;
  const teacher = opts.teacherName;
  const dueDate = opts.dueDateStr;

  if (opts.customTemplate) {
    return opts.customTemplate
      .replace(/{student}/g, student)
      .replace(/{parent}/g, parent)
      .replace(/{amount}/g, String(amount))
      .replace(/{month}/g, month)
      .replace(/{sessions}/g, String(sessions))
      .replace(/{teacher}/g, teacher)
      .replace(/{due_date}/g, dueDate);
  }

  switch (opts.tone) {
    case 'friendly':
      return `السلام عليكم يا أستاذ/ة ${parent}، تحياتي لحضرتك 🌷\nتذكير لطيف بخصوص اشتراك الطالب ${student} عن شهر ${month}.\nالمبلغ المستحق: ${amount} ج.م (عن ${sessions} حصة).\nلو تم التحويل برجاء إرسال الإشعار، ولو تم الدفع نرجو تجاهل الرسالة 🌸\nخالص التقدير — ${teacher}`;

    case 'formal':
      return `تحية طيبة، أستاذ/ة ${parent} المحترم،\nنحيط سيادتكم علماً بأن اشتراك الرياضيات الخاص بالطالب: ${student} عن دورة شهر ${month} مستحق السداد.\nقيمة الاشتراك المطلوب: ${amount} جنيه مصري.\nتاريخ الاستحقاق: ${dueDate}.\nشاكرين ومقدرين حسن تعاونكم الدائم.\nمكتب الأستاذ: ${teacher}`;

    case 'firm':
      return `تنبيه هام ومستعجل | أستاذ/ة ${parent}\nنود التذكير بضرورة سرعة سداد الرسوم المتأخرة لاشتراك الطالب ${student} عن شهر ${month}.\nالمبلغ المتبقي: ${amount} جنيه مصري (${sessions} حصص).\nنرجو السداد قبل موعد الحصة القادمة لتأكيد استمرار مقعد الطالب في المجموعة.\nللتواصل والتأكيد: ${teacher}`;

    default:
      return `السلام عليكم، تذكير باشتراك ${student} بقيمة ${amount} ج.م — ${teacher}`;
  }
}
