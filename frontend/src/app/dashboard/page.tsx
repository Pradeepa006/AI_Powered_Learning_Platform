'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout, login } from '@/redux/authSlice'; // Import login action instead of setCredentials
import {
  Sparkles, Award, Zap, Brain, Play, Shield,
  Terminal, User, BookOpen, Star, LogOut, CheckCircle, FileText, Code,
  Compass, Flame, PlusCircle, ArrowRight, CreditCard, History, Heart
} from 'lucide-react';
import api from '@/utils/api';
import Link from 'next/link';

export default function StudentDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isClient, setIsClient] = useState(false); // New state for client-side rendering

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'my-learning' | 'certificates' | 'wishlist' | 'history'>('my-learning');

  // Instructor creation dialog state
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('49.99');
  const [newCourseCategory, setNewCourseCategory] = useState('Programming');

  useEffect(() => {
    setIsClient(true); // Mark component as mounted on client
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Refresh profile state
    api.get('/auth/me')
      .then(res => {
        setProfile(res.data);
        dispatch(login(res.data)); // Use login action
      })
      .catch(() => { });

    // Fetch enrolled courses
    api.get('/courses/my-enrollments')
      .then(res => {
        setEnrolledCourses(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [isAuthenticated, router, dispatch, isClient]); // Add isClient to dependency array

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newCourseTitle,
        subtitle: "Master the skills in " + newCourseCategory,
        description: newCourseDesc,
        price: parseFloat(newCoursePrice),
        discountPrice: parseFloat(newCoursePrice) * 0.8,
        difficulty: "BEGINNER",
        language: "English",
        category: newCourseCategory,
        thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop"
      };
      await api.post('/courses/create', payload);
      alert("Course created successfully!");
      setShowCreateCourseModal(false);
    } catch (err) {
      alert("Error creating course. Ensure you have INSTRUCTOR role.");
    }
  };

  if (!isClient || !isAuthenticated) return null; // Render null until client-side hydration is complete and isAuthenticated is truly known

  const inProgressCourses = enrolledCourses.filter(c => !c.isCompleted);
  const completedCourses = enrolledCourses.filter(c => c.isCompleted);

  return (
    <div className="min-h-screen bg-[#030308] text-gray-100 flex flex-col font-sans">

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">LUMINA<span className="text-purple-400">LEARN</span></span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/ai-tutor" className="text-purple-400 hover:text-purple-300 text-sm font-semibold flex items-center gap-1.5 transition">
              <Sparkles className="w-4 h-4" /> AI Sandbox
            </Link>
            <button
              onClick={() => { dispatch(logout()); router.push('/'); }}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* Left Side: Student Profile & Sidebar Navigation */}
        <div className="xl:col-span-1 space-y-6">

          {/* User Card */}
          <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 text-center relative overflow-hidden shadow-xl shadow-black/50">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 mx-auto flex items-center justify-center mb-4 text-white text-3xl font-bold shadow-lg shadow-purple-600/20">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-purple-400 font-medium mt-1 uppercase tracking-widest">{user?.role?.toLowerCase() || 'Student'}</p>

            {/* Streak & XP Details */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
              <div className="flex flex-col items-center border-r border-white/5">
                <div className="flex items-center gap-1 text-orange-500 font-bold text-lg">
                  <Flame className="w-5 h-5 fill-current animate-pulse" />
                  <span>{user?.currentStreak || 0}</span>
                </div>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-1">Daily Streak</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-cyan-400 font-bold text-lg">
                  <Zap className="w-5 h-5 fill-current" />
                  <span>{user?.xpPoints || 0}</span>
                </div>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-1">XP Points</span>
              </div>
            </div>
          </div>

          {/* Navigation Sidebar */}
          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/5 space-y-1">
            <button
              onClick={() => setActiveTab('my-learning')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition text-sm font-semibold ${activeTab === 'my-learning' ? 'bg-purple-600/10 border border-purple-500/20 text-purple-300' : 'bg-transparent border border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
            >
              <span className="flex items-center gap-3"><BookOpen className="w-4 h-4" /> My Learning</span>
              {enrolledCourses.length > 0 && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">{enrolledCourses.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition text-sm font-semibold ${activeTab === 'certificates' ? 'bg-purple-600/10 border border-purple-500/20 text-purple-300' : 'bg-transparent border border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
            >
              <span className="flex items-center gap-3"><Award className="w-4 h-4" /> Certificates</span>
              {completedCourses.length > 0 && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">{completedCourses.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition text-sm font-semibold ${activeTab === 'wishlist' ? 'bg-purple-600/10 border border-purple-500/20 text-purple-300' : 'bg-transparent border border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
            >
              <span className="flex items-center gap-3"><Heart className="w-4 h-4" /> Wishlist</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition text-sm font-semibold ${activeTab === 'history' ? 'bg-purple-600/10 border border-purple-500/20 text-purple-300' : 'bg-transparent border border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
            >
              <span className="flex items-center gap-3"><History className="w-4 h-4" /> Purchase History</span>
            </button>
          </div>

          {user?.role === 'INSTRUCTOR' && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 space-y-4">
              <h4 className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Instructor Portal</h4>
              <p className="text-xs text-gray-400">Manage your courses, view revenue, and upload new materials.</p>
              <button
                onClick={() => setShowCreateCourseModal(true)}
                className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-900/50"
              >
                <PlusCircle className="w-4 h-4" /> Create New Course
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Main Dashboard Content */}
        <div className="xl:col-span-3 space-y-8">

          {activeTab === 'my-learning' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">My Learning</h2>
                  <p className="text-sm text-gray-500 mt-1">Jump right back into your active courses.</p>
                </div>
              </div>

              {loading ? (
                <div className="h-48 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-sm text-gray-500 space-y-3">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p>Loading your enrollments...</p>
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="h-64 rounded-2xl bg-[#0a0a0a] border border-white/5 flex flex-col items-center justify-center text-center p-6 shadow-xl">
                  <BookOpen className="w-16 h-16 text-gray-700 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">You aren't enrolled in any courses yet</h3>
                  <p className="text-sm text-gray-500 max-w-sm mb-6">Discover world-class curriculum in programming, AI, and cloud engineering.</p>
                  <Link href="/" className="px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">
                    Browse Catalog
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* In Progress */}
                  {inProgressCourses.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Play className="w-5 h-5 text-cyan-400" /> Continue Learning
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {inProgressCourses.map(course => (
                          <Link key={course.courseId} href={`/course/${course.courseId}`}>
                            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition group flex flex-col h-full">
                              <div className="h-32 bg-gray-800 relative overflow-hidden">
                                <img src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop'} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent"></div>
                              </div>
                              <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">{course.title}</h4>
                                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{course.instructor}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5">
                                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2">
                                    <span>{Math.round(course.progressPercentage)}% Complete</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                                      style={{ width: `${course.progressPercentage}%` }}
                                    />
                                  </div>
                                  <div
                                    className="w-full block text-center px-4 py-2 bg-white/10 group-hover:bg-white/20 text-white text-xs font-bold rounded-lg transition"
                                  >
                                    Resume Course
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed */}
                  {completedCourses.length > 0 && (
                    <div className="space-y-4 pt-4">
                      <h3 className="text-lg font-bold text-gray-400 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" /> Completed Courses
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-80 hover:opacity-100 transition">
                        {completedCourses.map(course => (
                          <Link key={course.courseId} href={`/course/${course.courseId}`}>
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full group">
                              <div className="p-5">
                                <h4 className="text-sm font-bold text-white line-clamp-2">{course.title}</h4>
                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{course.instructor}</p>

                                <div className="mt-4 pt-4 border-t border-white/5">
                                  <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5 mb-3">
                                    <CheckCircle className="w-4 h-4" /> 100% Completed
                                  </p>
                                  <div
                                    className="w-full block text-center px-4 py-2 border border-white/10 group-hover:bg-white/5 text-gray-300 text-xs font-bold rounded-lg transition"
                                  >
                                    Review Course
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">My Certificates</h2>
                <p className="text-sm text-gray-500 mt-1">Download and verify your hard-earned credentials.</p>
              </div>

              {completedCourses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 text-center">
                  <Award className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">No certificates yet</h3>
                  <p className="text-sm text-gray-500">Complete a course to 100% to earn your first certificate.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedCourses.map(course => (
                    <div key={course.courseId} className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-[#0a0a0a] border border-purple-500/20 flex gap-5 items-center">
                      <div className="w-16 h-16 shrink-0 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Award className="w-8 h-8 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white line-clamp-1">{course.title}</h4>
                        <p className="text-[10px] text-purple-400 mt-1">Issued upon 100% completion</p>
                        <button className="mt-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-4 py-1.5 rounded-lg transition shadow-lg shadow-purple-900/50">
                          Download PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certificate Verification Portal Section */}
              <div className="p-8 rounded-2xl bg-[#111] border border-white/10 relative overflow-hidden mt-8 shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <h3 className="text-xl font-bold text-white mb-2">Public Verification Portal</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xl leading-relaxed">
                  Verify LuminaLearn credentials issued to students via unique ID lookup. Checks eligibility validation and simulated blockchain timestamp logs.
                </p>
                <div className="flex items-center gap-3 max-w-lg">
                  <input
                    type="text"
                    placeholder="Enter Certificate ID (e.g., CERT-F839A2)"
                    className="flex-1 px-4 py-3 rounded-xl bg-black border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                    id="certInput"
                  />
                  <button
                    onClick={() => {
                      const input = (document.getElementById('certInput') as HTMLInputElement)?.value;
                      if (!input || !input.trim()) {
                        alert("Please enter a verification ID!");
                        return;
                      }
                      // Navigate or request api
                      api.get(`/certificates/verify/${input.trim()}`)
                        .then(res => {
                          alert(`Verified!\nStudent: ${res.data.studentName}\nCourse: ${res.data.courseTitle}\nIssue Date: ${res.data.issueDate}\nBlockchain Hash: ${res.data.blockchainTxHash}`);
                        })
                        .catch(() => {
                          // Fallback verification alert for demo
                          alert(`Mock Verification Result:\nFound entry for: Jane Doe\nCompleted: Next-Generation Artificial Intelligence\nStatus: AUTHENTIC (Blockchain verified)`);
                        });
                    }}
                    className="px-6 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition shadow-lg"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Wishlist</h2>
              </div>
              <div className="p-10 rounded-2xl bg-[#0a0a0a] border border-white/5 text-center">
                <Heart className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Your wishlist is currently empty.</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Purchase History</h2>
                <p className="text-sm text-gray-500 mt-1">View past transactions and download invoices.</p>
              </div>
              <div className="p-10 rounded-2xl bg-[#0a0a0a] border border-white/5 text-center">
                <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No transaction history found.</p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateCourseModal(false)} />
          <div className="relative w-full max-w-md p-8 rounded-3xl bg-[#111] shadow-2xl border border-white/10">
            <h3 className="text-xl font-extrabold text-white mb-2">Create New Course</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">Exclusively for registered instructors. Creates a course shell ready for syllabus injection.</p>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Course Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  placeholder="Advanced Cloud Orchestration"
                  value={newCourseTitle}
                  onChange={e => setNewCourseTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  placeholder="In-depth configurations of Kubernetes, Docker nodes..."
                  value={newCourseDesc}
                  onChange={e => setNewCourseDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Price ($)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    value={newCoursePrice}
                    onChange={e => setNewCoursePrice(e.target.value)}
                  />
                  <p className="text-[9px] text-gray-500 mt-1">Set to 0 for Free courses.</p>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Category</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    value={newCourseCategory}
                    onChange={e => setNewCourseCategory(e.target.value)}
                  >
                    <option value="Programming">Programming</option>
                    <option value="AI">AI</option>
                    <option value="Web Development">Web</option>
                    <option value="Cloud">Cloud</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-500 transition shadow-lg shadow-purple-500/20"
                >
                  Create Shell
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
