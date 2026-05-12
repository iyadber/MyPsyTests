import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore, Clinic } from '../store';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { Loader2, Store, MapPin, Phone, FileText, Calendar as CalendarIcon, CheckCircle2, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WILAYAS_LIST } from './ClinicProfile';

export default function Psychologists() {
  const user = useAuthStore((state) => state.user);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  
  // Filters
  const [searchName, setSearchName] = useState('');
  const [searchWilaya, setSearchWilaya] = useState('');

  // Booking Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const clinicsSnap = await getDocs(collection(db, 'clinics'));
        const loaded: Clinic[] = [];
        clinicsSnap.forEach(doc => {
          const data = doc.data();
          loaded.push({
            id: doc.id,
            psychologistId: data.psychologistId,
            name: data.name,
            wilaya: data.wilaya || '',
            address: data.address,
            phone: data.phone,
            bio: data.bio,
            createdAt: data.createdAt?.toMillis() || Date.now()
          });
        });
        setClinics(loaded);
      } catch (err) {
        console.error('Error fetching clinics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  const filteredClinics = useMemo(() => {
    return clinics.filter(clinic => {
      const matchName = clinic.name.toLowerCase().includes(searchName.toLowerCase());
      const matchWilaya = searchWilaya ? clinic.wilaya === searchWilaya : true;
      return matchName && matchWilaya;
    });
  }, [clinics, searchName, searchWilaya]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClinic) return;
    
    setBookingLoading(true);
    setBookingError(null);
    try {
      if (!patientName.trim()) throw new Error('الرجاء إدخال الاسم الكامل');
      if (!patientPhone.trim()) throw new Error('الرجاء إدخال رقم الهاتف');

      const appointmentId = crypto.randomUUID();
      await setDoc(doc(db, 'appointments', appointmentId), {
        patientId: user.uid,
        psychologistId: selectedClinic.psychologistId,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setSelectedClinic(null);
        setBookingSuccess(false);
        setPatientName('');
        setPatientPhone('');
      }, 3000);
    } catch (err: any) {
      if (err instanceof Error && err.message.includes('الرجاء')) {
        setBookingError(err.message);
      } else {
        handleFirestoreError(err, OperationType.CREATE, 'appointments');
        setBookingError('حدث خطأ أثناء إتمام الحجز');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto flex flex-col gap-6 relative"
    >
      <header className="border-b border-border pb-4">
        <h2 className="text-2xl font-black text-ink flex items-center gap-2">
          <Store className="w-6 h-6 text-primary" />
          العيادات والأخصائيين
        </h2>
        <p className="text-ink3 mt-1 text-sm">اختر أخصائي لحجز موعد في العيادة.</p>
      </header>

      {/* Advanced Filters */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-ink3 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="ابحث باسم العيادة..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full bg-paper border border-border rounded-lg py-2.5 pr-10 pl-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
        <div className="w-full md:w-64 relative">
          <Filter className="w-4 h-4 text-ink3 absolute right-3 top-1/2 -translate-y-1/2" />
          <select
            value={searchWilaya}
            onChange={(e) => setSearchWilaya(e.target.value)}
            className="w-full bg-paper border border-border rounded-lg py-2.5 pr-10 pl-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none"
          >
            <option value="">جميع الولايات</option>
            {WILAYAS_LIST.map((w, i) => (
              <option key={i} value={w}>{`${i + 1} - ${w}`}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredClinics.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center mt-4">
          <p className="text-ink2 font-medium">لا يوجد عيادات مطابقة للبحث.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClinics.map(clinic => (
            <div key={clinic.id} className="bg-surface border border-border p-5 rounded-xl shadow-sm flex flex-col items-start gap-3 hover:border-primary/50 transition-colors">
               <h3 className="text-lg font-bold text-ink">{clinic.name}</h3>
               {clinic.wilaya && <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full mb-1 inline-block">{clinic.wilaya}</span>}
               
               <div className="flex flex-col gap-1.5 text-sm w-full">
                 <div className="flex items-start gap-2 text-ink2">
                   <MapPin className="w-4 h-4 text-ink3 shrink-0 mt-0.5" />
                   <span>{clinic.address}</span>
                 </div>
                 {clinic.phone && (
                   <div className="flex items-center gap-2 text-ink2">
                     <Phone className="w-4 h-4 text-ink3 shrink-0" />
                     <span dir="ltr" className="text-right">{clinic.phone}</span>
                   </div>
                 )}
                 {clinic.bio && (
                   <div className="flex items-start gap-2 text-ink3 text-xs mt-2 bg-paper p-3 rounded border border-border/50">
                     <FileText className="w-4 h-4 shrink-0" />
                     <p className="line-clamp-3">{clinic.bio}</p>
                   </div>
                 )}
               </div>

               <div className="flex-1" />

               {user?.role === 'user' || user?.role === 'admin' ? (
                 <button
                   onClick={() => setSelectedClinic(clinic)}
                   className="w-full mt-2 bg-primary/10 text-primary hover:bg-primary hover:text-paper font-bold py-2 px-4 rounded-lg transition-colors border border-primary/20 text-sm flex justify-center items-center gap-2"
                 >
                    <CalendarIcon className="w-4 h-4" />
                    حجز موعد
                 </button>
               ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedClinic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border shadow-xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {bookingSuccess ? (
                <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-ink">تم إرسال طلب الحجز بنجاح</h3>
                  <p className="text-sm text-ink3">سيقوم الأخصائي بمراجعة الطلب وتأكيده. يمكنك متابعة حالة الحجز من صفحة المواعيد.</p>
                </div>
              ) : (
                <>
                  <div className="p-5 border-b border-border bg-paper/50 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-ink">حجز موعد جديد</h3>
                      <p className="text-xs text-ink3 mt-1">العيادة: {selectedClinic.name}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto p-5">
                    <form id="booking-form" onSubmit={handleBook} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-ink mb-1.5">الاسم الكامل *</label>
                        <input 
                           type="text"
                           value={patientName}
                           onChange={(e) => setPatientName(e.target.value)}
                           placeholder="أدخل اسمك الكامل"
                           className="w-full bg-paper border border-border rounded-xl py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-ink mb-1.5">رقم الهاتف *</label>
                        <input 
                           type="tel"
                           value={patientPhone}
                           onChange={(e) => setPatientPhone(e.target.value)}
                           placeholder="مثال: 0555123456"
                           dir="ltr"
                           className="w-full bg-paper border border-border rounded-xl py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm shadow-sm text-right"
                        />
                      </div>
                      
                      {bookingError && (
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm font-bold border border-red-500/20">
                          {bookingError}
                        </div>
                      )}
                    </form>
                  </div>
                  
                  <div className="p-4 border-t border-border flex justify-end gap-3 bg-paper/50">
                    <button 
                      type="button" 
                      onClick={() => !bookingLoading && setSelectedClinic(null)}
                      className="px-4 py-2 text-sm font-bold text-ink2 hover:bg-surface border border-transparent rounded-lg transition-colors"
                      disabled={bookingLoading}
                    >
                      إلغاء
                    </button>
                    <button 
                      form="booking-form"
                      type="submit" 
                      disabled={bookingLoading}
                      className="px-6 py-2 text-sm font-bold bg-primary hover:bg-primary-light text-paper rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {bookingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      تأكيد الحجز
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
