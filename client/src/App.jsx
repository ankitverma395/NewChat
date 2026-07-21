import React, { useState, useEffect, useRef } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import WaitingScreen from './pages/WaitingScreen';
import ChatRoom from './pages/ChatRoom';
import TermsModal from './components/TermsModal';
import AdminPanel from './pages/AdminPanel';
import FeedbackModal from './components/FeedbackModal';
import { ShieldAlert } from 'lucide-react';

function AppContent() {
  const { matchState } = useChat();
  const [showTerms, setShowTerms] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(
    window.location.pathname === '/admin' || window.location.search.includes('admin')
  );
  const containerRef = useRef(null);

  // Scroll to top whenever matchState changes to keep the Navbar visible
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [matchState]);

  if (isAdminMode) {
    return <AdminPanel onClose={() => setIsAdminMode(false)} />;
  }

  return (
    <div 
      ref={containerRef}
      className={matchState === 'idle' 
        ? "h-screen flex flex-col bg-[#090d16] text-slate-100 relative overflow-y-auto" 
        : "h-screen flex flex-col bg-[#090d16] text-slate-100 overflow-hidden relative"
      }
    >
      {/* Decorative Gradient Glows for UI Premium Vibe, wrapped to prevent expanding scrollHeight */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-brand-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-fuchsia-500/10 blur-[130px]" />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>
      
      <Navbar />
      <main className={`flex flex-col w-full max-w-7xl mx-auto z-10 ${
        matchState === 'idle' 
          ? 'px-4 sm:px-6 lg:px-8 py-6 sm:py-10 min-h-fit' 
          : 'px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 flex-1 min-h-0'
      }`}>
        {matchState === 'idle' && <Home />}
        {matchState === 'waiting' && <WaitingScreen />}
        {(matchState === 'chatting' || matchState === 'disconnected') && <ChatRoom />}
      </main>
      {matchState === 'idle' && <Footer onOpenTerms={() => setShowTerms(true)} />}
      
      {/* Terms and Conditions Modal */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

      {/* Floating Action Button for Suggestions & Feedback */}
      <button
        onClick={() => setShowFeedback(true)}
        className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 border border-slate-700/50 hover:border-indigo-500/50 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
        title="Report issue or suggest a change"
      >
        <ShieldAlert className="w-4 h-4 text-indigo-200 group-hover:text-white animate-pulse" />
        <span>Request Tweak</span>
      </button>

      {/* Feedback/Suggestion Modal */}
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </div>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
