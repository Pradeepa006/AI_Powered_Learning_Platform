'use client';

import React, { useState, useEffect, use, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  Sparkles, Award, Play, ChevronLeft, Brain,
  BookOpen, Clock, FileText, CheckCircle, Save,
  Settings, Send, Lock, CreditCard, ListChecks,
  ChevronDown, ChevronRight, SkipForward, SkipBack, Circle
} from 'lucide-react';
import Link from 'next/link';
import { getCourseById, getRelatedCourses, CourseDetail, CourseSummary } from '@/lib/mockData/courses';

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export default function CoursePage({ params }: CoursePageProps) {
  const { id: courseId } = use(params);
  const { user } = useSelector((state: RootState) => state.auth);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false); // No backend enrollment gate in demo mode
  const [activeTab, setActiveTab] = useState<'syllabus' | 'quiz' | 'assignments' | 'ai' | 'notes' | 'transcript'>('syllabus');
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // AI chat state inside player
  const [aiMessage, setAiMessage] = useState('');
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Student notes state
  const [notesText, setNotesText] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, number>>>({});
  const [quizResults, setQuizResults] = useState<Record<string, any>>({});
  const [quizSubmittingId, setQuizSubmittingId] = useState<number | null>(null);

  // Video player control states
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Payment checkout and simulated payment gateway states (kept for UI parity;
  // no backend call is made, and enrollment is already granted by default)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutCoupon, setCheckoutCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [checkoutStep, setCheckoutStep] = useState<'input' | 'processing' | 'success' | 'failure'>('input');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet' | 'netbanking'>('card');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

  // Certificate states
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateDetails, setCertificateDetails] = useState<any>(null);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [certLoadError, setCertLoadError] = useState('');

  // ── Load course from mock data (no backend, no auth/enrollment required) ──
  useEffect(() => {
    setLoading(true);

    const detail = getCourseById(courseId);

    if (!detail) {
      setCourse(null);
      setLoading(false);
      return;
    }

    // Check enrollment status from localStorage
    const enrolledCoursesStr = typeof window !== 'undefined' ? localStorage.getItem('enrolled_courses') : null;
    const enrolledCourses = enrolledCoursesStr ? JSON.parse(enrolledCoursesStr) : [];
    const isAlreadyEnrolled = enrolledCourses.includes(Number(courseId)) || (!detail.price || detail.price === 0);
    setIsEnrolled(isAlreadyEnrolled);

    // Merge in any locally-saved lesson completion state for this course
    let completedIds: number[] = [];
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(`course_progress_${courseId}`) : null;
      if (raw) completedIds = JSON.parse(raw);
    } catch {
      completedIds = [];
    }

    const flatLessons = detail.modules.flatMap((m) => m.lessons).map((l) => ({
      ...l,
      isCompleted: completedIds.includes(l.id),
    }));

    setCourse(detail);
    setCurriculum(flatLessons);
    setQuizzes(detail.quizzes);
    setAssignments(detail.assignments);

    let startLesson: any = null;
    try {
      const lastWatchedId = typeof window !== 'undefined' ? localStorage.getItem(`last_watched_lesson_${courseId}`) : null;
      if (lastWatchedId) {
        startLesson = flatLessons.find((l) => l.id.toString() === lastWatchedId) || null;
      }
    } catch {
      startLesson = null;
    }
    if (!startLesson) startLesson = flatLessons.find((l) => !l.isCompleted) || flatLessons[0] || null;
    setActiveLesson(startLesson);

    // Restore a previously-claimed certificate, if any
    try {
      const savedCert = typeof window !== 'undefined' ? localStorage.getItem(`certificate_${courseId}`) : null;
      if (savedCert) setCertificateDetails(JSON.parse(savedCert));
    } catch {
      // ignore
    }

    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, activeLesson]);

  const isYoutubeUrl = (url?: string) => Boolean(url && /youtube\.com|youtu\.be/.test(url));

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes('youtu.be')) {
        const videoId = parsedUrl.pathname.replace('/', '');
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }

      const videoId = parsedUrl.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    } catch {
      return url;
    }
  };

  const selectLesson = (lesson: any, isUnlocked: boolean) => {
    if (!isUnlocked) {
      alert("Please complete the preceding lessons to unlock this one.");
      return;
    }
    setActiveLesson(lesson);
    try {
      localStorage.setItem(`last_watched_lesson_${courseId}`, lesson.id.toString());
    } catch {
      // ignore storage errors
    }
    setNotesText('');

    // Auto-expand the module containing this lesson
    const section = lesson.sectionName || "General";
    if (!expandedModules[section]) {
      setExpandedModules(prev => ({ ...prev, [section]: true }));
    }
  };

  const canViewLesson = Boolean(isEnrolled || activeLesson?.isFree);

  // Demo-mode checkout: everything is already unlocked, this just keeps the
  // existing UI functional if it's ever triggered.
  const handleCheckout = () => {
    if (!course) return;
    const isFree = !course.price || course.price === 0;
    if (isFree) {
      const enrolledCoursesStr = typeof window !== 'undefined' ? localStorage.getItem('enrolled_courses') : null;
      const enrolledCourses = enrolledCoursesStr ? JSON.parse(enrolledCoursesStr) : [];
      if (!enrolledCourses.includes(Number(courseId))) {
        enrolledCourses.push(Number(courseId));
        if (typeof window !== 'undefined') {
          localStorage.setItem('enrolled_courses', JSON.stringify(enrolledCourses));
        }
      }
      setIsEnrolled(true);
      alert('Successfully enrolled in course!');
    } else {
      setCheckoutCoupon('');
      setAppliedCoupon('');
      setDiscountPercentage(0);
      setCheckoutStep('input');
      setShowCheckoutModal(true);
    }
  };

  const executePayment = async () => {
    setCheckoutStep('processing');

    // Artificial delay to show gateway transitions (fully client-side)
    await new Promise(resolve => setTimeout(resolve, 1200));

    const amount = Math.max(0, (course?.price || 0) * (1 - discountPercentage / 100));
    setTransactionDetails({
      transactionId: 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase(),
      amount,
      discountApplied: discountPercentage > 0,
      method: paymentMethod,
      date: new Date().toLocaleDateString(),
    });

    const enrolledCoursesStr = typeof window !== 'undefined' ? localStorage.getItem('enrolled_courses') : null;
    const enrolledCourses = enrolledCoursesStr ? JSON.parse(enrolledCoursesStr) : [];
    if (!enrolledCourses.includes(Number(courseId))) {
      enrolledCourses.push(Number(courseId));
      if (typeof window !== 'undefined') {
        localStorage.setItem('enrolled_courses', JSON.stringify(enrolledCourses));
      }
    }
    setIsEnrolled(true);
    setCheckoutStep('success');
  };

  const handleGenerateCertificate = () => {
    if (!course) return;
    setGeneratingCertificate(true);
    setCertLoadError('');

    setTimeout(() => {
      const cert = {
        certificateId: 'CERT-' + Math.random().toString(36).substring(2, 11).toUpperCase(),
        courseId: Number(courseId),
        courseTitle: course.title,
        studentName: user?.name || 'Student',
        issueDate: new Date().toISOString(),
        instructorName: course.instructor?.name || 'Dr. Alex Carter',
        blockchainTxHash: '0x' + Math.random().toString(16).substring(2, 22),
      };
      try {
        localStorage.setItem(`certificate_${courseId}`, JSON.stringify(cert));
      } catch {
        // ignore storage errors
      }
      setCertificateDetails(cert);
      setShowCertificateModal(true);
      setGeneratingCertificate(false);
    }, 900);
  };

  const handleQuizAnswerChange = (quizId: number, questionId: number, optionIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [quizId]: {
        ...(prev[quizId] || {}),
        [questionId]: optionIndex,
      },
    }));
  };

  const handleSubmitQuiz = (quizId: number) => {
    const quiz = quizzes.find((q: any) => q.id === quizId);
    if (!quiz) return;

    setQuizSubmittingId(quizId);
    const answers = quizAnswers[quizId] || {};

    const results = (quiz.questions || []).map((q: any) => {
      const selected = answers[q.id];
      const correct = selected === q.correctIndex;
      return { questionId: q.id, selected, correct };
    });
    const correctCount = results.filter((r: any) => r.correct).length;
    const score = quiz.questions.length ? (correctCount / quiz.questions.length) * 100 : 0;
    const passed = score >= quiz.passingScore;

    setTimeout(() => {
      setQuizResults(prev => ({ ...prev, [quizId]: { score, passed, results } }));
      setQuizSubmittingId(null);
      setActiveTab('quiz');
    }, 500);
  };

  const handleSubmitAssignment = (assignmentId: number) => {
    setAssignments(prev => prev.map((a: any) => a.id === assignmentId ? { ...a, status: 'submitted' } : a));
    alert('Assignment submitted! Your instructor will grade it shortly.');
  };

  const activeLessonIndex = curriculum.findIndex(l => l.id === activeLesson?.id);
  const prevLesson = activeLessonIndex > 0 ? curriculum[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex < curriculum.length - 1 ? curriculum[activeLessonIndex + 1] : null;

  const handleUpdateProgress = (autoAdvance = false) => {
    if (!activeLesson) return;

    setCurriculum(prev => {
      const updated = prev.map(l => l.id === activeLesson.id ? { ...l, isCompleted: true } : l);
      try {
        const completedIds = updated.filter(l => l.isCompleted).map(l => l.id);
        localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(completedIds));
      } catch {
        // ignore storage errors
      }
      return updated;
    });

    setActiveLesson((prev: any) => (prev ? { ...prev, isCompleted: true } : prev));

    if (autoAdvance && nextLesson) {
      selectLesson(nextLesson, true);
    } else {
      alert("Lesson marked as completed! Progress updated.");
    }
  };

  const handleVideoEnded = () => {
    if (isEnrolled && activeLesson && !activeLesson.isCompleted) {
      handleUpdateProgress(true); // Complete and auto advance
    } else if (isEnrolled && activeLesson && activeLesson.isCompleted && nextLesson) {
      // Already completed, just auto-advance
      selectLesson(nextLesson, true);
    }
  };

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage || !aiMessage.trim()) return;

    const userQuery = aiMessage;
    setAiMessage('');
    setAiHistory(prev => [...prev, { role: 'user', content: userQuery }]);
    setAiLoading(true);

    // Simulated locally — no backend AI call in demo mode
    setTimeout(() => {
      const reply = `Good question about "${activeLesson?.title || 'this lesson'}". Focus on the core idea covered in this section, re-watch the relevant segment if needed, and try applying it in the practice project before moving on. (Simulated AI Tutor response — demo mode.)`;
      setAiHistory(prev => [...prev, { role: 'assistant', content: reply }]);
      setAiLoading(false);
    }, 700);
  };

  const handleSaveNotes = () => {
    if (!notesText.trim()) return;
    setSavedNotes(prev => [...prev, `[Lecture Note]: ${notesText}`]);
    setNotesText('');
    alert("Note saved successfully!");
  };

  const toggleModule = (moduleName: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  // Structured Data & Progress Tracking
  const modules = useMemo(() => {
    const mods: Record<string, any[]> = {};
    curriculum.forEach(lesson => {
      const section = lesson.sectionName || "General";
      if (!mods[section]) mods[section] = [];
      mods[section].push(lesson);
    });
    return mods;
  }, [curriculum]);

  const unlockedLessonIds = useMemo(() => {
    if (!isEnrolled) {
      return new Set(curriculum.filter(l => l.isFree).map(l => l.id));
    }

    const unlockedIds = new Set<number>();
    let allPreviousCompleted = true;
    for (let i = 0; i < curriculum.length; i++) {
      const lesson = curriculum[i];
      if (allPreviousCompleted || lesson.isFree) {
        unlockedIds.add(lesson.id);
      }
      if (!lesson.isCompleted && !lesson.isFree) {
        allPreviousCompleted = false;
      }
    }
    return unlockedIds;
  }, [curriculum, isEnrolled]);

  const completedCount = curriculum.filter(l => l.isCompleted).length;
  const totalCount = curriculum.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const relatedCourses: CourseSummary[] = useMemo(() => {
    return course ? getRelatedCourses(course, 4) : [];
  }, [course]);

  // Initialize expanded modules once data is loaded
  useEffect(() => {
    if (Object.keys(expandedModules).length === 0 && curriculum.length > 0) {
      const initialExpanded: Record<string, boolean> = {};
      Object.keys(modules).forEach((mod, idx) => {
        initialExpanded[mod] = idx === 0; // Expand first module by default
      });
      // Also ensure the active lesson's module is expanded
      if (activeLesson) {
        initialExpanded[activeLesson.sectionName || "General"] = true;
      }
      setExpandedModules(initialExpanded);
    }
  }, [modules, curriculum, activeLesson]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 animate-pulse">Syncing player stream and transcripts...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
          <BookOpen className="w-9 h-9 text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Course Not Found</h1>
        <p className="text-sm text-gray-500 max-w-sm mb-8">
          We couldn&apos;t find a course matching this link. It may have been removed, or the URL might be incorrect.
        </p>
        <Link href="/dashboard" className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-gray-200 transition">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col font-sans">

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-white/5 bg-[#0a0a0a] px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:scale-105 transition-all">
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white line-clamp-1 flex items-center gap-2">
              {course.title}
              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold ${(!course.price || course.price === 0) ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                {(!course.price || course.price === 0) ? 'Free' : 'Premium'}
              </span>
            </h1>
            <p className="text-xs text-purple-400 font-medium">Instructor: {course.instructor?.name || "Dr. Alex Carter"}</p>
          </div>
        </div>

        {/* Overall Progress Indicator (Top Right) */}
        <div className="flex items-center gap-6">
          {isEnrolled && (
            <div className="hidden md:flex items-center gap-3">
              <div className="w-32 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-gray-300">{progressPercentage}% Completed</span>
            </div>
          )}

          {isEnrolled ? (
            <button
              onClick={() => handleUpdateProgress(false)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95"
            >
              <CheckCircle className="w-4 h-4" /> Mark Lesson Completed
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={purchaseLoading}
              className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-xs flex items-center gap-2 shadow-xl shadow-white/10 transition-all active:scale-95 disabled:opacity-60"
            >
              <CreditCard className="w-4 h-4" /> {purchaseLoading ? 'Processing...' : (!course.price || course.price === 0 ? 'Enroll for Free' : 'Purchase Full Course')}
            </button>
          )}
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 overflow-hidden h-[calc(100vh-64px)]">

        {/* Left Side: Video Player & Details */}
        <div className="xl:col-span-3 flex flex-col overflow-y-auto bg-[#050505]">

          <div className="p-4 md:p-6 lg:p-8 w-full max-w-6xl mx-auto space-y-6">

            {/* Custom Video Wrapper */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-white/5 relative group shadow-2xl">
              {activeLesson?.videoUrl && canViewLesson ? (
                isYoutubeUrl(activeLesson.videoUrl) ? (
                  <iframe
                    key={activeLesson.id}
                    className="w-full h-full"
                    src={getYoutubeEmbedUrl(activeLesson.videoUrl)}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={videoRef}
                    key={activeLesson.id}
                    className="w-full h-full outline-none"
                    controls
                    autoPlay
                    onEnded={handleVideoEnded}
                    src={activeLesson.videoUrl}
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-indigo-950 to-black relative">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                  {canViewLesson ? (
                    <>
                      <Play className="w-20 h-20 text-purple-500/80 mb-4 animate-pulse relative z-10" />
                      <h3 className="text-xl font-bold text-white relative z-10">Select a lesson to start learning</h3>
                    </>
                  ) : (
                    <>
                      <Lock className="w-16 h-16 text-yellow-500 mb-4 relative z-10" />
                      <h3 className="text-xl font-bold text-white relative z-10">Unlock this Lesson</h3>
                      <p className="text-sm text-gray-400 mt-2 max-w-md relative z-10">
                        {(!course.price || course.price === 0)
                          ? "This is a free course. Enroll now to access all lessons and track your progress!"
                          : "You can preview free lessons, but you need to purchase the course to access the full curriculum and earn a certificate."}
                      </p>
                      <button onClick={handleCheckout} className="mt-6 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full relative z-10 transition">
                        {(!course.price || course.price === 0) ? 'Enroll for Free' : 'Purchase Course'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Float Speed Overlay */}
              {activeLesson?.videoUrl && canViewLesson && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <select
                    className="bg-transparent border-0 outline-none text-xs font-bold text-white cursor-pointer"
                    value={playbackSpeed}
                    onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                  >
                    <option value="0.75" className="bg-black">0.75x</option>
                    <option value="1" className="bg-black">1.0x Normal</option>
                    <option value="1.25" className="bg-black">1.25x</option>
                    <option value="1.5" className="bg-black">1.5x</option>
                    <option value="2" className="bg-black">2.0x</option>
                  </select>
                </div>
              )}
            </div>

            {/* Previous / Next Controls */}
            <div className="flex items-center justify-between bg-[#111] p-3 rounded-xl border border-white/5">
              <button
                onClick={() => prevLesson && selectLesson(prevLesson, true)}
                disabled={!prevLesson}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold"
              >
                <SkipBack className="w-4 h-4" /> Previous Lesson
              </button>

              <button
                onClick={() => nextLesson && selectLesson(nextLesson, unlockedLessonIds.has(nextLesson.id))}
                disabled={!nextLesson}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all text-sm font-bold shadow-lg
                  ${nextLesson && unlockedLessonIds.has(nextLesson.id)
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/50'
                    : 'bg-white/5 text-gray-500 disabled:opacity-50 cursor-not-allowed'}`}
              >
                Next Lesson <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Completion Banner */}
            {isEnrolled && progressPercentage >= 100 && (
              <div className="bg-gradient-to-r from-purple-950 via-black to-indigo-950 border border-purple-500/30 rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                    <Award className="w-7 h-7 text-purple-400 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Congratulations! Course Completed</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-md">
                      You have watched all video lectures and completed 100% of the syllabus. You are now eligible to claim your official blockchain-verified Certificate of Completion.
                    </p>
                  </div>
                </div>
                {certificateDetails ? (
                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <Award className="w-4 h-4" /> View Certificate
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateCertificate}
                    disabled={generatingCertificate}
                    className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 whitespace-nowrap disabled:opacity-50"
                  >
                    {generatingCertificate ? 'Generating...' : 'Claim Certificate'}
                  </button>
                )}
              </div>
            )}

            {/* Lesson Metadata */}
            <div className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/5">
              <div className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-400 font-bold uppercase tracking-widest mb-4">
                {activeLesson?.sectionName || "Module 1"}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{activeLesson?.title || "Welcome to LuminaLearn"}</h2>

              <div className="flex items-center gap-6 mt-4 text-xs font-medium text-gray-400">
                {activeLesson?.duration && (
                  <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <Clock className="w-4 h-4 text-indigo-400" /> {Math.round(activeLesson.duration / 60)} min
                  </span>
                )}
                {activeLesson?.isCompleted && (
                  <span className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">About this lesson</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-4xl">
                  {activeLesson?.description || "In this lesson, we will cover the core concepts required to master this section. Ensure you watch the entire video and take notes as needed before proceeding to the quiz or the next lesson."}
                </p>
              </div>
            </div>

            {/* About the Course + Instructor */}
            <div className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-purple-400" /> About this course
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-4xl mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-2.5 mb-6 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">{course.category}</span>
                <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">{course.difficulty}</span>
                <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">{course.language}</span>
                <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">{course.durationHours} hrs</span>
                <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">★ {course.averageRating} ({course.reviewCount} reviews)</span>
                <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">{course.studentsEnrolled.toLocaleString()} students</span>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                  {course.instructor.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{course.instructor.name}</p>
                  <p className="text-xs text-gray-500">{course.instructor.title}</p>
                </div>
              </div>
            </div>

            {/* Notes Workspace */}
            <div className="p-6 md:p-8 rounded-2xl bg-[#111] border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-400" /> Personal Notes Pad
              </h3>
              <p className="text-xs text-gray-500 mb-2">Jot down important concepts. Notes are saved to your account automatically.</p>

              <div className="space-y-4">
                <textarea
                  rows={4}
                  placeholder="Take notes aligned to this lecture..."
                  className="w-full p-4 rounded-xl bg-[#0a0a0a] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-y"
                  value={notesText}
                  onChange={e => setNotesText(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" /> Save Note
                  </button>
                </div>
              </div>

              {savedNotes.length > 0 && (
                <div className="border-t border-white/5 pt-6 mt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Saved Notes</h4>
                  {savedNotes.map((note, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-cyan-900/10 border border-cyan-500/20 text-sm text-gray-300 leading-relaxed shadow-sm">
                      {note}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <div className="p-6 md:p-8 rounded-2xl bg-[#111] border border-white/5">
                <h3 className="text-base font-bold text-white flex items-center gap-3 mb-5">
                  <BookOpen className="w-5 h-5 text-purple-400" /> Related Courses
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedCourses.map((rc) => (
                    <Link
                      key={rc.id}
                      href={`/course/${rc.id}`}
                      className="rounded-xl bg-[#0a0a0a] border border-white/5 hover:border-purple-500/30 transition overflow-hidden flex gap-3 p-3 group"
                    >
                      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/40 to-cyan-900/40 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-200 line-clamp-2 group-hover:text-purple-300 transition">{rc.title}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{rc.category}</p>
                        <p className="text-[10px] text-yellow-500 mt-1">★ {rc.averageRating}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Curriculum Sidebar & Quizzes */}
        <div className="xl:col-span-1 border-l border-white/5 bg-[#0a0a0a] flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)] z-10">

          {/* Tab bar header */}
          <div className="flex border-b border-white/5 bg-[#0a0a0a] overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`flex-1 py-4 px-2 text-xs font-bold transition whitespace-nowrap border-b-2 ${activeTab === 'syllabus' ? 'border-purple-500 text-white bg-purple-500/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex-1 py-4 px-2 text-xs font-bold transition whitespace-nowrap border-b-2 ${activeTab === 'quiz' ? 'border-purple-500 text-white bg-purple-500/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              Quizzes
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 py-4 px-2 text-xs font-bold transition whitespace-nowrap border-b-2 ${activeTab === 'assignments' ? 'border-purple-500 text-white bg-purple-500/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              Assignments
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-4 px-2 text-xs font-bold transition whitespace-nowrap border-b-2 ${activeTab === 'ai' ? 'border-purple-500 text-white bg-purple-500/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              Ask AI
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

            {/* 1. SYLLABUS TAB (Module Accordion) */}
            {activeTab === 'syllabus' && (
              <div className="space-y-4">
                <div className="mb-6 px-1">
                  <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-3">Course Modules</h4>
                  {/* Sidebar Progress mini */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">{completedCount}/{totalCount}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.keys(modules).map((moduleName, modIdx) => (
                    <div key={modIdx} className="rounded-xl border border-white/5 bg-[#111] overflow-hidden">
                      {/* Module Header (Accordion Toggle) */}
                      <button
                        onClick={() => toggleModule(moduleName)}
                        className="w-full p-4 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] transition"
                      >
                        <div className="text-left">
                          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">Section {modIdx + 1}</p>
                          <h4 className="text-sm font-bold text-white">{moduleName}</h4>
                        </div>
                        {expandedModules[moduleName] ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>

                      {/* Module Lessons List */}
                      {expandedModules[moduleName] && (
                        <div className="p-2 space-y-1 bg-black/20 border-t border-white/5">
                          {modules[moduleName].map((lesson: any, lessonIdx: number) => {
                            const isUnlocked = unlockedLessonIds.has(lesson.id);
                            const isActive = activeLesson?.id === lesson.id;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => selectLesson(lesson, isUnlocked)}
                                className={`w-full p-3 rounded-lg text-left transition flex items-start gap-3 group
                                  ${isActive ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-transparent border border-transparent'}
                                  ${isUnlocked ? 'hover:bg-white/5 cursor-pointer' : 'opacity-50 cursor-not-allowed grayscale'}
                                `}
                              >
                                {/* Status Icon */}
                                <div className="mt-0.5">
                                  {lesson.isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                  ) : !isUnlocked && !lesson.isFree ? (
                                    <Lock className="w-4 h-4 text-gray-600" />
                                  ) : isActive ? (
                                    <Play className="w-4 h-4 text-purple-400 fill-purple-400" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                  <h5 className={`text-xs font-bold line-clamp-2 ${isActive ? 'text-purple-100' : isUnlocked ? 'text-gray-200' : 'text-gray-500'}`}>
                                    {lessonIdx + 1}. {lesson.title}
                                  </h5>
                                  <div className="flex items-center justify-between mt-1.5">
                                    <span className="text-[9px] text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {lesson.duration ? Math.round(lesson.duration / 60) + ' min' : 'Video'}
                                    </span>
                                    {lesson.isFree && !isEnrolled && (
                                      <span className="text-[9px] font-bold text-green-400 uppercase bg-green-400/10 px-1.5 py-0.5 rounded">Preview</span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1B. QUIZ TAB */}
            {activeTab === 'quiz' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20">
                  <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-2 mb-2">
                    <ListChecks className="w-4 h-4" /> Course Quizzes
                  </p>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Test your knowledge at the end of sections. Submit answers to receive instant scoring and save your attempt history.
                  </p>
                </div>

                {quizzes.length === 0 ? (
                  <div className="p-6 rounded-xl border border-white/5 bg-white/5 text-center flex flex-col items-center">
                    <ListChecks className="w-8 h-8 text-gray-600 mb-3" />
                    <span className="text-xs text-gray-400">No quizzes available for this course yet.</span>
                  </div>
                ) : quizzes.map((quiz: any) => (
                  <div key={quiz.id} className="p-5 rounded-2xl border border-white/10 bg-[#111] shadow-lg space-y-5">
                    <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">{quiz.title}</h4>
                        <p className="text-xs text-purple-400 mt-1 font-medium">{quiz.questionCount} questions · pass {quiz.passingScore}%</p>
                      </div>
                      {quizResults[quiz.id] && (
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-black shadow-sm ${quizResults[quiz.id].passed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                          {quizResults[quiz.id].score.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {(quiz.questions || []).map((question: any, index: number) => (
                        <div key={question.id} className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-3">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-indigo-500/20 text-[10px] text-indigo-300 font-bold">
                              {index + 1}
                            </span>
                            <p className="text-sm text-gray-200 font-medium leading-relaxed pt-0.5">{question.questionText}</p>
                          </div>

                          <div className="space-y-2 pl-9">
                            {(question.options || []).map((option: string, optionIndex: number) => (
                              <label key={optionIndex} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer text-xs
                                ${quizAnswers[quiz.id]?.[question.id] === optionIndex
                                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-100'
                                  : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-300'}`}
                              >
                                <input
                                  type="radio"
                                  name={`quiz-${quiz.id}-question-${question.id}`}
                                  checked={quizAnswers[quiz.id]?.[question.id] === optionIndex}
                                  onChange={() => handleQuizAnswerChange(quiz.id, question.id, optionIndex)}
                                  className="accent-indigo-500 w-3.5 h-3.5"
                                />
                                <span className="font-medium">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {quiz.timeLimitSeconds ? Math.round(quiz.timeLimitSeconds / 60) + ' min limit' : 'No time limit'}
                      </p>
                      <button
                        onClick={() => handleSubmitQuiz(quiz.id)}
                        disabled={quizSubmittingId === quiz.id}
                        className="px-5 py-2.5 rounded-lg bg-white text-black text-xs font-black hover:bg-gray-200 transition disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-white/10"
                      >
                        {quizSubmittingId === quiz.id ? 'Submitting...' : 'Submit Answers'}
                      </button>
                    </div>

                    {quizResults[quiz.id] && (
                      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 mt-4
                        ${quizResults[quiz.id].passed ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-200' : 'bg-red-900/20 border-red-500/30 text-red-200'}`}>
                        <div>
                          <p className="font-black text-sm">{quizResults[quiz.id].passed ? '🎉 Passed Successfully!' : '❌ Did not pass'}</p>
                          <p className="text-xs mt-1 opacity-80">Score: {quizResults[quiz.id].score.toFixed(1)}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold bg-black/40 px-3 py-1.5 rounded-lg">
                            {(quizResults[quiz.id].results || []).filter((item: any) => item.correct).length} / {quizResults[quiz.id].results?.length || 0} Correct
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 1C. ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/20">
                  <p className="text-xs uppercase tracking-widest text-purple-400 font-bold flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" /> Course Assignments
                  </p>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Apply what you&apos;ve learned with hands-on assignments. Submissions are graded by your instructor.
                  </p>
                </div>

                {assignments.length === 0 ? (
                  <div className="p-6 rounded-xl border border-white/5 bg-white/5 text-center flex flex-col items-center">
                    <FileText className="w-8 h-8 text-gray-600 mb-3" />
                    <span className="text-xs text-gray-400">No assignments for this course yet.</span>
                  </div>
                ) : assignments.map((assignment: any) => (
                  <div key={assignment.id} className="p-5 rounded-2xl border border-white/10 bg-[#111] shadow-lg space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{assignment.title}</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{assignment.description}</p>
                      </div>
                      <span className={`shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded ${assignment.status === 'submitted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                        {assignment.status === 'submitted' ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4 text-gray-400" /> Due in {assignment.dueInDays} days · {assignment.maxScore} pts
                      </p>
                      <button
                        onClick={() => handleSubmitAssignment(assignment.id)}
                        disabled={assignment.status === 'submitted'}
                        className="px-4 py-2 rounded-lg bg-white text-black text-xs font-black hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {assignment.status === 'submitted' ? 'Submitted' : 'Submit Assignment'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. ASK AI TAB */}
            {activeTab === 'ai' && (
              <div className="flex flex-col h-full">

                {/* AI Assistant Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 text-center mb-4">
                  <span className="text-xs font-black text-purple-300 flex items-center justify-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Context-Aware AI Tutor
                  </span>
                  <p className="text-[10px] text-purple-200/60 leading-relaxed max-w-[200px] mx-auto">
                    I scan active subtitles & transcripts to resolve your coding doubts instantly.
                  </p>
                </div>

                {/* AI Chat History */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar mb-4" style={{ minHeight: '300px' }}>
                  {aiHistory.length === 0 && !aiLoading && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                      <Brain className="w-12 h-12 text-gray-500" />
                      <p className="text-xs text-gray-400 max-w-[200px]">Ask me to summarize this lesson, explain a concept, or provide code examples.</p>
                    </div>
                  )}
                  {aiHistory.map((chat, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[90%] shadow-sm ${chat.role === 'user' ? 'bg-purple-600 border border-purple-500 ml-auto text-right text-white font-medium rounded-tr-sm' : 'bg-white/10 border border-white/5 text-gray-200 rounded-tl-sm'}`}>
                      {chat.content}
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-400 rounded-tl-sm w-[80%]">
                      <div className="flex gap-1 items-center h-4">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Input */}
                <form onSubmit={handleAskAi} className="flex gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder="Ask a question about the video..."
                    className="flex-1 px-4 py-3 rounded-xl bg-black border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                    value={aiMessage}
                    onChange={e => setAiMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!aiMessage.trim() || aiLoading}
                    className="w-12 h-12 shrink-0 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/50"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ═══════════════ CHECKOUT MODAL ═══════════════ */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
            {/* Gradient accent top */}
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500" />

            <div className="p-7">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    {checkoutStep === 'input' && 'Complete Purchase'}
                    {checkoutStep === 'processing' && 'Processing Payment…'}
                    {checkoutStep === 'success' && '🎉 Payment Successful!'}
                    {checkoutStep === 'failure' && '❌ Payment Failed'}
                  </h2>
                  {checkoutStep === 'input' && (
                    <p className="text-xs text-gray-500 mt-0.5">{course?.title}</p>
                  )}
                </div>
                {checkoutStep !== 'processing' && (
                  <button
                    onClick={() => { setShowCheckoutModal(false); setCheckoutStep('input'); }}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                  >✕</button>
                )}
              </div>

              {/* ── STEP 1: Input ── */}
              {checkoutStep === 'input' && (
                <div className="space-y-5">
                  {/* Price summary */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Course Price</span>
                      <span className="text-white font-semibold">₹{course?.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    {discountPercentage > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">Coupon Discount ({discountPercentage}%)</span>
                        <span className="text-green-400 font-semibold">−₹{((course?.price || 0) * discountPercentage / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-white/5 pt-2 flex justify-between font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-purple-400 text-lg">₹{Math.max(0, (course?.price || 0) * (1 - discountPercentage / 100)).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Coupon code */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. LUMINA50 or FREEPASS"
                        className="flex-1 px-4 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition"
                        value={checkoutCoupon}
                        onChange={e => setCheckoutCoupon(e.target.value.toUpperCase())}
                      />
                      <button
                        onClick={() => {
                          // Locally-validated demo coupons — no backend call
                          if (checkoutCoupon === 'LUMINA50') { setAppliedCoupon('LUMINA50'); setDiscountPercentage(50); }
                          else if (checkoutCoupon === 'FREEPASS') { setAppliedCoupon('FREEPASS'); setDiscountPercentage(100); }
                          else alert('Invalid coupon code.');
                        }}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition"
                      >Apply</button>
                    </div>
                    {appliedCoupon && <p className="text-xs text-green-400 mt-1.5">✓ Coupon <strong>{appliedCoupon}</strong> applied — {discountPercentage}% off!</p>}
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['card', 'upi', 'wallet', 'netbanking'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${paymentMethod === m ? 'border-purple-500 bg-purple-500/10 text-purple-300' : 'border-white/10 bg-white/3 text-gray-400 hover:border-white/20'}`}
                        >
                          {m === 'card' ? '💳 Card' : m === 'upi' ? '🔑 UPI' : m === 'wallet' ? '👜 Wallet' : '🏦 Net Banking'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card fields (shown when card is selected) */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3">
                      <input type="text" placeholder="Card Number (1234 5678 9012 3456)" maxLength={19}
                        className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition" />
                      <div className="flex gap-3">
                        <input type="text" placeholder="MM / YY" maxLength={5}
                          className="flex-1 px-4 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition" />
                        <input type="text" placeholder="CVV" maxLength={3}
                          className="flex-1 px-4 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition" />
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'upi' && (
                    <input type="text" placeholder="Enter UPI ID (e.g. name@upi)"
                      className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition" />
                  )}

                  <button
                    onClick={executePayment}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-purple-900/50 transition-all active:scale-[0.98]"
                  >
                    {discountPercentage === 100
                      ? '🎁 Enroll for Free (100% Off)'
                      : `Pay ₹${Math.max(0, (course?.price || 0) * (1 - discountPercentage / 100)).toFixed(2)} →`}
                  </button>
                  <p className="text-center text-[10px] text-gray-600">🔒 Secured by 256-bit SSL encryption. Payments are simulated.</p>
                </div>
              )}

              {/* ── STEP 2: Processing ── */}
              {checkoutStep === 'processing' && (
                <div className="flex flex-col items-center justify-center py-12 gap-5">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="text-white font-semibold">Verifying payment…</p>
                    <p className="text-xs text-gray-500 mt-1">Please do not close this window</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {['Connecting to gateway', 'Authorizing', 'Confirming'].map((s, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-gray-500 border border-white/5 animate-pulse" style={{ animationDelay: `${i * 400}ms` }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Success ── */}
              {checkoutStep === 'success' && transactionDetails && (
                <div className="space-y-5">
                  <div className="flex flex-col items-center gap-3 text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-white font-bold text-lg">You're enrolled!</p>
                    <p className="text-xs text-gray-400">A payment receipt has been saved to your dashboard.</p>
                  </div>

                  {/* Receipt */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400"><span>Transaction ID</span><span className="text-white font-mono">{transactionDetails.transactionId}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Amount Paid</span><span className="text-white">₹{transactionDetails.amount?.toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Discount Applied</span><span className="text-green-400">{transactionDetails.discountApplied ? `${discountPercentage}%` : 'None'}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Payment Method</span><span className="text-white capitalize">{transactionDetails.method}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Date</span><span className="text-white">{transactionDetails.date}</span></div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold text-gray-300 transition"
                    >🖨 Print Receipt</button>
                    <button
                      onClick={() => { setShowCheckoutModal(false); setCheckoutStep('input'); }}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold text-white transition"
                    >Start Learning →</button>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Failure ── */}
              {checkoutStep === 'failure' && (
                <div className="space-y-5">
                  <div className="flex flex-col items-center gap-3 text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-4xl">❌</div>
                    <p className="text-white font-bold">Payment could not be processed</p>
                    <p className="text-xs text-gray-500 max-w-xs">Please check your payment details or try a different method. No amount has been deducted.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCheckoutStep('input')}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold text-white transition"
                    >Try Again</button>
                    <button
                      onClick={() => { setShowCheckoutModal(false); setCheckoutStep('input'); }}
                      className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold text-gray-300 transition"
                    >Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ CERTIFICATE MODAL ═══════════════ */}
      {showCertificateModal && certificateDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
          <div className="relative bg-[#080808] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 w-full" />

            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-3">
                  <Award className="w-6 h-6 text-yellow-400" /> Certificate of Completion
                </h2>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >✕</button>
              </div>

              {/* Certificate Preview */}
              <div id="certificate-print-area" className="bg-gradient-to-br from-[#0f0a2e] via-[#1a0a3e] to-[#0a0f2e] border-2 border-yellow-400/30 rounded-2xl p-8 relative overflow-hidden">
                {/* Decorative bg pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />

                <div className="relative z-10 text-center space-y-4">
                  <div className="flex justify-center mb-2">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl shadow-yellow-500/30">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-yellow-400/80 uppercase tracking-[0.3em] font-semibold">LuminaLearn Academy</p>
                  <h3 className="text-2xl font-black text-white">Certificate of Completion</h3>
                  <p className="text-sm text-gray-400">This certifies that</p>
                  <p className="text-3xl font-extrabold text-yellow-400 py-1">{certificateDetails.studentName || 'Student'}</p>
                  <p className="text-sm text-gray-400">has successfully completed</p>
                  <p className="text-xl font-bold text-white">{certificateDetails.courseTitle || course?.title}</p>
                  <p className="text-xs text-gray-500">Instructed by <span className="text-gray-300">{certificateDetails.instructorName || 'Dr. Alex Carter'}</span></p>
                  <div className="flex justify-center gap-6 pt-4 border-t border-yellow-400/10 mt-4">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Date Issued</p>
                      <p className="text-sm text-white font-bold mt-0.5">{certificateDetails.issueDate ? new Date(certificateDetails.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Certificate ID</p>
                      <p className="text-sm text-white font-mono font-bold mt-0.5">{certificateDetails.certificateId || 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Blockchain Verified</p>
                      <p className="text-[10px] text-green-400 font-mono mt-0.5 max-w-[100px] truncate">{certificateDetails.blockchainTxHash || '0x' + Math.random().toString(16).substr(2, 20)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => {
                    const printContents = document.getElementById('certificate-print-area')?.innerHTML;
                    const win = window.open('', '_blank');
                    if (win && printContents) {
                      win.document.write(`<html><head><title>Certificate - ${course?.title}</title><style>
                        body { background: #0a0a1a; color: white; font-family: sans-serif; display:flex; justify-content:center; padding:40px; }
                        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        @page { size: A4 landscape; margin: 20mm; }
                      </style></head><body>${printContents}</body></html>`);
                      win.document.close();
                      win.print();
                    }
                  }}
                  className="flex-1 min-w-[120px] py-3 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold text-gray-300 transition flex items-center justify-center gap-2"
                >🖨 Print / Download PDF</button>
                <a
                  href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificateDetails.courseTitle || course?.title || '')}&organizationName=LuminaLearn&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth() + 1}&certUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&certId=${certificateDetails.certificateId || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px] py-3 bg-[#0077b5] hover:bg-[#0099d4] rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  Add to LinkedIn
                </a>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="flex-1 min-w-[100px] py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 rounded-xl text-xs font-bold text-white transition"
                >Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
