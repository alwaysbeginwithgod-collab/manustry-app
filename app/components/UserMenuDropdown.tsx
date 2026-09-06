"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import EmailModal from "./EmailModal";

interface UserMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserMenuDropdown({ isOpen, onClose }: UserMenuDropdownProps) {
  const { user } = useUser();
  const { darkMode } = useTheme();
  const [showDownload, setShowDownload] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!isOpen) return null;

  const bgColor = darkMode ? "bg-[#1A1F2E]" : "bg-white";
  const borderColor = darkMode ? "border-[#C9A84C]/30" : "border-[#C9A84C]/40";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const hoverBg = darkMode ? "hover:bg-[#C9A84C]/10" : "hover:bg-gray-100";
  const modalBg = darkMode ? "bg-[#1A1F2E]" : "bg-white";

  // ✅ Handle Feedback - opens EmailModal
  const handleFeedbackClick = () => {
    onClose();
    setIsEmailModalOpen(true);
  };

  // ✅ Handle Help - shows help modal
  const handleHelpClick = () => {
    onClose();
    setShowHelp(true);
  };

  // ✅ Handle Download - shows download modal
  const handleDownloadClick = () => {
    onClose();
    setShowDownload(true);
  };

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
            {user?.firstName || user?.fullName || user?.username || 'User'}
          </p>
          <p className={`text-xs ${subTextColor} truncate`}>
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <button
            onClick={handleDownloadClick}
            className={`w-full text-left px-4 py-2 text-sm ${textColor} ${hoverBg} transition flex items-center gap-3`}
          >
            <span className="text-lg">📱</span> Download App
          </button>

          <button
            onClick={handleHelpClick}
            className={`w-full text-left px-4 py-2 text-sm ${textColor} ${hoverBg} transition flex items-center gap-3`}
          >
            <span className="text-lg">❓</span> Help & Features
          </button>

          <button
            onClick={handleFeedbackClick}
            className={`w-full text-left px-4 py-2 text-sm ${textColor} ${hoverBg} transition flex items-center gap-3`}
          >
            <span className="text-lg">💬</span> Send Feedback
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
      {/* HELP & FEATURES MODAL - UPDATED */}
      {/* ============================================================ */}
      {showHelp && (
        <Modal
          title="❓ Help & Features"
          onClose={() => setShowHelp(false)}
          darkMode={darkMode}
        >
          <div className={`space-y-4 text-sm ${textColor}`}>
            <div className="grid grid-cols-1 gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-[#0F1318]" : "bg-gray-50"} border-l-4 border-[#C9A84C]`}>
                <h4 className="font-semibold text-[#C9A84C]">📖 Home</h4>
                <p className={`text-xs ${subTextColor}`}>
                  Ask any Bible question and get AI-powered responses with Scripture references, devotions, and sermon outlines.
                </p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? "bg-[#0F1318]" : "bg-gray-50"} border-l-4 border-[#C9A84C]`}>
                <h4 className="font-semibold text-[#C9A84C]">🙏 Devotion</h4>
                <p className={`text-xs ${subTextColor}`}>
                  Daily devotionals that rotate automatically. Each includes Scripture, reflection, prayer, and a rhyming quote.
                </p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? "bg-[#0F1318]" : "bg-gray-50"} border-l-4 border-[#C9A84C]`}>
                <h4 className="font-semibold text-[#C9A84C]">✍️ Writer</h4>
                <p className={`text-xs ${subTextColor}`}>
                  Dual-panel workspace for writing devotions and sermons. Rich text formatting, font selection, and AI assistance in the right panel.
                </p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? "bg-[#0F1318]" : "bg-gray-50"} border-l-4 border-[#C9A84C]`}>
                <h4 className="font-semibold text-[#C9A84C]">📚 Bookshelf</h4>
                <p className={`text-xs ${subTextColor}`}>
                  Browse and purchase books from the Anchored Series, Ignited Series, and standalone resources.
                </p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? "bg-[#0F1318]" : "bg-gray-50"} border-l-4 border-[#C9A84C]`}>
                <h4 className="font-semibold text-[#C9A84C]">🛠️ Tools</h4>
                <p className={`text-xs ${subTextColor}`}>
                  Scripture Lookup, Word Search (KJV), Webster 1828 Dictionary, Easton's & Smith's Bible Dictionaries, and study references.
                </p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? "bg-[#0F1318]" : "bg-gray-50"} border-l-4 border-[#C9A84C]`}>
                <h4 className="font-semibold text-[#C9A84C]">📌 Chat History</h4>
                <p className={`text-xs ${subTextColor}`}>
                  All conversations are saved across devices. Pin, rename, or delete chats anytime. Conversations sync to the cloud.
                </p>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? "bg-[#0F1318]" : "bg-gray-50"} border-t ${borderColor} mt-2`}>
              <p className={`text-xs text-center ${subTextColor}`}>
                ✦ Need more help? Contact us via the "Send Feedback" button or email us directly. ✦
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ✅ Email Modal for Feedback */}
      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)}
        source="user-menu"
        defaultSubject="MANUSTRY User Feedback"
        defaultMessage={`Hello MANUSTRY team,\n\nI would like to share some feedback:\n\n1. \n2. \n3. \n\n---\nSent from MANUSTRY User Menu\nUser: ${user?.fullName || user?.username || 'Anonymous'}\nEmail: ${user?.emailAddresses[0]?.emailAddress || 'Not provided'}`}
      />
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