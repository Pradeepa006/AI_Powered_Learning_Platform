'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Terminal, Award, ChevronRight } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          More Advanced Than Traditional Platforms
        </h2>
        <p className="text-gray-500 mt-3 max-w-md mx-auto">
          Traditional videos are static. Nova Learn is alive. We inject AI smart assistants at every turn.
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
  );
}
