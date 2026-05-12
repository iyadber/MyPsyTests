import React, { useState, useEffect } from 'react';
import { useAuthStore, Clinic } from '../store';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Save, Store, MapPin, Phone, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

export const WILAYAS = [
  "أدرار (02) الشلف", "(03) الأغواط", "(04) أم البواقي", "(05) باتنة", "(06) بجاية", "(07) بسكرة", "(08) بشار", "(09) البليدة", "(10) البويرة",
  "(11) تمنراست", "(12) تبسة", "(13) تلمسان", "(14) تيارت", "(15) تيزي وزو", "(16) الجزائر العاصمة", "(17) الجلفة", "(18) جيجل", "(19) سطيف",
  "(20) سعيدة", "(21) سكيكدة", "(22) سيدي بلعباس", "(23) عنابة", "(24) قالمة", "(25) قسنطينة", "(26) المدية", "(27) مستغانم", "(28) المسيلة",
  "(29) معسكر", "(30) ورقلة", "(31) وهران", "(32) البيض", "(33) إليزي", "(34) برج بوعريريج", "(35) بومرداس", "(36) الطارف", "(37) تندوف",
  "(38) تيسمسيلت", "(39) الوادي", "(40) خنشلة", "(41) سوق أهراس", "(42) تيبازة", "(43) ميلة", "(44) عين الدفلى", "(45) النعامة",
  "(46) عين تموشنت", "(47) غرداية", "(48) غليزان", "(49) تيميمون", "(50) برج باجي مختار", "(51) أولاد جلال", "(52) بني عباس",
  "(53) عين صالح", "(54) عين قزام", "(55) تقرت", "(56) جانت", "(57) المغير", "(58) المنيعة", "(59) آفلو", "(60) بريكة", "(61) القنطرة",
  "(62) بير العاتر", "(63) العريشة", "(64) قصر الشلالة", "(65) عين وسارة", "(66) مسعد", "(67) قصر البخاري", "(68) بوسعادة", "(69) الأبيض سيدي الشيخ"
];

// Reformat wilayas simply as strings without the numbers inside normally, but user requested exactly these 69. Let's fix the first element which had 1 and 2 merged in my paste or the prompt:
// "1) أدرار (02) الشلف ... " let's parse exactly what the user gave:
export const WILAYAS_LIST = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار", "البليدة", "البويرة",
  "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر العاصمة", "الجلفة", "جيجل", "سطيف", "سعيدة",
  "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة",
  "وهران", "البيض", "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان", "تيميمون",
  "برج باجي مختار", "أولاد جلال", "بني عباس", "عين صالح", "عين قزام", "تقرت", "جانت", "المغير", "المنيعة",
  "آفلو", "بريكة", "القنطرة", "بير العاتر", "العريشة", "قصر الشلالة", "عين وسارة", "مسعد", "قصر البخاري",
  "بوسعادة", "الأبيض سيدي الشيخ"
];

export default function ClinicProfile() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'psychologist') {
      navigate('/');
      return;
    }

    const fetchClinic = async () => {
      try {
        const q = query(collection(db, 'clinics'), where('psychologistId', '==', user.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docData = snapshot.docs[0];
          const data = docData.data();
          const loadedClinic: Clinic = {
            id: docData.id,
            psychologistId: data.psychologistId,
            name: data.name,
            wilaya: data.wilaya || '',
            address: data.address,
            phone: data.phone || '',
            bio: data.bio || '',
            createdAt: data.createdAt?.toMillis() || Date.now(),
            updatedAt: data.updatedAt?.toMillis(),
          };
          setClinic(loadedClinic);
          setName(loadedClinic.name);
          setWilaya(loadedClinic.wilaya || '');
          setAddress(loadedClinic.address);
          setPhone(loadedClinic.phone || '');
          setBio(loadedClinic.bio || '');
        }
      } catch (err) {
        console.error('Error fetching clinic:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [user, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      if (!name || name.trim() === '') throw new Error('الرجاء إدخال اسم العيادة');
      if (!wilaya || wilaya.trim() === '') throw new Error('الرجاء اختيار الولاية');
      if (!address || address.trim() === '') throw new Error('الرجاء إدخال عنوان العيادة');

      const clinicData = {
        psychologistId: user.uid,
        name: name.trim(),
        wilaya: wilaya.trim(),
        address: address.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      };

      if (clinic?.id) {
        // Update existing
        const clinicRef = doc(db, 'clinics', clinic.id);
        await updateDoc(clinicRef, {
          ...clinicData,
          updatedAt: serverTimestamp()
        });
        setClinic({ ...clinic, ...clinicData });
      } else {
        // Create new (just use user.uid to 1:1 map, or generate id)
        const clinicRef = doc(db, 'clinics', user.uid);
        await setDoc(clinicRef, {
          ...clinicData,
          createdAt: serverTimestamp()
        });
        setClinic({
          id: user.uid,
          ...clinicData,
          createdAt: Date.now()
        });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      if (err instanceof Error) {
        if (err.message.includes('الرجاء')) {
          setError(err.message);
        } else {
          handleFirestoreError(err, clinic?.id ? OperationType.UPDATE : OperationType.CREATE, 'clinics');
        }
      }
      setError(err?.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto flex flex-col gap-6"
      dir="rtl"
    >
      <header className="border-b border-border pb-4">
        <h2 className="text-2xl font-black text-ink flex items-center gap-2">
          <Store className="w-6 h-6 text-primary" />
          إدارة العيادة
        </h2>
        <p className="text-ink3 mt-1 text-sm">قم بتحديث معلومات عيادتك ليتمكن المرضى من حجز مواعيد الاختبارات لديك.</p>
      </header>

      <form onSubmit={handleSave} className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden p-5 space-y-5">
        
        <div>
          <label className="block text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
            <Store className="w-4 h-4 text-ink3" />
            اسم العيادة *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-paper border border-border rounded-lg py-2.5 px-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
            placeholder="مثال: عيادة د. محمد للصحة النفسية"
          />
        </div>

        <div>
           <label className="block text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-ink3" />
            الولاية *
          </label>
          <select
            value={wilaya}
            onChange={(e) => setWilaya(e.target.value)}
            className="w-full bg-paper border border-border rounded-lg py-2.5 px-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
          >
            <option value="">-- اختر الولاية --</option>
            {WILAYAS_LIST.map((w, i) => (
              <option key={i} value={w}>{`${i + 1} - ${w}`}</option>
            ))}
          </select>
        </div>

        <div>
           <label className="block text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-ink3" />
            عنوان العيادة *
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-paper border border-border rounded-lg py-2.5 px-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
            placeholder="المدينة، الحي، اسم الشارع، رقم المبنى"
          />
        </div>

        <div>
           <label className="block text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
            <Phone className="w-4 h-4 text-ink3" />
            رقم الهاتف
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-paper border border-border rounded-lg py-2.5 px-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
            placeholder="رقم هاتف العيادة للتواصل (اختياري)"
          />
        </div>

        <div>
           <label className="block text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-ink3" />
            نبذة عن العيادة
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full bg-paper border border-border rounded-lg py-2.5 px-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm resize-y"
            placeholder="وصف للخدمات أو التخصصات المتاحة... (اختياري)"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm font-bold border border-red-500/20">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-bold border border-emerald-500/20">
            تم حفظ معلومات العيادة بنجاح!
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:pointer-events-none"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ البيانات
          </button>
        </div>
      </form>
    </motion.div>
  );
}
