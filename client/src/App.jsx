import React, { useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import WaitingScreen from './pages/WaitingScreen';
import ChatRoom from './pages/ChatRoom';
import TermsModal from './components/TermsModal';

function AppContent() {
  const { matchState } = useChat();
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className={matchState === 'idle' 
      ? "h-screen flex flex-col bg-[#090d16] text-slate-100 relative overflow-y-auto" 
      : "h-screen flex flex-col bg-[#090d16] text-slate-100 overflow-hidden relative"
    }>
      {/* Decorative Gradient Glows for UI Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-brand-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-fuchsia-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      
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
