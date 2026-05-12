/// <reference types="vite/client" />
import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
      throw new Error("يرجى إضافة مفتاح VITE_GEMINI_API_KEY صالح في بيئة العمل (مثل GitHub Secrets).");
    }
    genAI = new GoogleGenAI({ apiKey: key });
  }
  return genAI;
}

const MASTER_SYSTEM_PROMPT = `
أنت مساعد نفسي متخصص يعمل داخل تطبيق "اختباراتي" للاختبارات النفسية الذكية.

مهمتك:
1. تحليل نتائج الاختبارات النفسية بدقة علمية عالية.
2. تقديم تفسير واضح ومبسط يفهمه المستخدم العادي — بدون مصطلحات معقدة.
3. استخدام اللغة العربية الفصحى البسيطة في جميع ردودك.
4. لا تقدم تشخيصاً طبياً نهائياً — وضّح دائماً أن الاختبار للاستبصار الذاتي فقط.
5. إذا ظهرت علامات تستدعي تدخلاً متخصصاً، أشر إلى ضرورة مراجعة مختص.
6. تعامل مع جميع البيانات بسرية تامة.

أسلوبك: دافئ، مهني، تشجيعي، مباشر. تجنب الحكم على الشخصية.
`;

const ANALYSIS_PROMPT = `
قم بتحليل نتائج الاختبار التالي وقدّم تقريراً شاملاً:

**نوع الاختبار:** {{test_name}}
**الدرجة الإجمالية:** {{total_score}} / {{max_score}}
**درجات الأبعاد الفرعية:** 
{{sub_scores_json}}

**عمر المستخدم:** {{age}} | **الجنس:** {{gender}}

يُرجى تقديم:
1. **ملخص النتيجة** (3-4 جمل): ماذا تعني هذه الدرجة؟
2. **نقاط القوة** (2-3 نقاط): ما الذي يجيده هذا الشخص بناءً على نتائجه؟
3. **مجالات التطوير** (2-3 نقاط): ما الذي يمكن تحسينه؟
4. **توصيات عملية** (3-5 توصيات): خطوات ملموسة يمكن تطبيقها فوراً.
5. **مؤشر الأولوية**: هل تنصح بمراجعة مختص؟ (نعم/لا/ربما) مع السبب.

الرجاء الرد بتنسيق JSON فقط بالهيكل التالي:
{
  "summary": "...",
  "strengths": ["...", "..."],
  "development_areas": ["...", "..."],
  "recommendations": ["...", "...", "..."],
  "specialist_referral": { "needed": false, "reason": "..." }
}
`;

export async function analyzeTestClient(params: {
  testName: string;
  totalScore: number;
  maxScore: number;
  subScores: any;
  age: string | number | null;
  gender: string;
}) {
  const { testName, totalScore, maxScore, subScores, age, gender } = params;

  const userPrompt = ANALYSIS_PROMPT
    .replace("{{test_name}}", testName || "اختبار")
    .replace("{{total_score}}", (totalScore || 0).toString())
    .replace("{{max_score}}", (maxScore || 100).toString())
    .replace("{{sub_scores_json}}", JSON.stringify(subScores || {}, null, 2))
    .replace("{{age}}", age ? age.toString() : "غير محدد")
    .replace("{{gender}}", gender === "male" ? "ذكر" : (gender === "female" ? "أنثى" : "غير محدد"));

  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest', 
    contents: userPrompt,
    config: {
      systemInstruction: MASTER_SYSTEM_PROMPT,
      temperature: 0.4,
      responseMimeType: "application/json",
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text);
}
