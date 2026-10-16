import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatEgyptianPhoneForWhatsApp,
  calculateStudentBilling,
  buildWhatsAppMessage,
  type Student,
  type Group,
  type PaymentRecord,
  type AttendanceRecord,
} from './billing.ts';

test('formatEgyptianPhoneForWhatsApp formats Egyptian mobile numbers correctly', () => {
  // Test starting with 01
  assert.equal(formatEgyptianPhoneForWhatsApp('01012345678'), '201012345678');
  assert.equal(formatEgyptianPhoneForWhatsApp('01198765432'), '201198765432');
  assert.equal(formatEgyptianPhoneForWhatsApp('012-345-67890'), '201234567890');
  assert.equal(formatEgyptianPhoneForWhatsApp('015 11223344'), '201511223344');

  // Test already has 20 prefix
  assert.equal(formatEgyptianPhoneForWhatsApp('+201012345678'), '201012345678');
  assert.equal(formatEgyptianPhoneForWhatsApp('201012345678'), '201012345678');
});

test('calculateStudentBilling calculates price per session and full payment balance', () => {
  const group: Group = {
    id: 'g1',
    name: 'تانية ثانوي - لغات',
    grade: 'الصف الثاني الثانوي',
    monthlyFee: 400,
    sessionDays: [0, 3], // 2 days a week
    sessionTime: '16:00',
    sessionsPerCycle: 8,
  };

  const student: Student = {
    id: 's1',
    name: 'أحمد محمود',
    studentPhone: '01012345678',
    parentPhone: '01198765432',
    groupId: 'g1',
    subscriptionType: 'monthly',
    joinDate: '2026-10-01',
    cycleStartDate: '2026-10-01',
  };

  const payments: PaymentRecord[] = [
    { id: 'p1', studentId: 's1', amount: 400, date: '2026-10-02' }
  ];

  const attendances: AttendanceRecord[] = [];

  const billing = calculateStudentBilling(student, group, payments, attendances, { dueDayOfMonth: 5 });

  assert.equal(billing.pricePerSession, 50); // 400 / 8 = 50
  assert.equal(billing.finalAmountDue, 400);
  assert.equal(billing.totalPaid, 400);
  assert.equal(billing.remainingBalance, 0);
  assert.equal(billing.status, 'paid');
});

test('calculateStudentBilling handles deducted absences according to prompt formula', () => {
  // Example from prompt:
  // "fee 400, 8 sessions = 50/session; joins with 5 sessions left = 250; one missed session deducted = 200."
  const group: Group = {
    id: 'g1',
    name: 'تالتة إعدادي',
    grade: 'الصف الثالث الإعدادي',
    monthlyFee: 400,
    sessionDays: [1, 4],
    sessionTime: '18:00',
    sessionsPerCycle: 8,
  };

  const student: Student = {
    id: 's2',
    name: 'سارة خالد',
    studentPhone: '01234567890',
    parentPhone: '01000000000',
    groupId: 'g1',
    subscriptionType: 'monthly',
    joinDate: '2026-10-01',
    cycleStartDate: '2026-10-01',
  };

  // 1 missed session with 'deduct'
  const attendances: AttendanceRecord[] = [
    {
      id: 'a1',
      sessionId: 'sess-1',
      groupId: 'g1',
      date: '2026-10-05',
      studentId: 's2',
      status: 'absent',
      absenceAction: 'deduct',
    },
    // Another session with 'credit' (carried over, not deducted from current amount due)
    {
      id: 'a2',
      sessionId: 'sess-2',
      groupId: 'g1',
      date: '2026-10-12',
      studentId: 's2',
      status: 'absent',
      absenceAction: 'credit',
    }
  ];

  const payments: PaymentRecord[] = [];

  const billing = calculateStudentBilling(student, group, payments, attendances, { dueDayOfMonth: 5 });

  assert.equal(billing.pricePerSession, 50);
  assert.equal(billing.deductedAbsencesCount, 1);
  assert.equal(billing.deductedAmount, 50);
  assert.equal(billing.creditAbsencesCount, 1);
  assert.equal(billing.finalAmountDue, 350); // 400 - 50 = 350
  assert.equal(billing.remainingBalance, 350);
});

test('buildWhatsAppMessage replaces variables correctly', () => {
  const message = buildWhatsAppMessage({
    studentName: 'يوسف شريف',
    parentName: 'شريف المهدي',
    amount: 350,
    monthName: 'أكتوبر',
    sessionsCount: 7,
    teacherName: 'م/ إبراهيم محمد',
    dueDateStr: '5 أكتوبر',
    tone: 'friendly',
  });

  assert.match(message, /يوسف شريف/);
  assert.match(message, /350/);
  assert.match(message, /أكتوبر/);
  assert.match(message, /إبراهيم محمد/);
});
