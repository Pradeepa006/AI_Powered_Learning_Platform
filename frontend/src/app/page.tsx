'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Award, Zap, Brain, Play, Shield, 
  Terminal, Search, BookOpen, Star, User, 
  ChevronRight, Code, FileText, Compass, CheckCircle 
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout } from '@/redux/authSlice';
import { RootState } from '@/redux/store';
import api from '@/utils/api';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';

export default function LandingPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { data: session } = useSession();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [authError, setAuthError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // When a Google OAuth session arrives from NextAuth, sync it into Redux
  useEffect(() => {
    if (session && (session as any).backendJwt && !isAuthenticated) {
      dispatch(setCredentials({
        token: (session as any).backendJwt,
        user: {
          id: (session as any).userId,
          name: session.user?.name || '',
          email: session.user?.email || '',
          role: (session as any).userRole || 'STUDENT',
          xpPoints: 0,
          currentStreak: 0,
          profilePhoto: session.user?.image || undefined,
        },
      }));
      setShowAuthModal(false);
    }
  }, [session, isAuthenticated, dispatch]);


  useEffect(() => {
    // Load public courses
    api.get('/courses/public/search')
      .then(res => setCourses(res.data))
      .catch(() => {
        // Fallback static mock courses if API not running yet
        setCourses([
          {
            id: 1,
            title: "Next-Generation Artificial Intelligence",
            subtitle: "From foundational machine learning to state-of-the-art transformers and LLMs.",
            price: 99.99,
            discountPrice: 49.99,
            averageRating: 4.8,
            category: "AI",
            thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop"
          },
          {
            id: 2,
            title: "Next.js 15 & React 19 Fullstack Development",
            subtitle: "Master App Router, Server Actions, Suspense, and edge functions.",
            price: 129.99,
            discountPrice: 79.99,
            averageRating: 4.9,
            category: "Web Development",
            thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop"
          }
        ]);
      });
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authType === 'login') {
        const res = await api.post('/auth/login', { email, password });
        dispatch(setCredentials(res.data));
        setShowAuthModal(false);
      } else {
        await api.post('/auth/signup', { name, email, password, role });
        // Automatically login after signup
        const res = await api.post('/auth/login', { email, password });
        dispatch(setCredentials(res.data));
        setShowAuthModal(false);
      }
    } catch (err: any) {
      setAuthError(err.response?.data || 'Authentication failed. Please check credentials.');
    }
  };

  const executeSearch = () => {
    api.get(`/courses/public/search?query=${searchQuery}`)
      .then(res => setCourses(res.data))
      .catch(() => {});
  };

  return (
    <div className="relative min-h-screen bg-[#020205] text-gray-100 selection:bg-purple-600/40">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
              LUMINA<span className="text-purple-400">LEARN</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#features" className="hover:text-purple-400 transition">Features</Link>
            <Link href="#courses" className="hover:text-purple-400 transition">Explore Courses</Link>
            <Link href="#pricing" className="hover:text-purple-400 transition">Pricing</Link>
            <Link href="/ai-tutor" className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition">
              <Sparkles className="w-4 h-4" /> AI Sandbox
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="px-4 h-9 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition flex items-center text-sm font-semibold">
                  Dashboard
                </Link>
                <button 
                  onClick={() => dispatch(logout())}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => { setAuthType('login'); setShowAuthModal(true); }}
                  className="text-sm font-medium text-gray-300 hover:text-white transition"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthType('signup'); setShowAuthModal(true); }}
                  className="px-4 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 shadow-md shadow-purple-600/20 transition"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-white/5 text-purple-400 text-xs font-semibold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation AI-Powered Academy
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-100 to-gray-400"
          >
            Empower Your Mind With <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Personalized AI Tutors
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            LuminaLearn merges premium video courses with dedicated AI Assistants. Get instant code debugging, simulated mock interviews, ATS resume scoring, and customized roadmaps.
          </motion.p>

          {/* Search bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-xl mx-auto flex items-center gap-2 p-1.5 rounded-xl glass border-white/10 mb-14"
          >
            <div className="flex items-center gap-2 flex-1 pl-3">
              <Search className="w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search programming, Next.js, Machine learning..."
                className="bg-transparent border-0 outline-none w-full text-sm text-white placeholder-gray-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && executeSearch()}
              />
            </div>
            <button 
              onClick={executeSearch}
              className="px-5 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-gray-200 transition"
            >
              Search
            </button>
          </motion.div>

          {/* Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-y border-white/5 py-8 text-left">
            <div>
              <h4 className="text-3xl font-extrabold text-white">99%</h4>
              <p className="text-xs text-gray-500 mt-1">Course completion rates with AI coaching</p>
            </div>
            <div>
              <h4 className="text-3xl font-extrabold text-white">10k+</h4>
              <p className="text-xs text-gray-500 mt-1">Active learners building code portfolios</p>
            </div>
            <div>
              <h4 className="text-3xl font-extrabold text-white">&lt;2s</h4>
              <p className="text-xs text-gray-500 mt-1">Average response time for tutor chat</p>
            </div>
            <div>
              <h4 className="text-3xl font-extrabold text-white">4.9★</h4>
              <p className="text-xs text-gray-500 mt-1">Student review score across platforms</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Grid Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            More Advanced Than Traditional Platforms
          </h2>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">
            Traditional videos are static. LuminaLearn is alive. We inject AI smart assistants at every turn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl glass-card flex flex-col justify-between border-purple-500/10 hover:border-purple-500/30 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">24/7 Contextual AI Tutor</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Every video includes a side-aligned AI panel that reads the active video transcripts. Ask it to explain complicated terms, generate summary notes, or quiz you.
              </p>
            </div>
            <Link href="/ai-tutor" className="text-xs text-purple-400 font-semibold flex items-center gap-1 hover:underline">
              Launch Tutor Sandbox <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl glass-card flex flex-col justify-between border-cyan-500/10 hover:border-cyan-500/30 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                <Terminal className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Interactive Playground</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Write code (Java, Python, C++, JS) directly inside the browser. Compile it in real time, run test cases, and trigger deep AI Code Reviews for algorithmic design checks.
              </p>
            </div>
            <Link href="/ai-tutor?tab=playground" className="text-xs text-cyan-400 font-semibold flex items-center gap-1 hover:underline">
              Try Coding Sandbox <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl glass-card flex flex-col justify-between border-pink-500/10 hover:border-pink-500/30 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">ATS CV Scorer & Interview Coach</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Upload your resume to retrieve keyword updates. Take mock speaking interviews for HR, Technical, and System Design jobs and receive scores for speaking pace and accuracy.
              </p>
            </div>
            <Link href="/ai-tutor?tab=resume" className="text-xs text-pink-400 font-semibold flex items-center gap-1 hover:underline">
              Check CV score <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Premium Content</span>
            <h2 className="text-3xl font-bold text-white mt-1">Trending Curriculums</h2>
          </div>
          <p className="text-sm text-gray-500 max-w-sm mt-3 md:mt-0">
            Curated, fully detailed learning paths taught by elite industry instructors and expanded by AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="rounded-2xl glass-card overflow-hidden group hover:border-purple-500/20 transition duration-300 flex flex-col">
              <div className="h-44 relative bg-gray-900 overflow-hidden">
                {course.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-cyan-900/40 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-gray-700" />
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-semibold text-purple-400">
                  {course.category}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-purple-300 transition duration-300">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {course.subtitle}
                  </p>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs font-semibold mb-4">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{course.averageRating}</span>
                    <span className="text-gray-500 font-normal ml-1">(120 reviews)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-extrabold text-white">${course.discountPrice || course.price}</span>
                    {course.discountPrice && (
                      <span className="text-xs text-gray-500 line-through">${course.price}</span>
                    )}
                  </div>
                  <Link 
                    href={isAuthenticated ? `/dashboard` : '#'} 
                    onClick={() => !isAuthenticated && setShowAuthModal(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 text-xs font-semibold hover:bg-purple-600 hover:text-white transition duration-200"
                  >
                    View Curriculum
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing / Subscriptions */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5 text-center">
        <div className="mb-14">
          <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Flexible Pricing</span>
          <h2 className="text-3xl font-bold text-white mt-1">Unlock Lifetime Learning</h2>
        </div>

        <div className="max-w-md mx-auto p-8 rounded-2xl glass border-purple-500/20 relative shadow-2xl shadow-purple-500/5">
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-purple-600 text-[10px] font-bold uppercase tracking-wider text-white">
            Recommended Plan
          </div>
          <h3 className="text-xl font-bold text-white mb-2">All-Access Premium Pass</h3>
          <p className="text-xs text-gray-400 mb-6">Gain full access to all courses, AI tools, certificates, and code playground runs.</p>
          
          <div className="flex items-baseline justify-center gap-1.5 mb-8">
            <span className="text-4xl font-extrabold text-white">$29</span>
            <span className="text-xs text-gray-500">/ month</span>
          </div>

          <ul className="text-left text-xs text-gray-300 space-y-4 mb-8">
            <li className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Full curriculum access to 100+ projects</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Unlimited AI Tutor chat runs & explanations</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Interactive coding sandbox compilations</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Automated certificate issuance & verification</span>
            </li>
          </ul>

          <button 
            onClick={() => {
              if (isAuthenticated) {
                alert("Subscribed in Sandbox Mode!");
              } else {
                setAuthType('signup');
                setShowAuthModal(true);
              }
            }}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs hover:opacity-90 transition"
          >
            Start Learning Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-wider text-white">LUMINA<span className="text-purple-400">LEARN</span></span>
          </div>
          <p className="text-xs text-gray-500">© 2026 LuminaLearn. Designed for Next-Generation engineers.</p>
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Help Center</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            {/* dialog */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm p-8 rounded-2xl glass shadow-2xl border-white/10"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {authType === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                {authType === 'login' ? 'Login to continue your learning streak.' : 'Register to unlock your interactive AI Tutor.'}
              </p>

              {authError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authType === 'signup' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none"
                    placeholder="student@platform.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Password</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>

                {authType === 'signup' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Role</label>
                    <select 
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                    >
                      <option value="STUDENT" className="bg-black text-white">Student</option>
                      <option value="INSTRUCTOR" className="bg-black text-white">Instructor</option>
                    </select>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-gray-200 transition"
                >
                  {authType === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* ─── Google OAuth Button ───────────────────────────── */}
              <button
                type="button"
                id="google-signin-btn"
                disabled={googleLoading}
                onClick={async () => {
                  setGoogleLoading(true);
                  setAuthError('');
                  try {
                    await signIn('google', { callbackUrl: '/' });
                  } catch {
                    setAuthError('Google sign-in failed. Please try again.');
                    setGoogleLoading(false);
                  }
                }}
                className="mt-3 w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition duration-200 group"
              >
                {googleLoading ? (
                  <svg className="w-4 h-4 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span className="text-xs font-semibold text-gray-200 group-hover:text-white transition">
                  {googleLoading ? 'Redirecting...' : 'Continue with Google'}
                </span>
              </button>

              <div className="mt-5 text-center text-xs text-gray-400">
                {authType === 'login' ? (
                  <p>Don&apos;t have an account? <button onClick={() => setAuthType('signup')} className="text-purple-400 font-semibold hover:underline">Sign Up</button></p>
                ) : (
                  <p>Already have an account? <button onClick={() => setAuthType('login')} className="text-purple-400 font-semibold hover:underline">Sign In</button></p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
