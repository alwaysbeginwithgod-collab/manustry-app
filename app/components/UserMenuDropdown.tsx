"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

interface UserMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserMenuDropdown({ isOpen, onClose }: UserMenuDropdownProps) {
  const { user } = useUser();
  const { darkMode } = useTheme();
  const [showDownload, setShowDownload] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!isOpen) return null;

  const bgColor = darkMode ? "bg-[#1A1F2E]" : "bg-white";
  const borderColor = darkMode ? "border-[#C9A84C]/30" : "border-[#C9A84C]/40";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const hoverBg = darkMode ? "hover:bg-[#C9A84C]/10" : "hover:bg-gray-100";
  const modalBg = darkMode ? "bg-[#1A1F2E]" : "bg-white";

  return (
    <>
      {/* Dropdown Menu */}
      <div 
        className={`absolute right-0 mt-2 w-64 ${bgColor} border ${borderColor} rounded-lg shadow-xl py-1 z-50`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* User Info */}
        <div className="px-4 py-3 border-b border-[#C9A84C]/20">
          <p className={`text-sm font-medium ${textColor}`}>
            {user?.fullName || user?.username || 'User'}
          </p>
          <p className={`text-xs ${subTextColor} truncate`}>
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <button
            onClick={() => { setShowDownload(true); onClose(); }}
            className={`w-full text-left px-4 py-2 text-sm ${textColor} ${hoverBg} transition flex items-center gap-3`}
          >
            <span className="text-lg">📱</span> Download App
          </button>

          <button
            onClick={() => { setShowHelp(true); onClose(); }}
            className={`w-full text-left px-4 py-2 text-sm ${textColor} ${hoverBg} transition flex items-center gap-3`}
          >
            <span className="text-lg">❓</span> Help
          </button>

          <button
            onClick={() => { setShowFeedback(true); onClose(); }}
            className={`w-full text-left px-4 py-2 text-sm ${textColor} ${hoverBg} transition flex items-center gap-3`}
          >
            <span className="text-lg">💬</span> Feedback
          </button>

          <div className="border-t border-[#C9A84C]/20 mt-1 pt-1">
            <SignOutButton>
              <button className={`w-full text-left px-4 py-2 text-sm ${darkMode ? "text-red-400 hover:bg-[#C9A84C]/10" : "text-red-600 hover:bg-[#C9A84C]/10"} transition flex items-center gap-3`}>
                <span className="text-lg">🚪</span> Logout
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DOWNLOAD APP MODAL */}
      {/* ============================================================ */}
      {showDownload && (
        <Modal
          title="📱 Download MANUSTRY App"
          onClose={() => setShowDownload(false)}
          darkMode={darkMode}
        >
          <div className="text-center">
            <p className={`text-sm ${textColor} mb-4`}>
              Install MANUSTRY on your device for quick access to Bible study tools.
            </p>
            
            <div className="flex flex-col items-center gap-4">
              {/* QR Code */}
              <div className={`p-4 ${darkMode ? "bg-white" : "bg-gray-100"} rounded-lg`}>
                <div className="w-48 h-48 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500">
                  QR Code Here
                </div>
                <p className={`text-xs ${subTextColor} mt-2`}>
                  Scan with your phone camera
                </p>
              </div>

              <div className="flex gap-3 flex-wrap justify-center">
                <button 
                  onClick={() => {
                    if ('serviceWorker' in navigator) {
                      alert('📲 To install:\n\n1. Tap the share icon (📤)\n2. Tap "Add to Home Screen"\n3. Tap "Add"');
                    }
                  }}
                  className="bg-[#C9A84C] text-[#1A1F2E] px-6 py-2 rounded-lg hover:bg-[#E8D5A3] transition font-medium text-sm"
                >
                  📲 Install Shortcut
                </button>
                <a 
                  href="#" 
                  className={`border ${borderColor} ${textColor} px-6 py-2 rounded-lg hover:bg-[#C9A84C]/10 transition text-sm`}
                >
                  📥 Download APK
                </a>
              </div>

              <p className={`text-xs ${subTextColor} mt-2`}>
                Available for Android, iOS, and Desktop
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* HELP MODAL */}
      {/* ============================================================ */}
      {showHelp && (
        <Modal
          title="❓ Help & Features"
          onClose={() => setShowHelp(false)}
          darkMode={darkMode}
        >
          <div className={`space-y-4 text-sm ${textColor}`}>
            <div>
              <h4 className="font-semibold text-[#C9A84C]">📖 Home</h4>
              <p className={`text-xs ${subTextColor}`}>
                Ask any Bible question, get AI-powered responses with Scripture references.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#C9A84C]">🙏 Devotion</h4>
              <p className={`text-xs ${subTextColor}`}>
                Daily devotionals that rotate automatically. Read, reflect, and pray.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#C9A84C]">✍️ Writer</h4>
              <p className={`text-xs ${subTextColor}`}>
                Dual-panel workspace for writing devotions and sermons with AI assistance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#C9A84C]">📚 Bookshelf</h4>
              <p className={`text-xs ${subTextColor}`}>
                Browse and purchase books from the Anchored Series, Ignited Series, and more.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#C9A84C]">🛠️ Tools</h4>
              <p className={`text-xs ${subTextColor}`}>
                Bible search, word search, Webster 1828 Dictionary, and study references.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#C9A84C]">📌 Chat History</h4>
              <p className={`text-xs ${subTextColor}`}>
                All conversations are saved. Pin, rename, or delete chats anytime.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* FEEDBACK MODAL */}
      {/* ============================================================ */}
      {showFeedback && (
        <Modal
          title="💬 Send Feedback"
          onClose={() => setShowFeedback(false)}
          darkMode={darkMode}
        >
          <FeedbackForm 
            onClose={() => setShowFeedback(false)}
            darkMode={darkMode}
          />
        </Modal>
      )}
    </>
  );
}

// ============================================================
// REUSABLE MODAL COMPONENT
// ============================================================
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  darkMode: boolean;
}

function Modal({ title, onClose, children, darkMode }: ModalProps) {
  const bgColor = darkMode ? "bg-[#1A1F2E]" : "bg-white";
  const borderColor = darkMode ? "border-[#C9A84C]/30" : "border-[#C9A84C]/40";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div 
        className={`${bgColor} border ${borderColor} rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto p-6 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-[#C9A84C] transition"
        >
          ×
        </button>
        <h3 className={`font-playfair text-xl text-[#C9A84C] mb-4 ${textColor}`}>
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// FEEDBACK FORM
// ============================================================
function FeedbackForm({ onClose, darkMode }: { onClose: () => void; darkMode: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useUser();

  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const inputBg = darkMode ? "bg-[#0F1318]" : "bg-gray-100";
  const borderColor = darkMode ? "border-[#C9A84C]/30" : "border-[#C9A84C]/40";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || user?.fullName || 'Anonymous',
          email: email || user?.emailAddresses[0]?.emailAddress || 'no-email@provided.com',
          message: message,
          subject: 'MANUSTRY Feedback',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
        }, 2000);
      } else {
        alert('Failed to send feedback. Please try again.');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-4">✅</p>
        <p className={`text-lg font-semibold ${textColor}`}>Thank you!</p>
        <p className={`text-sm ${subTextColor}`}>Your feedback has been sent successfully.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={`text-sm ${subTextColor} block mb-1`}>Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={user?.fullName || 'Enter your name'}
          className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-2 text-sm ${textColor} focus:outline-none focus:border-[#C9A84C] transition`}
        />
      </div>
      <div>
        <label className={`text-sm ${subTextColor} block mb-1`}>Your Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={user?.emailAddresses[0]?.emailAddress || 'Enter your email'}
          className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-2 text-sm ${textColor} focus:outline-none focus:border-[#C9A84C] transition`}
        />
      </div>
      <div>
        <label className={`text-sm ${subTextColor} block mb-1`}>Feedback</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your thoughts, suggestions, or report issues..."
          rows={4}
          className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-2 text-sm ${textColor} focus:outline-none focus:border-[#C9A84C] transition resize-none`}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#C9A84C] text-[#1A1F2E] py-2 rounded-lg hover:bg-[#E8D5A3] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending...' : 'Send Feedback'}
      </button>
    </form>
  );
}