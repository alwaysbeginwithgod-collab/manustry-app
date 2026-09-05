"use client";

import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '@clerk/nextjs';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultMessage?: string;
  source?: string;
}

export default function EmailModal({ 
  isOpen, 
  onClose, 
  defaultSubject = '', 
  defaultMessage = '',
  source = 'contact'
}: EmailModalProps) {
  const { darkMode } = useTheme();
  const { user } = useUser();
  
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ 
    type: null, 
    message: '' 
  });

  const cardBg = darkMode ? "bg-[#0F1318]" : "bg-white";
  const cardBorder = darkMode ? "border-[#C9A84C]/20" : "border-[#C9A84C]/30";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const inputBg = darkMode ? "bg-[#1A1F2E]" : "bg-gray-100";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!email.trim() || !subject.trim() || !message.trim()) {
    setStatus({
      type: 'error',
      message: 'Please fill in all fields'
    });
    return;
  }

  setIsSending(true);
  setStatus({ type: null, message: '' });

  try {
    console.log('📧 Sending email...');
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        subject,
        message,
        userName: user?.fullName || user?.username || 'Anonymous',
        userEmail: user?.emailAddresses?.[0]?.emailAddress || '',
        source: source || 'contact',
      }),
    });

    const data = await response.json();
    console.log('📧 Response:', data);

    if (response.ok) {
      setStatus({
        type: 'success',
        message: '✅ Your message was sent successfully! We\'ll get back to you soon.'
      });
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => {
        onClose();
        setStatus({ type: null, message: '' });
      }, 3000);
    } else {
      setStatus({
        type: 'error',
        message: data.error || 'Failed to send message. Please try again.'
      });
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    setStatus({
      type: 'error',
      message: 'Network error. Please check your connection and try again.'
    });
  } finally {
    setIsSending(false);
  }
};

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSending) {
          onClose();
          setStatus({ type: null, message: '' });
        }
      }}
    >
      <div className={`${cardBg} border ${cardBorder} rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"} flex items-center gap-2`}>
            ✉️ Contact Us
          </h3>
          <button
            onClick={() => {
              onClose();
              setStatus({ type: null, message: '' });
            }}
            className="text-gray-400 hover:text-white transition text-2xl"
            disabled={isSending}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`text-sm ${subTextColor} block mb-1`}>
              Your Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              className={`w-full ${inputBg} border ${cardBorder} rounded-lg px-4 py-2 text-sm ${textColor} placeholder:${subTextColor} focus:outline-none focus:border-[#C9A84C] transition`}
              required
              disabled={isSending}
            />
          </div>

          <div>
            <label className={`text-sm ${subTextColor} block mb-1`}>
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this about?"
              className={`w-full ${inputBg} border ${cardBorder} rounded-lg px-4 py-2 text-sm ${textColor} placeholder:${subTextColor} focus:outline-none focus:border-[#C9A84C] transition`}
              required
              disabled={isSending}
            />
          </div>

          <div>
            <label className={`text-sm ${subTextColor} block mb-1`}>
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={5}
              className={`w-full ${inputBg} border ${cardBorder} rounded-lg px-4 py-2 text-sm ${textColor} placeholder:${subTextColor} focus:outline-none focus:border-[#C9A84C] transition resize-none`}
              required
              disabled={isSending}
            />
          </div>

          {status.message && (
            <div className={`p-3 rounded-lg text-sm ${
              status.type === 'success' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {status.message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="flex-1 bg-[#C9A84C] text-[#1A1F2E] py-2.5 rounded-lg hover:bg-[#E8D5A3] transition font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-[#1A1F2E] border-t-transparent rounded-full animate-spin"></span>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                setStatus({ type: null, message: '' });
              }}
              disabled={isSending}
              className={`px-4 py-2.5 rounded-lg border ${cardBorder} ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-800"} transition text-sm`}
            >
              Cancel
            </button>
          </div>

          <p className={`text-xs ${subTextColor} text-center mt-2`}>
            We'll reply to you within 24-48 hours. 🙏
          </p>
        </form>
      </div>
    </div>
  );
}