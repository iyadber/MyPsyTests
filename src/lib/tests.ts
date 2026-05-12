export interface QuestionOption {
  value: number;
  label: string;
}

export interface Question {
  id: string;
  textAr: string;
}

export interface TestDefinition {
  id: string;
  nameAr: string;
  category: string;
  duration: number; // in minutes
  description: string;
  questions: Question[];
  maxScore: number;
  options?: QuestionOption[];
}

export const MAIN_OPTIONS: QuestionOption[] = [
  { value: 0, label: 'مطلقا' },
  { value: 1, label: 'عدة أيام' },
  { value: 2, label: 'أكثر من نصف الأيام' },
  { value: 3, label: 'كل يوم تقريباً' },
];

export const FREQUENCY_OPTIONS: QuestionOption[] = [
  { value: 0, label: 'أبداً' },
  { value: 1, label: 'نادراً' },
  { value: 2, label: 'أحياناً' },
  { value: 3, label: 'غالباً' },
  { value: 4, label: 'دائماً' },
];

export const TEST_LIBRARY: TestDefinition[] = [
  {
    id: 'depression-phq9',
    nameAr: 'مقياس الاكتئاب PHQ-9',
    category: 'depression',
    duration: 5,
    description: 'أداة للتقييم السريع لشدة الاكتئاب في الأسبوعين الماضيين.',
    maxScore: 27,
    options: MAIN_OPTIONS,
    questions: [
      { id: 'q1', textAr: 'عدم الاهتمام أو الاستمتاع بفعل الأشياء' },
      { id: 'q2', textAr: 'الشعور بالإحباط، الاكتئاب، أو اليأس' },
      { id: 'q3', textAr: 'صعوبة في النوم أو البقاء نائماً، أو النوم أكثر من اللازم' },
      { id: 'q4', textAr: 'الشعور بالتعب أو انخفاض الطاقة' },
      { id: 'q5', textAr: 'ضعف الشهية أو الإفراط في الأكل' },
      { id: 'q6', textAr: 'الشعور بالسوء تجاه نفسك أو أنك فاشل' },
      { id: 'q7', textAr: 'صعوبة في التركيز على الأشياء، مثل قراءة الجريدة' },
      { id: 'q8', textAr: 'التحرك أو التحدث ببطء شديد يلاحظه الآخرون، أو العكس التململ الدائم' },
      { id: 'q9', textAr: 'أفكار بأنك تفضل الموت، أو إيذاء نفسك بطريقة ما' }
    ]
  },
  {
    id: 'anxiety-gad7',
    nameAr: 'مقياس القلق GAD-7',
    category: 'anxiety',
    duration: 5,
    description: 'تقييم سريع لمستويات القلق والتوتر العام.',
    maxScore: 21,
    options: MAIN_OPTIONS,
    questions: [
      { id: 'g1', textAr: 'الشعور بالعصبية، القلق، أو التوتر' },
      { id: 'g2', textAr: 'عدم القدرة على إيقاف أو السيطرة على القلق' },
      { id: 'g3', textAr: 'القلق الشديد حيال أشياء مختلفة' },
      { id: 'g4', textAr: 'صعوبة في الاسترخاء' },
      { id: 'g5', textAr: 'التململ لدرجة صعوبة الجلوس بهدوء' },
      { id: 'g6', textAr: 'سهولة الانزعاج أو الغضب' },
      { id: 'g7', textAr: 'الشعور بالخوف كما لو أن شيئاً سيئاً سيحدث' }
    ]
  },
  {
    id: 'stress-pss10',
    nameAr: 'مقياس الضغط النفسي (PSS)',
    category: 'stress',
    duration: 5,
    description: 'يُستخدم لقياس مستوى التوتر أو الضغط النفسي الذي تعاني منه حالياً.',
    maxScore: 40,
    options: FREQUENCY_OPTIONS,
    questions: [
      { id: 's1', textAr: 'خلال الشهر الماضي، كم مرة كنت منزعجاً بسبب حدوث أمر غير متوقع؟' },
      { id: 's2', textAr: 'خلال الشهر الماضي، كم مرة شعرت بعدم القدرة على السيطرة على الأشياء المهمة في حياتك؟' },
      { id: 's3', textAr: 'خلال الشهر الماضي، كم مرة شعرت بالتوتر أو الضغط؟' },
      { id: 's4', textAr: 'خلال الشهر الماضي، كم مرة شعرت بالثقة في قدرتك على التعامل مع مشاكلك الشخصية؟ (كل ما زادت تقل قيمة التوتر عموما بس هنا سنقيس كأنها أسئلة مباشرة للتبسيط)' },
      { id: 's5', textAr: 'خلال الشهر الماضي، كم مرة شعرت بأن الأمور تسير لصالحك؟' },
      { id: 's6', textAr: 'خلال الشهر الماضي، كم مرة وجدت أنك لا تستطيع التعامل مع كل الأشياء التي يجب عليك القيام بها؟' },
      { id: 's7', textAr: 'خلال الشهر الماضي، كم مرة تمكنت من السيطرة على التهيجات في حياتك؟' },
      { id: 's8', textAr: 'خلال الشهر الماضي، كم مرة شعرت بأنك على رأس الأمور؟' },
      { id: 's9', textAr: 'خلال الشهر الماضي، كم مرة غضبت بسبب أشياء حدثت وكانت خارجة عن إرادتك؟' },
      { id: 's10', textAr: 'خلال الشهر الماضي، كم مرة شعرت بأن الصعوبات تتراكم بشكل لا يمكنك التغلب عليه؟' }
    ]
  },
  {
    id: 'self-esteem-rosenberg',
    nameAr: 'مقياس روزنبيرغ لتقدير الذات',
    category: 'personality',
    duration: 5,
    description: 'أداة لتقييم نظرتك الشاملة ومستوى احترامك لذاتك وتحديد التوكيد الذاتي.',
    maxScore: 30,
    options: MAIN_OPTIONS,
    questions: [
      { id: 'r1', textAr: 'بشكل عام، أنا راضٍ عن نفسي' },
      { id: 'r2', textAr: 'في بعض الأحيان أعتقد أنني لست جيداً على الإطلاق' },
      { id: 'r3', textAr: 'أشعر أن لدي عدداً من الصفات الجيدة' },
      { id: 'r4', textAr: 'أنا قادر على القيام بالأشياء مثل معظم الأشخاص الآخرين' },
      { id: 'r5', textAr: 'أشعر أنه ليس لدي الكثير لأفخر به' },
      { id: 'r6', textAr: 'أنا بالتأكيد أشعر أحياناً بعدم الفائدة' },
      { id: 'r7', textAr: 'أشعر أنني شخص ذو قيمة، على الأقل بنفس قيمة الآخرين' },
      { id: 'r8', textAr: 'أتمنى لو كان لدي المزيد من الاحترام لنفسي' },
      { id: 'r9', textAr: 'باختصار، أنا أميل للشعور بأنني فاشل' },
      { id: 'r10', textAr: 'أنا أتخذ موقفاً إيجابياً تجاه نفسي' }
    ]
  },
  {
    id: 'cognitive-focus',
    nameAr: 'اختبار تقييم التركيز والانتباه',
    category: 'cognitive',
    duration: 5,
    description: 'تقييم يعتمد على إفادة ذاتية لتحديد مشتتات الانتباه ومدى القدرة على التركيز اليومي.',
    maxScore: 24,
    options: FREQUENCY_OPTIONS,
    questions: [
      { id: 'c1', textAr: 'أجد صعوبة في البقاء منتبهاً خلال المحادثات الطويلة' },
      { id: 'c2', textAr: 'أنسى عن قصد المهام البسيطة اليومية' },
      { id: 'c3', textAr: 'انتقل من مهمة لأخرى دون إنهاء المهمة الأولى' },
      { id: 'c4', textAr: 'أشعر بالتشتت بسهولة عند محاولة القراءة أو مشاهدة فلم' },
      { id: 'c5', textAr: 'أجد صعوبة في تنظيم أفكاري قبل التحدث' },
      { id: 'c6', textAr: 'أماطل في البدء بالمهام التي تحتاج لجهد عقلي' },
    ]
  }
];

export function getTest(id: string): TestDefinition | undefined {
  return TEST_LIBRARY.find(t => t.id === id);
}
