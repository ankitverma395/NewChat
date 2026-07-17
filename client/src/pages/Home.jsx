import React from 'react';
import { Video, Sparkles, ShieldAlert, Check } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function Home() {
  const { joinChatQueue } = useChat();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 sm:py-20">
      <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 sm:p-12 shadow-premium text-center">
        {/* Decorative Badge */}
        <div className="inline-flex items-center space-x-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Connect instantly with strangers worldwide</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 font-sans leading-tight">
          Talk to Strangers, <br />
          <span className="text-brand-600">Anonymously.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed">
          Free random video chat. Peer-to-peer connection. Zero log-in required. Start conversations with a single tap.
        </p>

        {/* Start Button */}
        <button
          onClick={joinChatQueue}
          className="group relative w-full sm:w-auto min-w-[240px] px-8 py-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-lg rounded-2xl transition duration-150 ease-in-out shadow-lg shadow-brand-100 hover:shadow-xl hover:shadow-brand-200 transform hover:-translate-y-0.5"
        >
          Start Chat
        </button>

        {/* Features Checklist */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-10 border-t border-slate-100 pt-8 max-w-md mx-auto">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-600">
            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-green-600" />
            </div>
            <span>Anonymous</span>
          </div>

          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-600">
            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-green-600" />
            </div>
            <span>Free</span>
          </div>

          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-600">
            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-green-600" />
            </div>
            <span>Instant Matching</span>
          </div>
        </div>
      </div>

      {/* Safety Alert card */}
      <div className="mt-8 flex items-center gap-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl p-4 max-w-lg text-xs sm:text-sm font-medium">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
        <p>
          <strong>Safety Warning:</strong> Please behave respectfully. Do not share your personal information (name, social links, location) with strangers. Keep chat fun and clean.
        </p>
      </div>
    </div>
  );
}
