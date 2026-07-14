'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  Sparkles, Award, Play, ChevronLeft, Brain, 
  BookOpen, Clock, FileText, CheckCircle, Save, 
  Settings, Maximize, Send, MessageSquare 
} from 'lucide-react';
import api from '@/utils/api';
import Link from 'next/link';

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export default function CoursePage({ params }: CoursePageProps) {
  const router = useRouter();
  const { id: courseId } = use(params);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [course, setCourse] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'syllabus' | 'ai' | 'notes' | 'transcript'>('syllabus');

  // AI chat state inside player
  const [aiMessage, setAiMessage] = useState('');
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Student notes state
  const [notesText, setNotesText] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  
  // Video player control states
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Fetch authenticated course details with videos
    api.get(`/courses/${courseId}`)
      .then(res => {
        setCourse(res.data.course);
        setCurriculum(res.data.curriculum || []);
        if (res.data.curriculum && res.data.curriculum.length > 0) {
          setActiveLesson(res.data.curriculum[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [courseId, isAuthenticated, router]);

  const selectLesson = (lesson: any) => {
    setActiveLesson(lesson);
    // Clear notes when switching
    setNotesText('');
  };

  const handleUpdateProgress = async () => {
    if (!activeLesson) return;
    try {
      // Mark active lesson as completed on backend
      const res = await api.post(`/courses/progress/${activeLesson.id}?watchTime=${activeLesson.duration || 120}&completed=true`);
      
      // Update local state to show checkmark
      setCurriculum(prev => prev.map(l => {
        if (l.id === activeLesson.id) {
          return { ...l, isCompleted: true };
        }
        return l;
      }));
      
      alert("Lesson marked as completed! Streaks and progress recalculated.");
    } catch (err) {
      alert("Error updating course progress.");
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage || !aiMessage.trim()) return;

    const userQuery = aiMessage;
    setAiMessage('');
    setAiHistory(prev => [...prev, { role: 'user', content: userQuery }]);
    setAiLoading(true);

    try {
      // Provide video transcript as context
      const res = await api.post('/ai/chat', {
        message: userQuery,
        context: activeLesson?.transcript || "Context about class: " + activeLesson?.title
      });
      setAiHistory(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setAiHistory(prev => [...prev, { role: 'assistant', content: "Failed to connect to AI Tutor. Here is a simulated helper concept block matching your search." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveNotes = () => {
    if (!notesText.trim()) return;
    setSavedNotes(prev => [...prev, `[Lecture Note]: ${notesText}`]);
    setNotesText('');
    alert("Note saved successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-sm text-gray-500">
        Syncing player stream and transcripts...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-sm text-gray-500">
        Course curriculum could not be retrieved. Ensure you are enrolled.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-gray-100 flex flex-col">
      
      {/* Upper bar */}
      <header className="h-14 border-b border-white/5 bg-black px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center hover:bg-white/5 transition">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white line-clamp-1">{course.title}</h1>
            <p className="text-[10px] text-gray-500">Instructor: {course.instructor?.name || "Dr. Alex Carter"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleUpdateProgress}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 transition"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        
        {/* Left Side: Video Stream & Details (Takes 3 columns on wide screens) */}
        <div className="lg:col-span-3 flex flex-col p-6 space-y-6 overflow-y-auto">
          
          {/* Custom Video Wrapper */}
          <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-white/5 relative group">
            {activeLesson?.videoUrl ? (
              <video 
                key={activeLesson.id}
                className="w-full h-full"
                controls
                src={activeLesson.videoUrl}
                style={{ playbackRate: playbackSpeed }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-purple-900/10 to-black">
                <Play className="w-16 h-16 text-purple-500 mb-3 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Select a lesson to start streaming</h3>
              </div>
            )}

            {/* Float Speed Overlay */}
            {activeLesson?.videoUrl && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition duration-300">
                <Settings className="w-3.5 h-3.5 text-gray-400" />
                <select 
                  className="bg-transparent border-0 outline-none text-xs text-white cursor-pointer"
                  value={playbackSpeed}
                  onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                >
                  <option value="1" className="bg-black text-white">1.0x Speed</option>
                  <option value="1.25" className="bg-black text-white">1.25x Speed</option>
                  <option value="1.5" className="bg-black text-white">1.5x Speed</option>
                  <option value="2" className="bg-black text-white">2.0x Speed</option>
                </select>
              </div>
            )}
          </div>

          {/* Lesson Metadata */}
          <div>
            <h2 className="text-xl font-bold text-white">{activeLesson?.title || "Welcome to LuminaLearn"}</h2>
            <p className="text-xs text-purple-400 font-semibold mt-1">{activeLesson?.sectionName || "Module 1"}</p>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              {activeLesson?.description || "Select a module lesson from the syllabus outline side panel to begin training."}
            </p>
          </div>

          {/* Notes Workspace */}
          <div className="p-6 rounded-2xl glass border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-cyan-400" /> Lecture Notes Pad
            </h3>
            <div className="space-y-3">
              <textarea 
                rows={3}
                placeholder="Take notes aligned to this timestamp..."
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                value={notesText}
                onChange={e => setNotesText(e.target.value)}
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-gray-200 transition"
                >
                  <Save className="w-4 h-4" /> Save Timestamp Note
                </button>
              </div>
            </div>

            {savedNotes.length > 0 && (
              <div className="border-t border-white/5 pt-4 space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-gray-500">Saved Notes</h4>
                {savedNotes.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-gray-300">
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Curriculum Outline and Tabbed Workspace */}
        <div className="lg:col-span-1 border-l border-white/5 bg-black/40 flex flex-col">
          
          {/* Tab bar header */}
          <div className="grid grid-cols-4 border-b border-white/5 text-center text-xs font-semibold text-gray-400">
            <button 
              onClick={() => setActiveTab('syllabus')}
              className={`py-3 border-b-2 transition ${activeTab === 'syllabus' ? 'border-purple-500 text-white bg-white/[0.02]' : 'border-transparent hover:text-white'}`}
            >
              Curriculum
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`py-3 border-b-2 transition ${activeTab === 'ai' ? 'border-purple-500 text-white bg-white/[0.02]' : 'border-transparent hover:text-white'}`}
            >
              Ask AI
            </button>
            <button 
              onClick={() => setActiveTab('transcript')}
              className={`py-3 border-b-2 transition ${activeTab === 'transcript' ? 'border-purple-500 text-white bg-white/[0.02]' : 'border-transparent hover:text-white'}`}
            >
              Transcript
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-y-auto p-4">
            
            {/* 1. SYLLABUS TAB */}
            {activeTab === 'syllabus' && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Course Curriculum Checklist</h4>
                <div className="space-y-2">
                  {curriculum.map((lesson: any) => (
                    <button 
                      key={lesson.id}
                      onClick={() => selectLesson(lesson)}
                      className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 ${activeLesson?.id === lesson.id ? 'bg-purple-600/10 border-purple-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                    >
                      {lesson.isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Play className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <h5 className="text-xs font-bold text-white line-clamp-2">{lesson.title}</h5>
                        <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider">{lesson.sectionName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. ASK AI TAB */}
            {activeTab === 'ai' && (
              <div className="flex flex-col h-full space-y-4">
                
                {/* AI Assistant Banner */}
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                  <span className="text-[10px] font-bold text-purple-400 flex items-center justify-center gap-1">
                    <Brain className="w-3.5 h-3.5" /> Contextual AI Tutor Active
                  </span>
                  <p className="text-[9px] text-gray-500 mt-0.5">I am reading the active lecture transcript to answer doubts.</p>
                </div>

                {/* AI Chat History */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ minHeight: '300px' }}>
                  {aiHistory.map((chat, idx) => (
                    <div key={idx} className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] ${chat.role === 'user' ? 'bg-purple-600/20 border border-purple-500/20 ml-auto text-right text-purple-100' : 'bg-white/5 border border-white/5 text-gray-200'}`}>
                      {chat.content}
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 animate-pulse">
                      Analyzing lecture notes & compiling answer...
                    </div>
                  )}
                </div>

                {/* Question Input */}
                <form onSubmit={handleAskAi} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask about this video..." 
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    value={aiMessage}
                    onChange={e => setAiMessage(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* 3. TRANSCRIPT TAB */}
            {activeTab === 'transcript' && (
              <div className="space-y-3 leading-relaxed">
                <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Automated Lecture Transcript</h4>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 leading-relaxed max-h-[400px] overflow-y-auto">
                  {activeLesson?.transcript || "No transcript available for this lecture. Switch course sections."}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
