import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getTest, MAIN_OPTIONS } from '../lib/tests';
import { useAuthStore } from '../store';
import { Loader2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function TestSession() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  const test = testId ? getTest(testId) : undefined;
  
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!test) {
    return <div className="p-4">الاختبار غير موجود</div>;
  }

  const handleAnswer = async (value: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(value);
    
    setTimeout(async () => {
      const newAnswers = [...answers, value];
      
      if (currentQ + 1 >= test.questions.length) {
        setAnswers(newAnswers);
        setIsAnalyzing(true);
        setSelectedOption(null);
        
        const totalScore = newAnswers.reduce((a, b) => a + b, 0);

        try {
          // Send to custom server endpoint to get analysis
          const response = await fetch('/api/analyze-test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               testName: test.nameAr,
               totalScore,
               maxScore: test.maxScore,
               subScores: {}, // Mock subscores
               age: user?.age || null, 
               gender: user?.gender || 'unknown'
            }),
          });

          if (!response.ok) throw new Error("Analysis failed");
          
          const aiAnalysis = await response.json();

          // Save to Firestore
          const docRef = await addDoc(collection(db, 'testResults'), {
            userId: user?.uid,
            testId: test.id,
            answers: newAnswers,
            totalScore,
            aiAnalysis,
            createdAt: serverTimestamp()
          });

          navigate(`/results/${docRef.id}`);

        } catch (error) {
          setIsAnalyzing(false);
          alert('حدث خطأ أثناء تحليل النتيجة');
          console.error(error);
        }
      } else {
        setAnswers(newAnswers);
        setCurrentQ(q => q + 1);
        setSelectedOption(null);
      }
    }, 400); // 400ms delay for feedback
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 fade-in">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h3 className="font-bold text-lg text-ink">جاري التحليل بالذكاء الاصطناعي...</h3>
        <p className="text-ink3 text-sm text-center">يقوم المساعد النفسي الآن بتحليل إجاباتك واستخلاص الأنماط.</p>
      </div>
    );
  }

  const question = test.questions[currentQ];
  const progress = (currentQ / test.questions.length) * 100;

  return (
    <div className="flex flex-col h-full bg-surface rounded-3xl p-6 border border-border">
      <div className="w-full bg-paper rounded-full h-2 mb-6 overflow-hidden border border-border">
        <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="text-[11px] uppercase tracking-widest font-bold text-ink3 mb-3">السؤال {currentQ + 1} من {test.questions.length}</div>
      <h3 className="text-2xl font-black text-ink mb-8 leading-snug">{question.textAr}</h3>
      
      <div className="flex flex-col gap-3 mt-auto">
        {(test.options || MAIN_OPTIONS).map((opt) => (
          <button 
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            disabled={selectedOption !== null}
            className={`w-full text-right p-5 rounded-2xl border transition-all font-bold text-base flex justify-between items-center group relative overflow-hidden ${
              selectedOption === opt.value 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'border-border bg-surface hover:bg-surface-hover hover:border-primary/50 text-ink2'
            }`}
          >
            <div className={`absolute left-0 top-0 bottom-0 bg-primary/10 transition-all duration-300 ${
              selectedOption === opt.value ? 'w-full right-0' : 'w-0 right-full'
            }`} />
            <span className="relative z-10">{opt.label}</span>
            <div className={`w-4 h-4 rounded-full border transition-colors relative z-10 flex-shrink-0 flex items-center justify-center ${
              selectedOption === opt.value ? 'border-primary bg-primary' : 'border-ink3 group-hover:border-primary group-hover:bg-primary/20'
            }`}>
               {selectedOption === opt.value && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
