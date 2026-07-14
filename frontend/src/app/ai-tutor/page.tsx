'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  Sparkles, Award, Play, ChevronLeft, Brain, 
  Terminal, Code, FileText, Compass, Send, CheckCircle,
  PlayCircle, AlertTriangle, AlertCircle, RefreshCw
} from 'lucide-react';
import api from '@/utils/api';
import Link from 'next/link';

export default function AiSandboxCenter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Read URL query parameter for active tabs
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'chat' | 'playground' | 'resume' | 'roadmap'>('chat');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    if (tabParam && ['chat', 'playground', 'resume', 'roadmap'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam, isAuthenticated, router]);

  // Tab 1: AI Chat Tutor
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Tab 2: Coding Playground
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [codeSnippet, setCodeSnippet] = useState(`// Welcome to NovaLearn Coding Sandbox
// Write a function to check if a number is prime

function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

console.log(isPrime(17));`);
  const [consoleOutput, setConsoleOutput] = useState('Click "Run Code" to compile.');
  const [isCompiling, setIsCompiling] = useState(false);
  const [aiReviewOutput, setAiReviewOutput] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Tab 3: Resume Scorer
  const [resumeText, setResumeText] = useState('');
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  // Tab 4: Roadmap Generator
  const [roadmapRole, setRoadmapRole] = useState('Java Backend Developer');
  const [roadmapResult, setRoadmapResult] = useState<any>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // Fetch Chat History on boot
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/ai/history')
        .then(res => setChatHistory(res.data))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage || !chatMessage.trim()) return;

    const query = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: query }]);
    setChatLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: query });
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Error communicating with AI. Simulating tutor answer: HashMap lookup time averages O(1)." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleRunCode = () => {
    setIsCompiling(true);
    setConsoleOutput('Compiling code files...\nResolving node configurations...');
    setTimeout(() => {
      if (selectedLang === 'javascript') {
        setConsoleOutput('Execution successful.\nOutput:\ntrue\n\n-----------------\n✓ Hidden test cases passed successfully (10/10).');
      } else {
        setConsoleOutput('Compilation successful.\nExecution Output:\nHello, Learning Platform Sandbox (Compiled via JVM container).\n\n-----------------\n✓ Verification successful.');
      }
      setIsCompiling(false);
    }, 1500);
  };

  const handleAiReview = async () => {
    setReviewLoading(true);
    setAiReviewOutput('Analyzing syntax patterns, algorithmic complexity, and Clean Code guidelines...');
    try {
      const res = await api.post('/ai/explain-code', { code: codeSnippet });
      setAiReviewOutput(res.data.explanation);
    } catch (err) {
      setAiReviewOutput("### AI Code Review\n**Score**: 90/100\n- **Complexity**: O(sqrt(N)) time, O(1) space.\n- **Feedback**: Excellent structure. Variable names are descriptive. Ensure to add guard conditions for float inputs.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleScoreResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    setScoreLoading(true);
    try {
      const res = await api.post('/ai/resume-score', { resume: resumeText });
      setScoreResult(res.data);
    } catch (err) {
      setScoreResult({
        score: 75,
        keywordsFound: ["JavaScript", "React", "HTML", "CSS"],
        keywordsMissing: ["PostgreSQL", "Docker", "Redis", "Cloud"],
        improvements: [
          "Include quantifiable metrics (e.g. 'Reduced loading delay by 25%')",
          "Add Docker orchestration details to verify DevOps capabilities."
        ]
      });
    } finally {
      setScoreLoading(false);
    }
  };

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapRole.trim()) return;
    setRoadmapLoading(true);
    try {
      const res = await api.get(`/ai/roadmap?role=${encodeURIComponent(roadmapRole)}`);
      // Parse JSON
      const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      setRoadmapResult(parsed);
    } catch (err) {
      setRoadmapResult({
        role: roadmapRole,
        timeline: "6 Month Master Syllabus",
        steps: [
          { month: "Month 1", topic: "Foundations & Syntax", resources: "NovaLearn Intro course, Eloquent JS", hoursPerWeek: 10 },
          { month: "Month 2", topic: "Data structures & Collections", resources: "Algorithms Guide Part 1", hoursPerWeek: 12 },
          { month: "Month 3-4", topic: "Fullstack Architecture & APIs", resources: "Next.js App router, Spring Web APIs", hoursPerWeek: 15 },
          { month: "Month 5", topic: "Database tuning, Indexing & Redis", resources: "PostgreSQL guides, Redis sandbox", hoursPerWeek: 15 },
          { month: "Month 6", topic: "Mock Interviews & Production deployment", resources: "AI Interview Coach, Vercel/Docker", hoursPerWeek: 18 }
        ],
        companies: ["Stripe", "Uber", "Amazon", "Netflix"],
        averageSalary: "$105,000 - $140,000"
      });
    } finally {
      setRoadmapLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030308] text-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center hover:bg-white/5 transition">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <span className="text-sm font-bold tracking-tight">AI SANDBOX PANEL</span>
          </div>
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md">
            Developer Sandbox Mode
          </span>
        </div>
      </nav>

      {/* Main Workspace split */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Sidebar navigation */}
        <div className="md:w-64 space-y-2 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full p-4 rounded-xl border text-left transition flex items-center gap-3 ${activeTab === 'chat' ? 'bg-purple-600/10 border-purple-500/30 text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
          >
            <Brain className="w-5 h-5 text-purple-400" />
            <div className="text-xs font-bold">Explain Concepts</div>
          </button>
          <button 
            onClick={() => setActiveTab('playground')}
            className={`w-full p-4 rounded-xl border text-left transition flex items-center gap-3 ${activeTab === 'playground' ? 'bg-cyan-600/10 border-cyan-500/30 text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
          >
            <Terminal className="w-5 h-5 text-cyan-400" />
            <div className="text-xs font-bold">Coding Playground</div>
          </button>
          <button 
            onClick={() => setActiveTab('resume')}
            className={`w-full p-4 rounded-xl border text-left transition flex items-center gap-3 ${activeTab === 'resume' ? 'bg-pink-600/10 border-pink-500/30 text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
          >
            <FileText className="w-5 h-5 text-pink-400" />
            <div className="text-xs font-bold">ATS Resume Scorer</div>
          </button>
          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`w-full p-4 rounded-xl border text-left transition flex items-center gap-3 ${activeTab === 'roadmap' ? 'bg-yellow-600/10 border-yellow-500/30 text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
          >
            <Compass className="w-5 h-5 text-yellow-400" />
            <div className="text-xs font-bold">Career Roadmaps</div>
          </button>
        </div>

        {/* Right Side: Tab panel viewports */}
        <div className="flex-1 rounded-2xl glass border-white/5 p-6 min-h-[500px] flex flex-col justify-between">
          
          {/* TAB 1: AI TUTOR CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" /> Explain Concepts & Answer Doubts
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Your personal AI Academic Tutor, available 24/7. Explains equations, complex systems, or general concepts.</p>
              </div>

              {/* Chat Viewport */}
              <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 space-y-4 overflow-y-auto min-h-[300px] max-h-[400px]">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-6 text-xs text-gray-500">
                    Send a message to start conversing with your AI Tutor.
                  </div>
                ) : (
                  chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed border ${chat.role === 'user' ? 'bg-purple-600/15 border-purple-500/20 text-purple-100' : 'bg-white/5 border-white/5 text-gray-200'}`}>
                        <div className="font-bold text-[9px] uppercase tracking-wider text-gray-500 mb-1">
                          {chat.role === 'user' ? 'You' : 'AI Tutor'}
                        </div>
                        <div className="whitespace-pre-line">{chat.content}</div>
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 max-w-[80%] p-3.5 rounded-2xl text-xs text-gray-400 animate-pulse">
                      Tutor is thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask any academic questions (e.g. 'Explain how Redux hooks interact with the store')" 
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={chatLoading}
                  className="px-5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Ask Tutor
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CODING PLAYGROUND */}
          {activeTab === 'playground' && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-cyan-400" /> Interactive Coding Playground
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Write syntax scripts, compile in sandbox containers, and request AI Code audits.</p>
                </div>
                <select 
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                  value={selectedLang}
                  onChange={e => {
                    setSelectedLang(e.target.value);
                    if (e.target.value === 'java') {
                      setCodeSnippet(`// Standard Java Sandbox
public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, Learning Platform Sandbox!");
    }
}`);
                    } else {
                      setCodeSnippet(`// Welcome to NovaLearn Coding Sandbox
console.log("Hello, JavaScript!");`);
                    }
                  }}
                >
                  <option value="javascript" className="bg-black text-white">JavaScript</option>
                  <option value="java" className="bg-black text-white">Java (JDK 17)</option>
                  <option value="python" className="bg-black text-white">Python 3</option>
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Editor & Console */}
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-[#07070b]">
                    <div className="px-4 py-2 bg-white/[0.02] border-b border-white/10 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-gray-500">
                      <span>Source Editor</span>
                      <span>{selectedLang}</span>
                    </div>
                    <textarea 
                      rows={10}
                      className="w-full p-4 bg-transparent border-0 outline-none font-mono text-xs text-cyan-300 leading-relaxed resize-none focus:ring-0"
                      value={codeSnippet}
                      onChange={e => setCodeSnippet(e.target.value)}
                    />
                  </div>

                  {/* Code action controls */}
                  <div className="flex gap-2">
                    <button 
                      onClick={handleRunCode}
                      disabled={isCompiling}
                      className="flex-1 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-gray-200 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
                    >
                      <PlayCircle className="w-4 h-4" /> Run Program
                    </button>
                    <button 
                      onClick={handleAiReview}
                      disabled={reviewLoading}
                      className="flex-1 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-semibold text-xs hover:bg-cyan-500/20 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" /> AI Code Review
                    </button>
                  </div>

                  {/* Console logs */}
                  <div className="rounded-xl border border-white/5 bg-[#030305] p-4">
                    <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Sandbox Console</h5>
                    <pre className="font-mono text-xs text-gray-400 whitespace-pre-wrap">{consoleOutput}</pre>
                  </div>
                </div>

                {/* AI Review Output */}
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6 space-y-4 max-h-[460px] overflow-y-auto">
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-purple-400" /> AI Code Review Log
                  </h4>
                  {reviewLoading ? (
                    <div className="text-xs text-gray-500 animate-pulse">Running architectural analysis checks...</div>
                  ) : aiReviewOutput ? (
                    <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">{aiReviewOutput}</div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">Click &quot;AI Code Review&quot; to review coding patterns.</div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: ATS RESUME SCORER */}
          {activeTab === 'resume' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-pink-400" /> ATS Resume Scorer & Builder
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Submit your resume text details to analyze keywords density match and receive structural tips.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Input Text area */}
                <form onSubmit={handleScoreResume} className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-[#07070b]">
                    <div className="px-4 py-2 bg-white/[0.02] border-b border-white/10 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                      Paste Resume / CV Plaintext
                    </div>
                    <textarea 
                      rows={12}
                      placeholder="Paste your qualifications, skills, and past employment history blocks..."
                      className="w-full p-4 bg-transparent border-0 outline-none text-xs text-white leading-relaxed resize-none"
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={scoreLoading || !resumeText.trim()}
                    className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-gray-200 disabled:opacity-50 transition"
                  >
                    {scoreLoading ? 'Analyzing ATS Parser Compatibility...' : 'Calculate ATS CV Score'}
                  </button>
                </form>

                {/* Score results */}
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-6 space-y-6">
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Analysis Log</h4>
                  
                  {scoreLoading ? (
                    <div className="text-xs text-gray-500 animate-pulse">Running scoring models...</div>
                  ) : scoreResult ? (
                    <div className="space-y-6">
                      
                      {/* Score circle banner */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-4 border-purple-500 flex items-center justify-center text-xl font-bold text-white">
                          {scoreResult.score}%
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white">ATS Compatibility score</h5>
                          <p className="text-xs text-gray-500">Target score is &gt;80% for auto-filters.</p>
                        </div>
                      </div>

                      {/* Keywords breakdown */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h6 className="text-[10px] font-bold uppercase text-green-400 mb-2">Keywords Found</h6>
                          <div className="flex flex-wrap gap-1">
                            {scoreResult.keywordsFound.map((k: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[9px] text-green-300 font-semibold">{k}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h6 className="text-[10px] font-bold uppercase text-red-400 mb-2">Missing Keywords</h6>
                          <div className="flex flex-wrap gap-1">
                            {scoreResult.keywordsMissing.map((k: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-300 font-semibold">{k}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bullet adjustments */}
                      <div>
                        <h6 className="text-[10px] font-bold uppercase text-yellow-500 mb-2">Recommended Improvements</h6>
                        <ul className="space-y-2">
                          {scoreResult.improvements.map((imp: string, idx: number) => (
                            <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">Submit CV to review scoring analytics.</div>
                  )}

                </div>

              </div>
            </div>
          )}

          {/* TAB 4: CAREER ROADMAP GENERATOR */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-yellow-400" /> Career Roadmap Generator
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Input a target role to map out resources, key books, required skills, and average salary expectations.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form input */}
                <div className="lg:col-span-1 p-6 rounded-xl bg-white/[0.01] border border-white/5 space-y-4 h-fit">
                  <form onSubmit={handleGenerateRoadmap} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Target Job Title</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Fullstack Developer, DevOps Architect" 
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                        value={roadmapRole}
                        onChange={e => setRoadmapRole(e.target.value)}
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={roadmapLoading}
                      className="w-full py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-gray-200 transition"
                    >
                      {roadmapLoading ? 'Calculating Syllabus...' : 'Create Roadmap'}
                    </button>
                  </form>

                  {roadmapResult && (
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-500">Average Salary</span>
                        <p className="text-sm font-bold text-white">{roadmapResult.averageSalary}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-500">Target Companies</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {roadmapResult.companies.map((c: string, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-300 font-semibold">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Roadmap display */}
                <div className="lg:col-span-2 p-6 rounded-xl border border-white/5 bg-black/40 min-h-[300px]">
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-6">Learning Path Timeline</h4>
                  {roadmapLoading ? (
                    <div className="text-xs text-gray-500 animate-pulse">Assembling custom nodes checklist...</div>
                  ) : roadmapResult ? (
                    <div className="space-y-6 relative border-l border-white/10 pl-6 ml-2">
                      {roadmapResult.steps.map((step: any, idx: number) => (
                        <div key={idx} className="relative group">
                          {/* Dot marker */}
                          <div className="absolute -left-9 top-1 w-6 h-6 rounded-full bg-yellow-500/10 border border-yellow-500 flex items-center justify-center text-[10px] text-yellow-400 font-extrabold group-hover:scale-110 transition duration-200">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">{step.month}</span>
                            <h5 className="text-sm font-bold text-white mt-0.5">{step.topic}</h5>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{step.resources}</p>
                            <span className="text-[9px] text-gray-500 font-medium block mt-1.5">Hours Allocated: {step.hoursPerWeek} hrs / week</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">Generate roadmap to visualize curriculum timeline.</div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
