"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import EmailModal from "./EmailModal";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'update' | 'devotion' | 'promise' | 'feedback';
  read: boolean;
  timestamp: Date;
  link?: string;
};

interface NotificationBellProps {
  onNotificationClick?: () => void;
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sample notifications
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        title: '📖 Daily Bible Promise',
        message: '"Fear thou not; for I am with thee..." — Isaiah 41:10',
        type: 'promise',
        read: false,
        timestamp: new Date(),
      },
      {
        id: '2',
        title: '🙏 Daily Devotion',
        message: 'Today\'s devotion: "The Foundation of Faith" is ready!',
        type: 'devotion',
        read: false,
        timestamp: new Date(),
        link: '/devotion',
      },
      {
        id: '3',
        title: '✨ New Update',
        message: 'MANUSTRY now has a beautiful new design! Check it out.',
        type: 'update',
        read: false,
        timestamp: new Date(Date.now() - 3600000),
      },
    ];
    setNotifications(sampleNotifications);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const res = await fetch('/api/version');
        const data = await res.json();
        if (data.updateAvailable) {
          setNotifications(prev => [{
            id: 'update',
            title: '🔄 New Update Available',
            message: `Version ${data.version} is ready!`,
            type: 'update',
            read: false,
            timestamp: new Date(),
            link: '/update'
          }, ...prev]);
        }
      } catch (e) {
        console.log('Update check failed');
      }
    };
    
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // ✅ If it's a devotion notification, navigate to DevotionViewport
    if (notification.type === 'devotion' && onNotificationClick) {
      onNotificationClick();
      setIsOpen(false);
    }
    
    // ✅ If there's a custom link, open it
    if (notification.link) {
      console.log('🔗 Notification link:', notification.link);
    }
  };

  // ✅ Handle feedback button click
  const handleFeedbackClick = () => {
    setIsOpen(false);
    setIsEmailModalOpen(true);
  };

  const bgColor = darkMode ? "bg-[#1A1F2E]" : "bg-white";
  const borderColor = darkMode ? "border-[#C9A84C]/30" : "border-[#C9A84C]/40";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const hoverBg = darkMode ? "hover:bg-[#C9A84C]/10" : "hover:bg-gray-100";

  // Get icon for notification type
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'devotion': return '🙏';
      case 'promise': return '📖';
      case 'update': return '✨';
      case 'feedback': return '💬';
      default: return '📌';
    }
  };

  // Get color for notification type
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'devotion': return 'border-[#C9A84C]';
      case 'promise': return 'border-blue-500';
      case 'update': return 'border-purple-500';
      case 'feedback': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Bell Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-full transition relative ${
            darkMode 
              ? "text-[#E8D5A3] hover:bg-[#C9A84C]/10" 
              : "text-[#B89A3A] hover:bg-[#C9A84C]/10"
          }`}
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className={`absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto ${bgColor} border ${borderColor} rounded-lg shadow-xl z-50`}>
            <div className="p-3 border-b border-[#C9A84C]/20 flex justify-between items-center sticky top-0 bg-inherit z-10">
              <span className={`text-sm font-semibold ${textColor}`}>🔔 Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#C9A84C] hover:text-[#E8D5A3] transition"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-4 text-center">
                <p className={`text-sm ${subTextColor}`}>No notifications</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 border-b border-[#C9A84C]/10 cursor-pointer transition ${hoverBg} ${
                      !notification.read ? `border-l-4 ${getTypeColor(notification.type)}` : ''
                    } ${notification.type === 'devotion' ? 'hover:bg-[#C9A84C]/20' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">{getTypeIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${textColor}`}>{notification.title}</p>
                        <p className={`text-xs ${subTextColor} mt-1`}>{notification.message}</p>
                        <p className={`text-[10px] ${subTextColor} mt-1`}>
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                        {notification.type === 'devotion' && (
                          <span className="inline-block mt-1 text-[10px] bg-[#C9A84C]/20 text-[#C9A84C] px-2 py-0.5 rounded-full">
                            Click to view →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* ✅ Footer with Feedback Button */}
                <div className="p-3 border-t border-[#C9A84C]/20 text-center sticky bottom-0 bg-inherit">
                  <button
                    onClick={handleFeedbackClick}
                    className="text-xs text-[#C9A84C] hover:text-[#E8D5A3] transition border border-[#C9A84C]/30 px-4 py-1.5 rounded hover:bg-[#C9A84C]/10 inline-block mb-2"
                  >
                    💬 Send Feedback / Help
                  </button>
                  <p className={`text-[10px] ${subTextColor}`}>
                    Stay tuned for future MANUSTRY updates
                  </p>
                  <a
                    href="https://www.facebook.com/BeginWithGod/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#C9A84C] hover:text-[#E8D5A3] transition inline-block mt-1"
                  >
                    Visit our Facebook Page →
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ✅ Email Modal for Feedback */}
      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)}
        source="notification"
        defaultSubject="Feedback / Help Request"
        defaultMessage={`Hello MANUSTRY team,\n\nI would like to share some feedback or request help with:\n\n1. \n2. \n3. \n\nThank you for your help!`}
      />
    </>
  );
}