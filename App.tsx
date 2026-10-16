import React, { useState, useEffect, useMemo } from 'react';
import { TabType, Student, Group, AppSettings, UserAuth } from './types';
import { AppStore } from './utils/storage';
import { calculateStudentBilling } from './utils/billing';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { StudentsScreen } from './components/students/StudentsScreen';
import { SessionsScreen } from './components/sessions/SessionsScreen';
import { ReportsScreen } from './components/reports/ReportsScreen';
import { GroupsScreen } from './components/groups/GroupsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { AuthModal } from './components/auth/AuthModal';
import { AddEditStudentModal } from './components/students/AddEditStudentModal';
import { StudentDetailModal } from './components/students/StudentDetailModal';
import { PaymentModal } from './components/payment/PaymentModal';
import { WhatsAppQueueModal } from './components/whatsapp/WhatsAppQueueModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [auth, setAuth] = useState<UserAuth>(AppStore.getAuth());
  const [settings, setSettings] = useState<AppSettings>(AppStore.getSettings());
  const [groups, setGroups] = useState<Group[]>(AppStore.getGroups());
  const [students, setStudents] = useState<Student[]>(AppStore.getStudents());

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Payment modal state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentStudentId, setPaymentStudentId] = useState<string | undefined>(undefined);

  // WhatsApp queue modal state
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppStudentsList, setWhatsAppStudentsList] = useState<Student[]>([]);

  // Reload data on custom store events
  const reloadData = () => {
    setGroups(AppStore.getGroups());
    setStudents(AppStore.getStudents());
    setSettings(AppStore.getSettings());
    setAuth(AppStore.getAuth());
  };

  useEffect(() => {
    const handleStoreUpdate = () => {
      reloadData();
    };
    window.addEventListener('math_tutor_store_update', handleStoreUpdate);
    return () => window.removeEventListener('math_tutor_store_update', handleStoreUpdate);
  }, []);

  // Compute late students for badges & queues
  const lateStudents = useMemo(() => {
    const payments = AppStore.getPayments();
    const attendances = AppStore.getAttendance();

    return students.filter((s) => {
      const grp = groups.find((g) => g.id === s.groupId);
      const billing = calculateStudentBilling(s, grp, payments, attendances, {
        dueDayOfMonth: settings.dueDayOfMonth,
      });
      return billing.status === 'late' || (billing.remainingBalance > 0 && billing.status !== 'paid');
    });
  }, [students, groups, settings.dueDayOfMonth]);

  // Handle student actions
  const handleSaveStudent = (newStudent: Student) => {
    const exists = students.some((s) => s.id === newStudent.id);
    let updated: Student[];
    if (exists) {
      updated = students.map((s) => (s.id === newStudent.id ? newStudent : s));
    } else {
      updated = [newStudent, ...students];
    }
    AppStore.setStudents(updated);
    setStudents(updated);
    if (selectedStudentDetail?.id === newStudent.id) {
      setSelectedStudentDetail(newStudent);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = students.filter((s) => s.id !== studentId);
    AppStore.setStudents(updated);
    setStudents(updated);
    if (selectedStudentDetail?.id === studentId) {
      setSelectedStudentDetail(null);
    }
  };

  // Groups handlers
  const handleSaveGroup = (group: Group) => {
    const exists = groups.some((g) => g.id === group.id);
    let updated: Group[];
    if (exists) {
      updated = groups.map((g) => (g.id === group.id ? group : g));
    } else {
      updated = [...groups, group];
    }
    AppStore.setGroups(updated);
    setGroups(updated);
  };

  const handleDeleteGroup = (groupId: string) => {
    const updated = groups.filter((g) => g.id !== groupId);
    AppStore.setGroups(updated);
    setGroups(updated);
  };

  // Open single student WhatsApp
  const handleOpenStudentWhatsApp = (student: Student) => {
    setWhatsAppStudentsList([student]);
    setIsWhatsAppModalOpen(true);
  };

  // Open late queue
  const handleOpenWhatsAppQueue = () => {
    if (lateStudents.length === 0) return;
    setWhatsAppStudentsList(lateStudents);
    setIsWhatsAppModalOpen(true);
  };

  // Open payment for specific student
  const handleOpenPaymentForStudent = (studentId?: string) => {
    setPaymentStudentId(studentId);
    setIsPaymentOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Ambient background blur elements for iOS Liquid Glass refraction */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-indigo-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main app container */}
      <div className="max-w-2xl mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <Header
          auth={auth}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* View Content based on activeTab */}
        <main className="flex-1 px-4">
          {activeTab === 'home' && (
            <HomeScreen
              students={students}
              groups={groups}
              settings={settings}
              onNavigateTab={setActiveTab}
              onSelectStudent={setSelectedStudentDetail}
              onOpenAddStudent={() => {
                setStudentToEdit(null);
                setIsAddStudentOpen(true);
              }}
              onOpenPaymentModal={handleOpenPaymentForStudent}
              onOpenWhatsAppModal={handleOpenStudentWhatsApp}
              onOpenWhatsAppQueue={handleOpenWhatsAppQueue}
            />
          )}

          {activeTab === 'students' && (
            <StudentsScreen
              students={students}
              groups={groups}
              settings={settings}
              onSelectStudent={setSelectedStudentDetail}
              onOpenAddStudent={() => {
                setStudentToEdit(null);
                setIsAddStudentOpen(true);
              }}
              onOpenEditStudent={(s) => {
                setStudentToEdit(s);
                setIsAddStudentOpen(true);
              }}
              onOpenPaymentModal={handleOpenPaymentForStudent}
              onOpenWhatsAppModal={handleOpenStudentWhatsApp}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionsScreen
              groups={groups}
              students={students}
              settings={settings}
              onAttendanceSaved={reloadData}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsScreen
              groups={groups}
              students={students}
              settings={settings}
            />
          )}

          {activeTab === 'groups' && (
            <GroupsScreen
              groups={groups}
              students={students}
              settings={settings}
              onSaveGroup={handleSaveGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              settings={settings}
              auth={auth}
              onUpdateSettings={(newSettings) => {
                AppStore.setSettings(newSettings);
                setSettings(newSettings);
              }}
              onUpdateAuth={(newAuth) => {
                AppStore.setAuth(newAuth);
                setAuth(newAuth);
              }}
              onResetData={() => {
                AppStore.resetToDemo();
                reloadData();
              }}
              onClearData={() => {
                AppStore.clearAllData();
                reloadData();
              }}
            />
          )}
        </main>

        {/* Bottom Floating Glass Tab Bar */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          lateStudentsCount={lateStudents.length}
        />
      </div>

      {/* MODALS */}
      {/* 1. Auth Modal */}
      <AuthModal
        auth={auth}
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(newAuth) => {
          setAuth(newAuth);
          setIsAuthOpen(false);
        }}
      />

      {/* 2. Add / Edit Student Modal */}
      <AddEditStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => {
          setIsAddStudentOpen(false);
          setStudentToEdit(null);
        }}
        studentToEdit={studentToEdit}
        groups={groups}
        settings={settings}
        onSave={handleSaveStudent}
      />

      {/* 3. Student Details Modal */}
      <StudentDetailModal
        isOpen={!!selectedStudentDetail}
        onClose={() => setSelectedStudentDetail(null)}
        student={selectedStudentDetail}
        groups={groups}
        settings={settings}
        onRecordPayment={(sId) => {
          setSelectedStudentDetail(null);
          handleOpenPaymentForStudent(sId);
        }}
        onSendWhatsApp={(s) => {
          handleOpenStudentWhatsApp(s);
        }}
        onEditStudent={(s) => {
          setSelectedStudentDetail(null);
          setStudentToEdit(s);
          setIsAddStudentOpen(true);
        }}
        onDeleteStudent={(sId) => {
          handleDeleteStudent(sId);
        }}
      />

      {/* 4. Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setPaymentStudentId(undefined);
        }}
        studentId={paymentStudentId}
        students={students}
        groups={groups}
        settings={settings}
        onPaymentSuccess={reloadData}
      />

      {/* 5. WhatsApp Late-Payment Modal / Queue */}
      <WhatsAppQueueModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        students={whatsAppStudentsList}
        groups={groups}
        settings={settings}
      />
    </div>
  );
}
