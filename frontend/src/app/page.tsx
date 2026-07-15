'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Award, Zap, Brain, Play, Shield,
  Terminal, Search, BookOpen, Star, User,
  ChevronRight, Code, FileText, Compass, CheckCircle, Heart
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux'; // Keep useDispatch and useSelector
import { login, logout } from '@/redux/authSlice'; // Changed setCredentials to login
import { RootState } from '@/redux/store';
import api from '@/utils/api';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';
import { mockCourses } from '@/lib/mockData/courses';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import CourseListSkeleton from '@/components/CourseListSkeleton';
import EmptyState from '@/components/EmptyState';

interface Course {
  id: number;
  thumbnailUrl?: string;
  title: string;
  price?: number;
  discountPrice?: number;
  category: string;
  subtitle: string;
  difficulty: string;
  language: string;
  averageRating?: number;
}

export default function LandingPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { data: session } = useSession();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [authError, setAuthError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nova_wishlist');
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const toggleWishlist = (courseId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated;
    if (wishlist.includes(courseId)) {
      updated = wishlist.filter(id => id !== courseId);
    } else {
      updated = [...wishlist, courseId];
    }
    setWishlist(updated);
    localStorage.setItem('nova_wishlist', JSON.stringify(updated));
  };

  // When a Google OAuth session arrives from NextAuth, sync it into Redux
  useEffect(() => {
    if (session && (session as any).backendJwt && !isAuthenticated) {
      dispatch(login({
        id: (session as any).userId,
        name: session.user?.name || '',
        email: session.user?.email || '',
        role: (session as any).userRole || 'STUDENT',
        xpPoints: 0,
        currentStreak: 0,
        profilePhoto: session.user?.image || undefined,
      }));
      setShowAuthModal(false);
    }
  }, [session, isAuthenticated, dispatch]);

  useEffect(() => {
    setLoading(true);
    // Load public courses
    api.get('/courses/public/search')
      .then(res => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback static mock courses if API not running yet
        setCourses(mockCourses);
        setLoading(false);
      });
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // --- TEMPORARY: Allow all users to log in for testing purposes ---
    if (process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
      console.warn("TEST_MODE enabled: Bypassing actual authentication for testing.");
      dispatch(login({
        id: 'test-user-id',
        name: name || email.split('@')[0] || 'Test User', // Use provided name/email or default
        email: email || 'test@example.com',
        role: role as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN', // Or 'INSTRUCTOR' if needed for testing instructor features
        xpPoints: 100, currentStreak: 5, profilePhoto: undefined,
      }));
      setShowAuthModal(false);
      return; // Exit early if in test mode
    }
    // --- END TEMPORARY BLOCK ---

    // Original authentication logic (only runs if not in test mode)
    try {
      if (authType === 'login') {
        const res = await api.post('/auth/login', { email, password });
        dispatch(login(res.data)); // Changed setCredentials to login
        setShowAuthModal(false);
      } else { // authType === 'signup'
        await api.post('/auth/signup', { name, email, password, role });
        // Automatically login after signup
        const res = await api.post('/auth/login', { email, password });
        dispatch(login(res.data)); // Changed setCredentials to login
        setShowAuthModal(false);
      }
    } catch (err: any) {
      setAuthError(err.response?.data || 'Authentication failed. Please check credentials.');
    }
  }; // Correct closing brace for handleAuthSubmit

  const executeSearch = () => {
    setLoading(true);
    api.get(`/courses/public/search?query=${searchQuery}`)
      .then(res => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch(() => {
        setCourses([]);
        setLoading(false);
      });
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-purple-600/40">
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none" />

      <Navbar setShowAuthModal={setShowAuthModal} setAuthType={setAuthType} />

      <Hero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        executeSearch={executeSearch}
      />

      <Features />

      {/* Courses Section */}
      <section id="courses" className="py-20 px-6 max-w-7xl mx-auto border-t border-card-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Premium Content</span>
            <h2 className="text-3xl font-bold text-foreground mt-1">Trending Curriculums</h2>
          </div>
          <p className="text-sm text-gray-500 max-w-sm mt-3 md:mt-0">
            Curated, fully detailed learning paths taught by elite industry instructors and expanded by AI.
          </p>
        </div>

        {loading ? <CourseListSkeleton /> : (
          courses.length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(showAllCourses ? courses : courses.slice(0, 6)).map((course) => (
                <Link key={course.id} href={isAuthenticated ? `/course/${course.id}` : '#'} onClick={() => !isAuthenticated && setShowAuthModal(true)}>
                  <div className="rounded-2xl glass-card overflow-hidden group hover:border-purple-500/20 transition duration-300 flex flex-col relative h-full">
                    <div className="h-44 relative bg-gray-900 overflow-hidden" style={{ position: 'relative' }}>
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl} // Directly use course.thumbnailUrl
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: 'cover' }}
                          className="group-hover:scale-105 transition duration-500"
                        />
                      ) : ( // Fallback if thumbnailUrl is null/undefined
                        <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-cyan-900/40 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-gray-700" />
                        </div>
                      )}
                      {/* Free vs Premium Badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider z-10">
                        {(!course.price || course.price === 0) ? (
                          <span className="text-emerald-400">Free</span>
                        ) : (
                          <span className="text-yellow-500">Premium</span>
                        )}
                      </div>
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-semibold text-purple-400">
                        {course.category}
                      </div>
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => toggleWishlist(course.id, e)}
                        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 text-gray-400 hover:text-red-500 hover:scale-110 transition active:scale-95 z-20"
                      >
                        <Heart className={`w-4.5 h-4.5 ${wishlist.includes(course.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2 leading-snug group-hover:text-purple-300 transition duration-300">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                          {course.subtitle}
                        </p>

                        {/* Detailed Metadata Row */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          <span className="bg-white/5 px-2 py-0.5 rounded border-card-border">{course.difficulty || 'Beginner'}</span>
                          <span className="bg-white/5 px-2 py-0.5 rounded border-card-border">{course.language || 'English'}</span>
                          <span>· 12 hrs</span>
                        </div>

                        <div className="flex items-center gap-1 text-yellow-500 text-xs font-semibold mb-4">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{course.averageRating || '4.8'}</span>
                          <span className="text-gray-500 font-normal ml-1">(120 reviews)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-card-border">
                        <div className="flex items-baseline gap-1.5">
                          {(!course.price || course.price === 0) ? (
                            <span className="text-lg font-extrabold text-emerald-400">Free</span>
                          ) : (
                            <>
                              <span className="text-lg font-extrabold text-foreground">${course.discountPrice || course.price}</span>
                              {course.discountPrice && (
                                <span className="text-xs text-gray-500 line-through">${course.price}</span>
                              )}
                            </>
                          )}
                        </div>
                        <div
                          className="px-3.5 py-1.5 rounded-lg bg-white/10 text-xs font-semibold group-hover:bg-purple-600 group-hover:text-white transition duration-200"
                        >
                          View Curriculum
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
             {courses.length > 6 && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setShowAllCourses(!showAllCourses)}
                  className="px-6 py-2.5 rounded-lg bg-white/10 text-xs font-semibold hover:bg-purple-600 hover:text-white transition duration-200"
                >
                  {showAllCourses ? 'Show Less' : 'View All Courses'}
                </button>
              </div>
            )}
            </>
          ) : (
            <EmptyState message="Try adjusting your search query." />
          )
        )}
      </section>

      {/* Pricing / Subscriptions */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto border-t border-card-border text-center">
        <div className="mb-14">
          <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Flexible Pricing</span>
          <h2 className="text-3xl font-bold text-foreground mt-1">Unlock Lifetime Learning</h2>
        </div>

        <div className="max-w-md mx-auto p-8 rounded-2xl glass border-purple-500/20 relative shadow-2xl shadow-purple-500/5">
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-purple-600 text-[10px] font-bold uppercase tracking-wider text-white">
            Recommended Plan
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">All-Access Premium Pass</h3>
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
      <footer className="border-t border-card-border py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-wider text-foreground">NOVA<span className="text-purple-400">LEARN</span></span>
          </div>
          <p className="text-xs text-gray-500">© 2026 Nova Learn. Designed for Next-Generation engineers.</p>
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
              <h3 className="text-xl font-bold text-foreground mb-2">
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
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:border-purple-500 focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:border-purple-500 focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:border-purple-500 focus:outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>

                {authType === 'signup' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Role</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:border-purple-500 focus:outline-none"
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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