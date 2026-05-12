import React, { useState, useEffect } from 'react';
import { useAuthStore, Appointment } from '../store';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Loader2, Calendar, FileText, CheckCircle, XCircle, Clock, Store, User as UserIcon, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { TEST_LIBRARY } from '../lib/tests';
import { useNavigate } from 'react-router';

export default function Appointments() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<(Appointment & { testName?: string, relatedName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      try {
        let q;
        if (user.role === 'psychologist') {
          q = query(collection(db, 'appointments'), where('psychologistId', '==', user.uid));
        } else {
          q = query(collection(db, 'appointments'), where('patientId', '==', user.uid));
        }

        const snapshot = await getDocs(q);
        const loaded: (Appointment & { testName?: string, relatedName?: string })[] = [];
        
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data() as Appointment;
          
          let relatedName = 'غير معروف';
          try {
             if (user.role === 'psychologist') {
               // Prefer patientName from appointment, fallback to fetching user doc
               if (data.patientName) {
                 relatedName = data.patientName;
               } else {
                 const patientDoc = await getDoc(doc(db, 'users', data.patientId));
                 if (patientDoc.exists()) relatedName = patientDoc.data().displayName;
               }
             } else {
               // Fetch clinic name
               const clinicQ = query(collection(db, 'clinics'), where('psychologistId', '==', data.psychologistId));
               const cSnap = await getDocs(clinicQ);
               if (!cSnap.empty) relatedName = cSnap.docs[0].data().name;
             }
          } catch(e) { console.error('Error fetching name', e) }

          const testObj = data.testId ? TEST_LIBRARY.find(t => t.id === data.testId) : null;

          loaded.push({
            id: docSnap.id,
            patientId: data.patientId,
            psychologistId: data.psychologistId,
            patientName: data.patientName || '',
            patientPhone: data.patientPhone || '',
            testId: data.testId,
            date: data.date,
            status: data.status,
            notes: data.notes,
            createdAt: (data as any).createdAt?.toMillis() || Date.now(),
            testName: testObj ? testObj.nameAr : 'موعد استشارة عامة',
            relatedName
          });
        }
        
        setAppointments(loaded.sort((a,b) => b.createdAt - a.createdAt));
      } catch (err) {
        console.error('Error fetching appointments', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, navigate]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled', newDate?: string) => {
    try {
      setUpdatingId(appointmentId);
      const appRef = doc(db, 'appointments', appointmentId);
      
      const updates: any = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };
      
      if (newDate) {
        updates.date = newDate;
      }

      await updateDoc(appRef, updates);
      setAppointments(appointments.map(app => app.id === appointmentId ? { ...app, status: newStatus, date: newDate || app.date } : app));
      
      if (newStatus === 'confirmed') {
        setConfirmingId(null);
        setAppointmentDate('');
      }
    } catch (err) {
       handleFirestoreError(err, OperationType.UPDATE, `appointments/${appointmentId}`);
       alert('فشل تحديث حالة الموعد');
    } finally {
      setUpdatingId(null);
    }
  };

  const isCompletedAuto = (app: any) => {
    if (app.status === 'completed') return true;
    if (app.status === 'confirmed' && app.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const appDate = new Date(app.date);
      appDate.setHours(0, 0, 0, 0);
      return today.getTime() > appDate.getTime();
    }
    return false;
  };

  const getEffectiveStatus = (app: any) => {
    if (app.status === 'cancelled') return 'cancelled';
    if (isCompletedAuto(app)) return 'completed';
    return app.status;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />قيد الانتظار</span>;
      case 'confirmed': return <span className="bg-sky-500/10 text-sky-600 border border-sky-500/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />مؤكد</span>;
      case 'completed': return <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />مكتمل</span>;
      case 'cancelled': return <span className="bg-red-500/10 text-red-600 border border-red-500/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" />ملغي</span>;
      default: return null;
    }
  };

  const MONTHS = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'بانتظار تحديد موعد';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const dayName = DAYS[date.getDay()];
      const dayNum = date.getDate();
      const monthName = MONTHS[date.getMonth()];
      const year = date.getFullYear();

      return `${dayName} ${dayNum} ${monthName} ${year}`;
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto flex flex-col gap-6"
    >
      <header className="border-b border-border pb-4">
        <h2 className="text-2xl font-black text-ink flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          المواعيد
        </h2>
        <p className="text-ink3 mt-1 text-sm">متابعة المواعيد المسجلة في العيادة وعرض التفاصيل.</p>
      </header>

      {appointments.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-ink2">
          لا يوجد مواعيد سابقة أو حالية.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map(app => (
            <div key={app.id} className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-primary/30">
               <div className="space-y-3 flex-1">
                 <div className="flex justify-between items-start md:items-center">
                   <h3 className="text-lg font-bold text-ink">{app.testName}</h3>
                   {getStatusBadge(getEffectiveStatus(app))}
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-t border-border/50 pt-3">
                   <div className="flex items-center gap-2 text-ink2">
                     {user?.role === 'psychologist' ? <UserIcon className="w-4 h-4 text-primary shrink-0" /> : <Store className="w-4 h-4 text-primary shrink-0" />}
                     <span className="font-medium">{app.relatedName}</span>
                   </div>
                   <div className="flex items-center gap-2 text-ink2">
                     <Clock className="w-4 h-4 text-primary shrink-0" />
                     <span dir="rtl">{formatDate(app.date)}</span>
                   </div>
                   {app.patientPhone && user?.role === 'psychologist' && (
                     <div className="flex items-center gap-2 text-ink2">
                       <Phone className="w-4 h-4 text-primary shrink-0" />
                       <span dir="ltr">{app.patientPhone}</span>
                     </div>
                   )}
                 </div>

                 {app.notes && (
                   <div className="bg-paper p-3 rounded-lg border border-border mt-3 text-sm text-ink3 flex items-start gap-2">
                     <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                     <p>{app.notes}</p>
                   </div>
                 )}
               </div>

               {/* Actions container based on role and status */}
               <div className="flex flex-row md:flex-col gap-2 shrink-0 md:min-w-[120px]">
                 {user?.role === 'psychologist' && getEffectiveStatus(app) === 'pending' && (
                    <>
                       {confirmingId === app.id ? (
                          <div className="flex flex-col gap-2 w-full md:w-auto">
                            <input 
                              type="date" 
                              min={new Date().toISOString().split('T')[0]}
                              value={appointmentDate}
                              onChange={(e) => setAppointmentDate(e.target.value)}
                              className="w-full bg-paper border border-border rounded py-1.5 px-2 text-ink text-sm focus:ring-1 focus:ring-primary"
                            />
                            <div className="flex gap-1">
                              <button onClick={() => {
                                if(!appointmentDate) { alert('حدد الموعد أولاً'); return; }
                                handleUpdateStatus(app.id, 'confirmed', appointmentDate);
                              }} disabled={updatingId === app.id} className="flex-1 bg-primary text-paper px-2 py-1.5 rounded text-xs font-bold hover:bg-primary-light transition-colors">
                                حفظ
                              </button>
                              <button onClick={() => setConfirmingId(null)} className="flex-1 bg-surface-hover text-ink2 px-2 py-1.5 rounded text-xs font-bold transition-colors">
                                إلغاء
                              </button>
                            </div>
                          </div>
                       ) : (
                          <>
                             <button onClick={() => setConfirmingId(app.id)} disabled={updatingId === app.id || confirmingId !== null} className="flex-1 bg-primary text-paper px-3 py-1.5 rounded text-xs font-bold hover:bg-primary-light transition-colors shadow-sm disabled:opacity-70">
                               تأكيد
                             </button>
                             <button onClick={() => handleUpdateStatus(app.id, 'cancelled')} disabled={updatingId === app.id || confirmingId !== null} className="flex-1 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm disabled:opacity-70">
                               رفض
                             </button>
                          </>
                       )}
                    </>
                 )}
                 {user?.role === 'user' && (getEffectiveStatus(app) === 'pending' || getEffectiveStatus(app) === 'confirmed') && (
                    <button onClick={() => handleUpdateStatus(app.id, 'cancelled')} disabled={updatingId === app.id} className="w-full bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm disabled:opacity-70">
                         {updatingId === app.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'إلغاء الموعد'}
                    </button>
                 )}
               </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
