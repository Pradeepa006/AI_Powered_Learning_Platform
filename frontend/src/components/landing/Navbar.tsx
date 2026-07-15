'use client';

import Link from 'next/link';
import { Brain, Sparkles } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/authSlice';
import { useState, useEffect } from 'react';
import { ThemeToggler } from '@/components/ThemeToggler';

interface NavbarProps {
  setShowAuthModal: (show: boolean) => void;
  setAuthType: (type: 'login' | 'signup') => void;
}

export default function Navbar({ setShowAuthModal, setAuthType }: NavbarProps) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);

  // useEffect runs only on the client, so we can safely access window/localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            NOVA<span className="text-purple-400">LEARN</span>
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
          <ThemeToggler />
          {!mounted ? (
            ( // Render a placeholder or the default (unauthenticated) state on the server
              // to prevent hydration mismatch. The actual state will render after hydration.
              <>
                <button className="text-sm font-medium text-gray-300 hover:text-white transition">
                  Sign In
                </button>
                <button className="px-4 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 shadow-md shadow-purple-600/20 transition">
                  Get Started
                </button>
              </>
            )
          ) : ( // Once mounted, render based on isAuthenticated
            isAuthenticated ? (
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
            ) : ( // Add parentheses here
              (
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
              ) // And here
            )
          )}
        </div>
      </div>
    </nav>
  );
}
