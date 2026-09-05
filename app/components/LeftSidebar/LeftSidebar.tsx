"use client";

import { useTheme } from "../../context/ThemeContext";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { biblePromises } from "../../data/biblePromises";
import { getDailyEncouragement } from "../../data/dailyEncouragements";
import SupportModal from "../SupportModal";

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat?: () => void;
  conversations?: any[];
  onLoadConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onDeleteConversation?: (id: string) => void;
  onPinConversation?: (id: string, pinned: boolean) => void;
  activeTab?: string;
  conversationsData?: any[];
  onLoadInWriter?: (chatId: string, messages: any[], title: string) => void;
}

export default function LeftSidebar({
  isOpen,
  onClose,
  onNewChat,
  conversations = [],
  onLoadConversation,
  onRenameConversation,
  onDeleteConversation,
  onPinConversation,
  activeTab = 'home',
  conversationsData = [],
  onLoadInWriter,
}: LeftSidebarProps) {
  const { darkMode } = useTheme();
  const { user } = useUser();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [dailyVerse, setDailyVerse] = useState(biblePromises[0]);
  const [dailyEncouragement, setDailyEncouragement] = useState<{ id: number; title: string; quote: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Close sidebar when clicking outside (works on both mobile & desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close sidebar on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    console.log('📊 LeftSidebar: Received conversations:', conversations.length);
    if (conversations.length > 0) {
      console.log('📊 First conversation keys:', Object.keys(conversations[0]));
      console.log('📊 First conversation:', conversations[0]);
    }
  }, [conversations]);

  useEffect(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = dayOfYear % biblePromises.length;
    setDailyVerse(biblePromises[index]);
  }, []);

  useEffect(() => {
    const encouragement = getDailyEncouragement();
    setDailyEncouragement(encouragement);
  }, []);

  useEffect(() => {
    if (user) {
      setShowChatHistory(true);
    }
  }, [user]);

  const bgColor = darkMode ? "bg-[#0F1318]" : "bg-[#F5F0EB]";
  const borderColor = darkMode ? "border-[#C9A84C]/30" : "border-[#C9A84C]/40";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const inputBg = darkMode ? "bg-[#1A1F2E]" : "bg-white";

  const getConvId = (chat: any) => chat._id || chat.id;
  const getConvTitle = (chat: any) => chat.title || chat.content || 'Untitled';

  const uniqueConversations = conversations.reduce((acc: any[], current: any) => {
    const id = getConvId(current);
    const exists = acc.some((item: any) => getConvId(item) === id);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  console.log('📊 LeftSidebar: Unique conversations:', uniqueConversations.length);
  console.log('📊 LeftSidebar: Current active tab:', activeTab);

  const filteredChats = uniqueConversations.filter((chat: any) => {
    const title = getConvTitle(chat);
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pinnedChats = filteredChats.filter((chat: any) => chat.pinned === true);
  const unpinnedChats = filteredChats.filter((chat: any) => chat.pinned !== true);

  const handleRenameSave = (chatId: string) => {
    const chat = uniqueConversations.find(c => getConvId(c) === chatId);
    if (editingTitle.trim() && chat && editingTitle !== getConvTitle(chat)) {
      onRenameConversation?.(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleConversationClick = (chatId: string) => {
    console.log('🖱️ Sidebar: Clicked conversation:', chatId);
    console.log('📂 Current active tab:', activeTab);

    const fullConv = conversationsData.find(c => c._id === chatId || c.id === chatId);
    console.log('📂 Full conversation found:', !!fullConv);
    console.log('📂 Messages count:', fullConv?.messages?.length || 0);

    if (activeTab === 'writer') {
      console.log('📂 Loading in Writer (active tab is writer)');
      if (fullConv && onLoadInWriter) {
        onLoadInWriter(chatId, fullConv.messages || [], fullConv.title || 'Conversation');
      } else if (onLoadInWriter) {
        onLoadInWriter(chatId, [], 'Conversation');
      } else {
        console.log('⚠️ onLoadInWriter not available, loading in Home');
        onLoadConversation?.(chatId);
      }
      return;
    }

    if (activeTab === 'home') {
      console.log('📂 Loading in Home (active tab is home)');
      onLoadConversation?.(chatId);
      return;
    }

    console.log('📂 Switching to Home and loading conversation');
    onLoadConversation?.(chatId);
  };

  const handlePinToggle = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const chat = uniqueConversations.find(c => getConvId(c) === chatId);
    if (chat && onPinConversation) {
      const newPinned = !chat.pinned;
      console.log('📌 Toggling pin for:', chatId, 'to:', newPinned);
      onPinConversation(chatId, newPinned);
    }
  };

  const handleDelete = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      console.log('🗑️ Deleting conversation:', chatId);
      onDeleteConversation?.(chatId);
    }
  };

  const handleEditStart = (chatId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('✏️ Starting edit for:', chatId);
    setEditingChatId(chatId);
    setEditingTitle(title);
  };

  const iconButtonClass = `p-1.5 rounded-md transition-all duration-200 
    hover:scale-110 hover:shadow-sm 
    ${darkMode
      ? 'text-gray-400 hover:text-[#E8D5A3] hover:bg-[#C9A84C]/10'
      : 'text-gray-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10'}`;

  const pinButtonClass = (isPinned: boolean) =>
    `p-1.5 rounded-md transition-all duration-200 hover:scale-110 hover:shadow-sm
    ${isPinned
      ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10'
      : darkMode
        ? 'text-gray-400 hover:text-[#E8D5A3] hover:bg-[#C9A84C]/10'
        : 'text-gray-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10'}`;

  const deleteButtonClass = `p-1.5 rounded-md transition-all duration-200 
    hover:scale-110 hover:shadow-sm
    ${darkMode
      ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
      : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'}`;

  return (
    <>
      {/* ✅ Sidebar Overlay (only visible on mobile when sidebar is open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ✅ Floating Hamburger Toggle Button (always visible, but with a subtle edge) */}
      <button
        onClick={() => onClose()} // This toggles the sidebar by calling onClose (which is the toggle function from parent)
        className={`
          fixed top-20 left-0 z-50 p-2 rounded-r-lg transition-all duration-300
          ${isOpen
            ? 'opacity-0 pointer-events-none -translate-x-8'
            : 'opacity-100 pointer-events-auto translate-x-0'
          }
          ${darkMode
            ? 'bg-[#1A1F2E] text-[#E8D5A3] border-r border-[#C9A84C]/30 hover:bg-[#C9A84C]/10'
            : 'bg-white text-[#C9A84C] border-r border-[#C9A84C]/30 hover:bg-gray-100'
          }
          border-y border-[#C9A84C]/20 shadow-lg
          hover:shadow-xl
        `}
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="sr-only">Open sidebar</span>
      </button>

      {/* ✅ Sidebar Container */}
      <div
        ref={sidebarRef}
        className={`
          fixed top-16 left-0 bottom-0 w-[280px] 
          ${bgColor} border-r ${borderColor} 
          z-40 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-2xl
          lg:shadow-none
        `}
      >
        <div className="p-4 space-y-4 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className={`${inputBg} rounded-lg p-4 border ${borderColor} text-center`}>
              <p className="text-xs text-[#C9A84C] font-semibold mb-1">🕮 DAILY BIBLE PROMISE</p>
              <p className={`text-xs italic ${textColor}`}>"{dailyVerse.verse}"</p>
              <p className={`text-xs ${subTextColor} mt-1`}>— {dailyVerse.reference}</p>
            </div>

            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="w-full bg-[#C9A84C] text-[#1A1F2E] py-2 rounded-lg hover:bg-[#E8D5A3] transition font-medium text-sm flex items-center justify-center gap-2"
            >
              <span className="text-2xl leading-none">🤝</span> Support MANUSTRY
            </button>

            <button
              onClick={onNewChat}
              className="w-full border border-[#C9A84C] text-[#C9A84C] py-2 rounded-lg hover:bg-[#C9A84C]/10 transition font-medium text-sm flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> New Chat
            </button>

            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-2 text-sm ${textColor} placeholder:${subTextColor} focus:outline-none focus:border-[#C9A84C] transition pl-9`}
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {showChatHistory && (
              <div className="space-y-1">
                <p className={`text-xs font-medium ${subTextColor} uppercase tracking-wider mt-2`}>
                  Recent Chats
                </p>

                {pinnedChats.map((chat: any) => {
                  const chatId = getConvId(chat);
                  const title = getConvTitle(chat);
                  return (
                    <div
                      key={`pinned-${chatId}`}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition group
                        ${darkMode ? 'hover:bg-[#1A1F2E]' : 'hover:bg-white'}`}
                    >
                      <div
                        className="flex items-center gap-2 flex-1 min-w-0"
                        onClick={() => handleConversationClick(chatId)}
                      >
                        <span className="text-xs text-red-500">📌</span>
                        {editingChatId === chatId ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={() => handleRenameSave(chatId)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRenameSave(chatId);
                              }
                              if (e.key === 'Escape') {
                                setEditingChatId(null);
                                setEditingTitle('');
                              }
                            }}
                            className={`text-sm ${textColor} bg-transparent border-b border-[#C9A84C] focus:outline-none flex-1`}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className={`text-sm ${textColor} truncate`}>{title}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => handlePinToggle(chatId, e)}
                          className={pinButtonClass(true)}
                          title="Unpin"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleEditStart(chatId, title, e)}
                          className={iconButtonClass}
                          title="Rename"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDelete(chatId, e)}
                          className={deleteButtonClass}
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {unpinnedChats.map((chat: any) => {
                  const chatId = getConvId(chat);
                  const title = getConvTitle(chat);
                  return (
                    <div
                      key={`unpinned-${chatId}`}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition group
                        ${darkMode ? 'hover:bg-[#1A1F2E]' : 'hover:bg-white'}`}
                    >
                      <div
                        className="flex items-center gap-2 flex-1 min-w-0"
                        onClick={() => handleConversationClick(chatId)}
                      >
                        <span className={`text-xs ${subTextColor}`}>💬</span>
                        {editingChatId === chatId ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={() => handleRenameSave(chatId)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRenameSave(chatId);
                              }
                              if (e.key === 'Escape') {
                                setEditingChatId(null);
                                setEditingTitle('');
                              }
                            }}
                            className={`text-sm ${textColor} bg-transparent border-b border-[#C9A84C] focus:outline-none flex-1`}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className={`text-sm ${textColor} truncate`}>{title}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => handlePinToggle(chatId, e)}
                          className={pinButtonClass(false)}
                          title="Pin"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleEditStart(chatId, title, e)}
                          className={iconButtonClass}
                          title="Rename"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDelete(chatId, e)}
                          className={deleteButtonClass}
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredChats.length === 0 && (
                  <p className={`text-xs ${subTextColor} text-center py-4`}>
                    No conversations yet. Start a new chat!
                  </p>
                )}
              </div>
            )}
          </div>

          <div className={`mt-4 pt-4 border-t ${borderColor} flex-shrink-0`}>
            <div className={`${inputBg} rounded-lg p-3 border ${borderColor} bg-gradient-to-r from-[#C9A84C]/5 to-transparent`}>
              <p className="text-[10px] text-[#C9A84C] font-medium tracking-wider mb-1">
                ✦ {dailyEncouragement?.title || 'Encouragement for Today'}
              </p>
              <p className={`text-xs italic ${textColor} leading-relaxed whitespace-pre-line`}>
                ✍️ “
                {dailyEncouragement?.quote
                  ? dailyEncouragement.quote.split('\n').map((line, index) => (
                      <span key={index}>
                        {index === 0 ? line : <span className="pl-5">{line}</span>}
                        {index === 0 && '\n'}
                      </span>
                    ))
                  : 'Lean on the Lord to steer,\nSpin on your own unclear.'}
                ”
              </p>
            </div>
          </div>
        </div>
      </div>

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </>
  );
}