import { Group, Student, AttendanceRecord, PaymentRecord, UserAuth, AppSettings } from '../types';

const STORAGE_KEYS = {
  AUTH: 'math_tutor_auth_v1',
  GROUPS: 'math_tutor_groups_v1',
  STUDENTS: 'math_tutor_students_v1',
  ATTENDANCE: 'math_tutor_attendance_v1',
  PAYMENTS: 'math_tutor_payments_v1',
  SETTINGS: 'math_tutor_settings_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  teacherName: 'أ/ إبراهيم النجار',
  subjectTitle: 'مدرس أول رياضيات',
  currency: 'ج.م',
  dueDayOfMonth: 5,
  defaultTone: 'friendly',
  customTemplates: {
    friendly: `السلام عليكم يا أستاذ/ة {parent}، تحياتي لحضرتك 🌷\nتذكير لطيف بخصوص اشتراك الطالب {student} عن شهر {month}.\nالمبلغ المستحق: {amount} ج.م (عن {sessions} حصة).\nلو تم التحويل برجاء إرسال الإشعار، ولو تم الدفع نرجو تجاهل الرسالة 🌸\nخالص التقدير — {teacher}`,
    formal: `تحية طيبة، أستاذ/ة {parent} المحترم،\nنحيط سيادتكم علماً بأن اشتراك الرياضيات الخاص بالطالب: {student} عن دورة شهر {month} مستحق السداد.\nقيمة الاشتراك المطلوب: {amount} جنيه مصري.\nتاريخ الاستحقاق: {due_date}.\nشاكرين ومقدرين حسن تعاونكم الدائم.\nمكتب الأستاذ: {teacher}`,
    firm: `تنبيه هام ومستعجل | أستاذ/ة {parent}\nنود التذكير بضرورة سرعة سداد الرسوم المتأخرة لاشتراك الطالب {student} عن شهر {month}.\nالمبلغ المتبقي: {amount} جنيه مصري ({sessions} حصص).\nنرجو السداد قبل موعد الحصة القادمة لتأكيد استمرار مقعد الطالب في المجموعة.\nللتواصل والتأكيد: {teacher}`,
  },
};

export const DEFAULT_AUTH: UserAuth = {
  isLoggedIn: true, // Start logged in with demo profile, but teacher can logout/test auth flow anytime!
  teacherName: 'أ/ إبراهيم النجار',
  assistantName: 'أحمد المساعد',
  subject: 'رياضيات ثانوية وإعدادية',
  phone: '01012345678',
  recoveryCode: 'MATH-2026-X9',
  pin: '1234',
};

// Initial realistic demo groups
export const DEMO_GROUPS: Group[] = [
  {
    id: 'grp_1',
    name: 'تانية ثانوي - تفاضل وحساب مثلثات',
    grade: 'الصف الثاني الثانوي',
    monthlyFee: 400,
    sessionDays: [0, 3], // الأحد والأربعاء
    sessionTime: '16:30',
    sessionsPerCycle: 8,
    color: '#2F5BEA',
  },
  {
    id: 'grp_2',
    name: 'تالتة إعدادي - جبر وهندسة',
    grade: 'الصف الثالث الإعدادي',
    monthlyFee: 350,
    sessionDays: [1, 4], // الاثنين والخميس
    sessionTime: '18:00',
    sessionsPerCycle: 8,
    color: '#0D9488',
  },
];

// Initial realistic demo students (6 students with varied scenarios)
export const DEMO_STUDENTS: Student[] = [
  {
    id: 'stu_1',
    name: 'يوسف أحمد عبد العزيز',
    studentPhone: '01012345671',
    parentPhone: '01155443321',
    groupId: 'grp_1',
    subscriptionType: 'monthly',
    joinDate: '2026-10-01',
    cycleStartDate: '2026-10-01',
    notes: 'ممتاز في حساب المثلثات، يفضل المتابعة مع والده',
    avatarSeed: 'youssef',
  },
  {
    id: 'stu_2',
    name: 'مريم محمود الشناوي',
    studentPhone: '01233445566',
    parentPhone: '01099887766',
    groupId: 'grp_1',
    subscriptionType: 'monthly',
    joinDate: '2026-10-01',
    cycleStartDate: '2026-10-01',
    notes: 'غياب حصة واحدة بعذر وتم خصمها',
    avatarSeed: 'mariam',
  },
  {
    id: 'stu_3',
    name: 'عمر خالد الصاوي',
    studentPhone: '01511223344',
    parentPhone: '01122334455',
    groupId: 'grp_1',
    subscriptionType: 'monthly',
    joinDate: '2026-10-01',
    cycleStartDate: '2026-10-01',
    notes: 'دفع نصف المبلغ ومتبقي النصف الآخر',
    avatarSeed: 'omar',
  },
  {
    id: 'stu_4',
    name: 'سارة طارق المهدي',
    studentPhone: '01099881122',
    parentPhone: '01222333444',
    groupId: 'grp_2',
    subscriptionType: 'monthly',
    joinDate: '2026-10-01',
    cycleStartDate: '2026-10-01',
    notes: 'دفعت الاشتراك كاملاً نقداً أول الشهر',
    avatarSeed: 'sara',
  },
  {
    id: 'stu_5',
    name: 'زياد إيهاب مصطفى',
    studentPhone: '01144556677',
    parentPhone: '01088776655',
    groupId: 'grp_2',
    subscriptionType: 'monthly',
    joinDate: '2026-10-01',
    cycleStartDate: '2026-10-01',
    notes: 'انضم بمنتصف الشهر مع حساب الحصص المتبقية',
    avatarSeed: 'ziad',
  },
  {
    id: 'stu_6',
    name: 'نور الدين كريم السعدني',
    studentPhone: '01288990011',
    parentPhone: '01177665544',
    groupId: 'grp_2',
    subscriptionType: 'monthly',
    joinDate: '2026-10-01',
    cycleStartDate: '2026-10-01',
    notes: 'متأخر عن السداد ويحتاج تذكير واتساب',
    avatarSeed: 'nour',
  },
];

// Demo payments
export const DEMO_PAYMENTS: PaymentRecord[] = [
  // stu_1: Paid full 400
  {
    id: 'pay_1',
    studentId: 'stu_1',
    amount: 400,
    date: '2026-10-02',
    method: 'instapay',
    note: 'تحويل إنستاباي من والد الطالب',
  },
  // stu_3: Paid partial 200 of 400
  {
    id: 'pay_2',
    studentId: 'stu_3',
    amount: 200,
    date: '2026-10-04',
    method: 'cash',
    note: 'دفعة أولى 200 نقداً',
  },
  // stu_4: Paid full 350
  {
    id: 'pay_3',
    studentId: 'stu_4',
    amount: 350,
    date: '2026-10-01',
    method: 'vodafone_cash',
    note: 'فودافون كاش',
  },
];

// Demo attendance with 1 deduction
export const DEMO_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_1',
    sessionId: 'sess_1',
    groupId: 'grp_1',
    date: '2026-10-04',
    studentId: 'stu_2',
    status: 'absent',
    absenceAction: 'deduct', // deducts 50 EGP!
    note: 'ظرف صحي بعذر - تم الخصم',
  },
  {
    id: 'att_2',
    sessionId: 'sess_1',
    groupId: 'grp_1',
    date: '2026-10-04',
    studentId: 'stu_1',
    status: 'present',
  },
  {
    id: 'att_3',
    sessionId: 'sess_1',
    groupId: 'grp_1',
    date: '2026-10-04',
    studentId: 'stu_3',
    status: 'present',
  },
];

// Helpers to get and set
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for real-time sync across components
    window.dispatchEvent(new CustomEvent('math_tutor_store_update', { detail: { key } }));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

// App data repository
export const AppStore = {
  getAuth(): UserAuth {
    return loadFromStorage(STORAGE_KEYS.AUTH, DEFAULT_AUTH);
  },
  setAuth(auth: UserAuth) {
    saveToStorage(STORAGE_KEYS.AUTH, auth);
  },

  getGroups(): Group[] {
    const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (!data) {
      saveToStorage(STORAGE_KEYS.GROUPS, DEMO_GROUPS);
      return DEMO_GROUPS;
    }
    return JSON.parse(data);
  },
  setGroups(groups: Group[]) {
    saveToStorage(STORAGE_KEYS.GROUPS, groups);
  },

  getStudents(): Student[] {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!data) {
      saveToStorage(STORAGE_KEYS.STUDENTS, DEMO_STUDENTS);
      return DEMO_STUDENTS;
    }
    return JSON.parse(data);
  },
  setStudents(students: Student[]) {
    saveToStorage(STORAGE_KEYS.STUDENTS, students);
  },

  getAttendance(): AttendanceRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!data) {
      saveToStorage(STORAGE_KEYS.ATTENDANCE, DEMO_ATTENDANCE);
      return DEMO_ATTENDANCE;
    }
    return JSON.parse(data);
  },
  setAttendance(records: AttendanceRecord[]) {
    saveToStorage(STORAGE_KEYS.ATTENDANCE, records);
  },

  getPayments(): PaymentRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!data) {
      saveToStorage(STORAGE_KEYS.PAYMENTS, DEMO_PAYMENTS);
      return DEMO_PAYMENTS;
    }
    return JSON.parse(data);
  },
  setPayments(payments: PaymentRecord[]) {
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
  },

  getSettings(): AppSettings {
    return loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  setSettings(settings: AppSettings) {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  },

  resetToDemo() {
    saveToStorage(STORAGE_KEYS.GROUPS, DEMO_GROUPS);
    saveToStorage(STORAGE_KEYS.STUDENTS, DEMO_STUDENTS);
    saveToStorage(STORAGE_KEYS.ATTENDANCE, DEMO_ATTENDANCE);
    saveToStorage(STORAGE_KEYS.PAYMENTS, DEMO_PAYMENTS);
    saveToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  clearAllData() {
    saveToStorage(STORAGE_KEYS.GROUPS, []);
    saveToStorage(STORAGE_KEYS.STUDENTS, []);
    saveToStorage(STORAGE_KEYS.ATTENDANCE, []);
    saveToStorage(STORAGE_KEYS.PAYMENTS, []);
  },

  exportBackupJSON(): string {
    const fullBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      auth: this.getAuth(),
      groups: this.getGroups(),
      students: this.getStudents(),
      attendance: this.getAttendance(),
      payments: this.getPayments(),
      settings: this.getSettings(),
    };
    return JSON.stringify(fullBackup, null, 2);
  },

  importBackupJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.groups) this.setGroups(data.groups);
      if (data.students) this.setStudents(data.students);
      if (data.attendance) this.setAttendance(data.attendance);
      if (data.payments) this.setPayments(data.payments);
      if (data.settings) this.setSettings(data.settings);
      if (data.auth) this.setAuth(data.auth);
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON:', e);
      return false;
    }
  },
};
