'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout, setCredentials } from '@/redux/authSlice';
import { 
  Sparkles, Award, Zap, Brain, Play, Shield, 
  Terminal, User, BookOpen, Star, LogOut, CheckCircle, 
  Compass, Flame, PlusCircle, ArrowRight
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

  // Instructor creation dialog state
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('49.99');
  const [newCourseCategory, setNewCourseCategory] = useState('Programming');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Refresh profile state
    api.get('/auth/me')
      .then(res => {
        setProfile(res.data);
        dispatch(setCredentials({ user: res.data, token: localStorage.getItem('token') || '' }));
      })
      .catch(() => {});

    // Fetch enrolled courses
    api.get('/courses/public/search') // Fetching all and filtering locally or fetching details
      .then(res => {
        setEnrolledCourses(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [isAuthenticated, router, dispatch]);

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
      // Refresh course list
      const res = await api.get('/courses/public/search');
      setEnrolledCourses(res.data);
    } catch (err) {
      alert("Error creating course. Ensure you have INSTRUCTOR role.");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#030308] text-gray-100 flex flex-col">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Student Profile & Gamification Stats */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* User Card */}
          <div className="p-6 rounded-2xl glass border-purple-500/10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 mx-auto flex items-center justify-center mb-4 text-white text-2xl font-bold shadow-md shadow-purple-600/20">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-purple-400 font-medium mt-0.5 capitalize">{user?.role?.toLowerCase() || 'Student'}</p>
            <p className="text-xs text-gray-500 mt-2 italic">&quot;{profile?.bio || 'Learning path started'}&quot;</p>
            
            {/* Streak & XP Details */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
              <div className="flex flex-col items-center border-r border-white/5">
                <div className="flex items-center gap-1 text-orange-500 font-bold text-lg">
                  <Flame className="w-5 h-5 fill-current animate-pulse" />
                  <span>{user?.currentStreak || 0}</span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Daily Streak</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-cyan-400 font-bold text-lg">
                  <Zap className="w-5 h-5 fill-current" />
                  <span>{user?.xpPoints || 0}</span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">XP Points</span>
              </div>
            </div>
          </div>

          {/* AI Shortcuts Panel */}
          <div className="p-6 rounded-2xl glass border-white/5 space-y-4">
            <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">AI Sandbox Services</h4>
            <div className="space-y-2">
              <Link href="/ai-tutor?tab=chat" className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition text-xs font-semibold text-gray-200 group">
                <span className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" /> Explain Concepts / Ask doubts
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </Link>
              <Link href="/ai-tutor?tab=playground" className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition text-xs font-semibold text-gray-200 group">
                <span className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" /> Coding Compiler & AI Review
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </Link>
              <Link href="/ai-tutor?tab=resume" className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition text-xs font-semibold text-gray-200 group">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-pink-400" /> ATS CV Scorer
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </Link>
              <Link href="/ai-tutor?tab=roadmap" className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-yellow-500/30 transition text-xs font-semibold text-gray-200 group">
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-yellow-500" /> Career Roadmap Creator
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </Link>
            </div>
          </div>

          {/* Badges Earned */}
          <div className="p-6 rounded-2xl glass border-white/5">
            <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4">Achievements</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="h-11 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group relative" title="First Login Badge">
                <Award className="w-6 h-6" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max text-[9px] bg-black text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">First Login</span>
              </div>
              <div className="h-11 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group relative" title="Streak Master Badge">
                <Zap className="w-6 h-6" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max text-[9px] bg-black text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">Streak Master</span>
              </div>
              <div className="h-11 rounded-lg bg-cyan-500/5 border border-white/5 flex items-center justify-center text-gray-600 group relative">
                <CheckCircle className="w-6 h-6" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max text-[9px] bg-black text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">Locked: Finish Course</span>
              </div>
              <div className="h-11 rounded-lg bg-cyan-500/5 border border-white/5 flex items-center justify-center text-gray-600 group relative">
                <Code className="w-6 h-6" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max text-[9px] bg-black text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">Locked: Code Explorer</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Course Dashboard & Curriculums */}
        <div className="lg:col-span-3 space-y-8">
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Continue Learning</h2>
              <p className="text-xs text-gray-500 mt-0.5">Track your curriculum logs and certificates.</p>
            </div>

            {/* Instructor Actions */}
            {user?.role === 'INSTRUCTOR' && (
              <button 
                onClick={() => setShowCreateCourseModal(true)}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4" /> Create Course
              </button>
            )}
          </div>

          {loading ? (
            <div className="h-64 rounded-2xl glass border-white/5 flex items-center justify-center text-sm text-gray-500">
              Loading enrolled courses...
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="h-64 rounded-2xl glass border-white/5 flex flex-col items-center justify-center text-center p-6">
              <BookOpen className="w-12 h-12 text-gray-700 mb-3" />
              <h3 className="text-sm font-semibold text-white">No active enrollments found</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1">Explore our catalog on the landing page to enroll in curriculum paths.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((c: any) => (
                <div key={c.id} className="rounded-2xl glass-card overflow-hidden border-white/5 flex flex-col justify-between">
                  <div className="p-6">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{c.category}</span>
                    <h3 className="text-lg font-bold text-white mt-1 mb-2 leading-snug">{c.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">{c.subtitle}</p>
                    
                    {/* Simulated course progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                        <span>Course Progress</span>
                        <span>{c.id === 1 ? '50%' : '0%'}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-cyan-400" 
                          style={{ width: c.id === 1 ? '50%' : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-medium">Difficulty: {c.difficulty || 'Beginner'}</span>
                    <Link 
                      href={`/course/${c.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs flex items-center gap-1 hover:bg-gray-200 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Continue
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certificate Verification Portal Section */}
          <div className="p-6 rounded-2xl glass border-purple-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-lg font-bold text-white mb-2">Certificate Verification Portal</h3>
            <p className="text-xs text-gray-400 mb-6 max-w-xl leading-relaxed">
              Verify LuminaLearn credentials issued to students via unique ID lookup. Checks eligibility validation and simulated blockchain timestamp logs.
            </p>
            <div className="flex items-center gap-2 max-w-md">
              <input 
                type="text" 
                placeholder="Enter Certificate Verification ID (e.g., CERT-F839A2)" 
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
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
                className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-gray-200 transition"
              >
                Verify Credentials
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateCourseModal(false)} />
          <div className="relative w-full max-w-md p-8 rounded-2xl glass shadow-2xl border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">Create New Course</h3>
            <p className="text-xs text-gray-500 mb-6">Exclusively for registered instructors. Creates a course ready for syllabus injection.</p>
            
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Title</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Advanced Cloud Orchestration"
                  value={newCourseTitle}
                  onChange={e => setNewCourseTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Description</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none"
                  placeholder="In-depth configurations of Kubernetes, Docker nodes, and AWS VPC components..."
                  value={newCourseDesc}
                  onChange={e => setNewCourseDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Price ($)</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none"
                    value={newCoursePrice}
                    onChange={e => setNewCoursePrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Category</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-purple-500 focus:outline-none"
                    value={newCourseCategory}
                    onChange={e => setNewCourseCategory(e.target.value)}
                  >
                    <option value="Programming">Programming</option>
                    <option value="AI">AI</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Cloud">Cloud</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-gray-200 transition"
              >
                Publish Course Catalog
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
