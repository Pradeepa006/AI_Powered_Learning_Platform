// frontend/src/lib/mockData/courses.ts
//
// Centralized mock data for NovaLearn / LuminaLearn.
//
// This file is the single source of truth for course content until the
// backend curriculum, enrollment, and quiz-grading endpoints are ready.
// Every course returned from here is fully self-contained (modules,
// lessons, quizzes, assignments) and requires no backend call, no
// authentication, and no enrollment record to view.
//
// `mockCourses`     -> lightweight list for the landing page / listings
// `getCourseById`   -> full detail object for the course detail page
// `getRelatedCourses` -> a handful of "you might also like" courses

export interface Instructor {
  id: number;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  rating: number;
  studentsCount: number;
}

export interface Lesson {
  id: number;
  moduleIndex: number;
  sectionName: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // seconds
  isFree: boolean;
  isCompleted: boolean;
  transcript: string;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: number;
  title: string;
  questionCount: number;
  passingScore: number;
  timeLimitSeconds: number;
  questions: QuizQuestion[];
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueInDays: number;
  maxScore: number;
  status: 'pending' | 'submitted' | 'graded';
  submittedScore?: number;
}

export interface CourseModule {
  name: string;
  lessons: Lesson[];
}

export interface CourseSummary {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  discountPrice?: number;
  averageRating: number;
  reviewCount: number;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  thumbnailUrl: string;
}

export interface CourseDetail extends CourseSummary {
  description: string;
  instructor: Instructor;
  durationHours: number;
  studentsEnrolled: number;
  lastUpdated: string;
  modules: CourseModule[];
  quizzes: Quiz[];
  assignments: Assignment[];
}

// ---------------------------------------------------------------------------
// Seeded RNG so every course's generated data is stable across reloads
// (same course id always produces the same modules/lessons/quizzes).
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length];
}

// A small rotation of real, public, generally-known tutorial videos used
// purely as placeholder demo content for each lesson.
const DEMO_VIDEO_IDS = [
  'PkZNo7MFNFg',
  'rfscVS0vtbw',
  'w7ejDZ8SWv8',
  'Oe421EPjeBE',
  'qz0aGYrrlhU',
  '1Rs2ND1ryYc',
  'zJSY8tbf_ys',
  'JI4dK9DsQmM',
];

const CATEGORIES = [
  'Web Development',
  'Data Science',
  'Artificial Intelligence',
  'Backend Engineering',
  'Mobile Development',
  'Cloud & DevOps',
  'Cybersecurity',
  'UI/UX Design',
  'Blockchain',
  'Game Development',
] as const;

const TOPICS_BY_CATEGORY: Record<string, string[]> = {
  'Web Development': [
    'HTML, CSS & JavaScript Foundations',
    'React & Next.js Product Builder',
    'Vue.js Complete Developer Guide',
    'Full-Stack MERN Bootcamp',
    'Advanced CSS & Responsive Design',
  ],
  'Data Science': [
    'Python Data Science Career Track',
    'Data Visualization with Tableau',
    'Statistics for Data Analysts',
    'SQL for Data Analysis',
    'Big Data with Apache Spark',
  ],
  'Artificial Intelligence': [
    'AI & Machine Learning Essentials',
    'Deep Learning with PyTorch',
    'Natural Language Processing Bootcamp',
    'Computer Vision Fundamentals',
    'Generative AI & LLM Engineering',
  ],
  'Backend Engineering': [
    'Java Backend Engineering with Spring Boot',
    'Node.js & Express API Mastery',
    'Go for Backend Developers',
    'Microservices Architecture Deep Dive',
    'GraphQL API Design',
  ],
  'Mobile Development': [
    'React Native App Development',
    'Flutter Complete App Bootcamp',
    'iOS Development with Swift',
    'Android Development with Kotlin',
    'Cross-Platform Mobile Architecture',
  ],
  'Cloud & DevOps': [
    'AWS Cloud Practitioner to Solutions Architect',
    'Docker & Kubernetes for Developers',
    'CI/CD Pipeline Engineering',
    'Terraform Infrastructure as Code',
    'DevOps Foundations',
  ],
  Cybersecurity: [
    'Ethical Hacking Fundamentals',
    'Network Security Essentials',
    'Web Application Penetration Testing',
    'Cloud Security Architecture',
    'Cryptography for Engineers',
  ],
  'UI/UX Design': [
    'UI/UX Design Foundations',
    'Figma for Product Designers',
    'Design Systems at Scale',
    'User Research & Usability Testing',
    'Mobile App Design Masterclass',
  ],
  Blockchain: [
    'Blockchain & Smart Contract Development',
    'Solidity for Ethereum Developers',
    'Web3 Full-Stack Development',
    'Cryptocurrency & DeFi Fundamentals',
    'NFT Marketplace Engineering',
  ],
  'Game Development': [
    'Unity Game Development Bootcamp',
    'Unreal Engine 5 Masterclass',
    'Game Design Fundamentals',
    '2D Game Development with Godot',
    'Multiplayer Game Networking',
  ],
};

const ALL_TOPICS: { category: string; title: string }[] = Object.entries(TOPICS_BY_CATEGORY).flatMap(
  ([category, titles]) => titles.map((title) => ({ category, title }))
);

const INSTRUCTORS: Instructor[] = [
  { id: 1, name: 'Dr. Alex Carter', title: 'Lead Software Architect', avatar: '', bio: 'Alex has spent over a decade building large-scale platforms and now teaches full-stack engineering.', rating: 4.9, studentsCount: 82000 },
  { id: 2, name: 'Priya Raman', title: 'Senior Data Scientist', avatar: '', bio: 'Priya builds ML systems in production and loves turning statistics into intuition.', rating: 4.8, studentsCount: 61000 },
  { id: 3, name: 'Marcus Webb', title: 'Cloud Solutions Architect', avatar: '', bio: 'Marcus designs resilient cloud infrastructure and has certified thousands of engineers.', rating: 4.7, studentsCount: 45000 },
  { id: 4, name: 'Sofia Chen', title: 'Product Design Lead', avatar: '', bio: 'Sofia has shipped design systems for startups and enterprises alike.', rating: 4.9, studentsCount: 39000 },
  { id: 5, name: 'James Okafor', title: 'Security Engineer', avatar: '', bio: 'James is a former penetration tester who now teaches practical, ethical security skills.', rating: 4.8, studentsCount: 28000 },
  { id: 6, name: 'Elena Petrova', title: 'Mobile Engineering Manager', avatar: '', bio: 'Elena has led mobile teams shipping apps used by millions of people worldwide.', rating: 4.7, studentsCount: 33000 },
  { id: 7, name: 'Ravi Shankar', title: 'Blockchain Developer', avatar: '', bio: 'Ravi has built decentralized applications since the early days of Ethereum.', rating: 4.6, studentsCount: 19000 },
  { id: 8, name: 'Nina Torres', title: 'Game Development Instructor', avatar: '', bio: 'Nina has shipped indie titles and teaches game engineering with a focus on fundamentals.', rating: 4.8, studentsCount: 24000 },
];

function buildSummary(id: number): CourseSummary {
  const topic = pick(ALL_TOPICS, id - 1);
  const rng = mulberry32(id * 7919);
  const isFree = id % 2 === 0;
  const basePrice = isFree ? 0 : 49 + Math.floor(rng() * 100);
  const hasDiscount = !isFree && rng() > 0.25;
  const difficulty: CourseSummary['difficulty'] = pick(['Beginner', 'Intermediate', 'Advanced'], id);

  // Sanitize category for URL
  const categoryForUrl = topic.category.split(' ')[0].toLowerCase();

  return {
    id,
    title: topic.title,
    subtitle: `Master ${topic.title.toLowerCase()} through hands-on projects and real-world case studies.`,
    price: basePrice,
    discountPrice: hasDiscount ? Math.round(basePrice * 0.55) : undefined,
    averageRating: Math.round((4.4 + rng() * 0.5) * 10) / 10,
    reviewCount: 60 + Math.floor(rng() * 900),
    category: topic.category,
    difficulty,
    language: 'English',
    thumbnailUrl: `https://source.unsplash.com/800x450/?${categoryForUrl},technology&sig=${id}`,
  };
}

function buildModules(id: number, summary: CourseSummary): CourseModule[] {
  const rng = mulberry32(id * 104729);
  const moduleCount = 4 + Math.floor(rng() * 3); // 4-6 modules
  const moduleNames = [
    'Getting Started',
    'Core Concepts',
    'Building Real Projects',
    'Intermediate Techniques',
    'Advanced Patterns',
    'Deployment & Best Practices',
  ];

  let lessonCounter = 0;
  const modules: CourseModule[] = [];

  for (let m = 0; m < moduleCount; m++) {
    const lessonCount = 3 + Math.floor(rng() * 3); // 3-5 lessons
    const lessons: Lesson[] = [];
    const sectionName = moduleNames[m] || `Module ${m + 1}`;

    for (let l = 0; l < lessonCount; l++) {
      lessonCounter++;
      const lessonId = id * 1000 + lessonCounter;
      lessons.push({
        id: lessonId,
        moduleIndex: m,
        sectionName,
        title: `${sectionName}: Lesson ${l + 1}`,
        description: `A practical walkthrough covering key ideas in ${summary.title} for the "${sectionName}" module.`,
        videoUrl: `https://www.youtube.com/watch?v=${pick(DEMO_VIDEO_IDS, lessonId)}`,
        duration: 300 + Math.floor(rng() * 900),
        isFree: m === 0 && l === 0,
        isCompleted: false,
        transcript: `In this lesson we explore ${summary.title.toLowerCase()}, building on concepts from earlier lessons and preparing you for what comes next.`,
      });
    }
    modules.push({ name: sectionName, lessons });
  }

  return modules;
}

function buildQuizzes(id: number, summary: CourseSummary): Quiz[] {
  const rng = mulberry32(id * 65537);
  const quizCount = 2 + Math.floor(rng() * 2); // 2-3 quizzes
  const quizzes: Quiz[] = [];

  for (let q = 0; q < quizCount; q++) {
    const questionCount = 4;
    const questions: QuizQuestion[] = [];
    for (let i = 0; i < questionCount; i++) {
      const correctIndex = Math.floor(rng() * 4);
      questions.push({
        id: id * 100 + q * 10 + i,
        questionText: `Which of the following best relates to a core concept in ${summary.title} (Q${i + 1})?`,
        options: [
          `A foundational principle covered in module ${q + 1}`,
          `An unrelated concept from a different field`,
          `A deprecated technique no longer recommended`,
          `A common beginner misconception`,
        ],
        correctIndex,
      });
    }
    quizzes.push({
      id: id * 10 + q,
      title: `${summary.title} — Checkpoint Quiz ${q + 1}`,
      questionCount,
      passingScore: 70,
      timeLimitSeconds: 600,
      questions,
    });
  }

  return quizzes;
}

function buildAssignments(id: number, summary: CourseSummary): Assignment[] {
  const rng = mulberry32(id * 40503);
  const count = 2 + Math.floor(rng() * 2); // 2-3 assignments
  const assignments: Assignment[] = [];
  for (let a = 0; a < count; a++) {
    assignments.push({
      id: id * 10 + a,
      title: `Assignment ${a + 1}: Apply ${summary.title}`,
      description: `Complete a hands-on project that demonstrates the skills covered so far in ${summary.title}.`,
      dueInDays: 7 * (a + 1),
      maxScore: 100,
      status: 'pending',
    });
  }
  return assignments;
}

function buildInstructor(id: number): Instructor {
  return pick(INSTRUCTORS, id - 1);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const TOTAL_MOCK_COURSES = ALL_TOPICS.length;

/** Lightweight list used by the landing page / course listings. */
export const mockCourses: CourseSummary[] = Array.from({ length: TOTAL_MOCK_COURSES }, (_, i) =>
  buildSummary(i + 1)
);

const detailCache = new Map<number, CourseDetail>();

/**
 * Returns the full course detail (modules, lessons, quizzes, assignments)
 * for a given course id, or `undefined` if no such course exists.
 * Data is generated once per id and cached for the session so repeated
 * lookups (and lesson-completion merges) stay consistent.
 */
export function getCourseById(id: number | string): CourseDetail | undefined {
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId < 1 || numericId > TOTAL_MOCK_COURSES) {
    return undefined;
  }
  if (detailCache.has(numericId)) return detailCache.get(numericId);

  const summary = buildSummary(numericId);
  const detail: CourseDetail = {
    ...summary,
    description: `${summary.title} is a comprehensive, project-based course designed to take you from fundamentals to job-ready skills in ${summary.category}. You'll build real projects, complete checkpoint quizzes, and submit hands-on assignments along the way.`,
    instructor: buildInstructor(numericId),
    durationHours: 8 + (numericId % 12),
    studentsEnrolled: 500 + numericId * 37,
    lastUpdated: '2026-05-01',
    modules: buildModules(numericId, summary),
    quizzes: buildQuizzes(numericId, summary),
    assignments: buildAssignments(numericId, summary),
  };
  detailCache.set(numericId, detail);
  return detail;
}

/** Returns up to `count` other courses, preferring the same category. */
export function getRelatedCourses(course: CourseSummary, count = 4): CourseSummary[] {
  const sameCategory = mockCourses.filter((c) => c.id !== course.id && c.category === course.category);
  const others = mockCourses.filter((c) => c.id !== course.id && c.category !== course.category);
  return [...sameCategory, ...others].slice(0, count);
}