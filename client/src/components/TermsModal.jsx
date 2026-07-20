import React from 'react';
import { X, Shield, Eye, Flame, Ban, ShieldAlert } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-[#0d1424]/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Terms of Service</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Effective: July 20, 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-450 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-400 leading-relaxed scrollbar-thin">
          
          <p className="text-xs font-semibold text-slate-350 bg-slate-900/50 p-4 border border-slate-850 rounded-2xl">
            Please read these Terms of Service carefully before using StrangerChat. By entering the matching queue, you agree to be bound by these guidelines and terms. If you do not agree, do not launch the chat modes.
          </p>

          {/* Section 1 */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-400" />
              1. Eligibility & Anonymity
            </h3>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs font-medium">
              <li>You must be at least 18 years of age to access or use StrangerChat, or have explicit parental guidance.</li>
              <li>StrangerChat is an anonymous platform. We do not require usernames, passwords, emails, or profile configurations.</li>
              <li>You are solely responsible for any personal details, credentials, or credentials you share with matches.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-indigo-400" />
              2. WebRTC & Peer Connection
            </h3>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs font-medium">
              <li>StrangerChat uses direct Peer-to-Peer (P2P) WebRTC communication. Your audio, video, and screen shares are streamed directly between you and your partner.</li>
              <li>We do not store, inspect, or process your media feeds on our servers.</li>
              <li>While secure, WebRTC exposes public IP coordinates between matched nodes to establish the P2P connection. By matching, you consent to this standard technical exchange.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-400" />
              3. Prohibited Conduct
            </h3>
            <p className="text-xs font-semibold text-rose-350 bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-xl">
              We enforce a strict zero-tolerance policy for abuse. Violators will face immediate ban/IP restriction.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs font-medium">
              <li>No harassment, bullying, hate speech, racism, or discriminatory behavior.</li>
              <li>No streaming of pornographic, sexually explicit, violent, or illegal content.</li>
              <li>No capture, recording, or publishing of other users' video streams, text history, or profile coordinates without explicit consent.</li>
              <li>No deployment of bots, automated matching tools, scrapers, or advertisements.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              4. Disclaimer of Liability
            </h3>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs font-medium">
              <li>StrangerChat is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind.</li>
              <li>We do not guarantee the behavior, identity, or safety of matches. You interact with strangers at your own risk.</li>
              <li>Under no circumstances shall StrangerChat be liable for damages, privacy leaks, or emotional distress arising from interactions.</li>
            </ul>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-850 bg-slate-950/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-brand-500/10 active:scale-95 transition-all"
          >
            I Agree & Close
          </button>
        </div>

      </div>
    </div>
  );
}
