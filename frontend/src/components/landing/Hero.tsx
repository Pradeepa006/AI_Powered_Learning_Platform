'use client';

import { motion } from 'framer-motion';
import { Sparkles, Search } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  executeSearch: () => void;
}

export default function Hero({ searchQuery, setSearchQuery, executeSearch }: HeroProps) {
  return (
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
          Nova Learn merges premium video courses with dedicated AI Assistants. Get instant code debugging, simulated mock interviews, ATS resume scoring, and customized roadmaps.
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
  );
}
