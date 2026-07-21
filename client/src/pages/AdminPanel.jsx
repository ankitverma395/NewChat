import React, { useState, useEffect } from 'react';
import { ShieldAlert, LogIn, Trash2, RefreshCw, X, ShieldCheck, Download } from 'lucide-react';
import { loginAdmin, getAdminFeedback, deleteAdminFeedback } from '../services/api';

export default function AdminPanel({ onClose }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      fetchFeedback(token);
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await loginAdmin(password);
      if (result.success) {
        setToken(password);
        localStorage.setItem('adminToken', password);
        setIsAuthenticated(true);
        fetchFeedback(password);
      } else {
        setErrorMsg(result.message || 'Invalid admin credentials');
      }
    } catch (err) {
      setErrorMsg('Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedback = async (pwd) => {
    setIsLoading(true);
    try {
      const result = await getAdminFeedback(pwd || token);
      if (result.success) {
        setFeedbackList(result.data || []);
      } else {
        setErrorMsg(result.message || 'Failed to fetch suggestions');
        if (result.message?.includes('Unauthorized')) {
          handleLogout();
        }
      }
    } catch (err) {
      setErrorMsg('Failed to load feedback from server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteAdminFeedback(id, token);
      if (result.success) {
        setFeedbackList(prev => prev.filter(item => item._id !== id));
        setDeleteId(null);
      } else {
        alert(result.message || 'Failed to delete suggestion');
      }
    } catch (err) {
      alert('An error occurred while deleting the suggestion.');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setFeedbackList([]);
    setPassword('');
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(feedbackList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `strangerchat_feedback.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between relative overflow-y-auto px-4 py-8">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-brand-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-fuchsia-500/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 animate-fade-in">
              <span>Admin Dashboard</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full">
                Secure
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-bold">StrangerChat Management & Feedback Panel</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 bg-[#0b0f19]/80 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
        >
          <X className="w-4 h-4" />
          <span>Exit Admin</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="max-w-4xl w-full mx-auto flex-1 z-10 flex flex-col justify-center">
        {!isAuthenticated ? (
          <div className="w-full max-w-md mx-auto bg-[#0d1424]/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl rounded-3xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 mx-auto">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-white">Verification Required</h2>
              <p className="text-xs text-slate-405 font-semibold">Please enter your administration password to proceed.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter admin password..."
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070b14]/60 border border-slate-800 text-white placeholder-slate-550 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-red-400 text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white font-extrabold text-sm rounded-2xl transition shadow-lg disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 flex-1 flex flex-col">
            {/* Stats / Action bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1424]/40 border border-slate-800/60 p-4 sm:p-5 rounded-3xl backdrop-blur-md">
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Suggestions</div>
                <div className="text-2xl font-black text-white">{feedbackList.length} Requests</div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => fetchFeedback()}
                  disabled={isLoading}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#0b0f19]/80 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-350 hover:text-white text-xs font-bold transition active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={exportJSON}
                  disabled={feedbackList.length === 0}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-xl text-indigo-400 hover:text-indigo-300 text-xs font-bold transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 rounded-xl text-red-400 hover:text-red-300 text-xs font-bold transition active:scale-95"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* List */}
            {isLoading && feedbackList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-600 mb-2" />
                <p className="text-sm font-semibold animate-pulse">Loading logged requests...</p>
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 bg-[#0d1424]/20 border border-dashed border-slate-850 rounded-3xl text-slate-500 space-y-2">
                <ShieldCheck className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-black text-slate-400">No suggestions recorded</p>
                <p className="text-xs text-slate-500 max-w-xs text-center font-medium">User change and feature requests will automatically appear here when submitted.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1 max-h-[60vh]">
                {feedbackList.map((item) => (
                  <div
                    key={item._id}
                    className="p-5 bg-[#0d1424]/60 border border-slate-800/80 rounded-2xl flex items-start justify-between gap-4 transition hover:bg-[#0d1424]/90"
                  >
                    <div className="space-y-2.5 text-left flex-1 min-w-0">
                      <p className="text-sm text-slate-200 leading-relaxed font-semibold break-words">
                        "{item.suggestion}"
                      </p>
                      <div className="text-[10px] text-slate-450 font-bold">
                        Submitted: {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {deleteId === item._id ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-2.5 py-1.5 bg-red-500 hover:bg-red-650 rounded-lg text-white text-[10px] font-black transition"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 rounded-lg text-slate-400 text-[10px] font-black transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(item._id)}
                        className="p-2 bg-slate-900/60 hover:bg-red-500/10 hover:text-red-400 border border-slate-850 hover:border-red-500/25 rounded-xl text-slate-500 transition shrink-0"
                        title="Delete Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl w-full mx-auto text-center text-slate-650 text-xs font-semibold mt-8 z-10">
        &copy; {new Date().getFullYear()} StrangerChat Admin. Verified Security.
      </div>
    </div>
  );
}
