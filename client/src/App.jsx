import React from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import WaitingScreen from './pages/WaitingScreen';
import ChatRoom from './pages/ChatRoom';

function AppContent() {
  const { matchState } = useChat();

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 overflow-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-6 min-h-0">
        {matchState === 'idle' && <Home />}
        {matchState === 'waiting' && <WaitingScreen />}
        {(matchState === 'chatting' || matchState === 'disconnected') && <ChatRoom />}
      </main>
      {matchState === 'idle' && <Footer />}
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
