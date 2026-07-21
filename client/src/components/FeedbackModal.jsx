import React, { useState } from 'react';
import { X, Send, ShieldAlert, Check } from 'lucide-react';
import { submitFeedback } from '../services/api';

export default function FeedbackModal({ isOpen, onClose }) {
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const result = await submitFeedback(suggestion);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(result.message || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuggestion('');
    setIsSuccess(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="w-full max-w-md bg-[#0d1424] border border-slate-800 rounded-3xl p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-lg font-black text-white">Request a Change</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Have an idea to improve StrangerChat? Suggest a design tweak or a new feature below. Your suggestion will be stored securely in our database and reviewed by the admin.
            </p>

            <div>
              <label htmlFor="suggestion" className="sr-only">Suggestion</label>
              <textarea
                id="suggestion"
                rows="4"
                required
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Explain the changes or features you want to add..."
                className="w-full bg-[#070b14]/60 border border-slate-800 text-white placeholder-slate-550 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-red-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !suggestion.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 disabled:bg-slate-900 border border-transparent disabled:border-slate-850 text-white font-bold text-sm rounded-2xl transition duration-150 shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Suggestion</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mx-auto">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Suggestion Saved!</h3>
              <p className="text-xs text-slate-405 text-slate-400 px-4 leading-relaxed font-semibold">
                Your request has been successfully recorded in our system. You can view all requests in the Admin Panel.
              </p>
            </div>

            <div className="bg-[#070b14]/50 border border-slate-800/80 rounded-2xl p-3 text-left max-h-24 overflow-y-auto text-xs text-slate-300 italic font-medium px-4">
              "{suggestion}"
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white font-bold text-sm rounded-2xl transition duration-150 active:scale-95 shadow-md shadow-blue-500/10"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
