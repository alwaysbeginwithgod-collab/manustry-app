"use client";

import { useUser, SignOutButton, SignIn } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";
import UserMenuDropdown from "./UserMenuDropdown";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleSidebar?: () => void;
}

export default function Header({ activeTab, setActiveTab, toggleSidebar }: HeaderProps) {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sign-in modal on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSignInOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Base tabs
  const baseTabs = [
    { id: "home", label: "Home" },
    { id: "devotion", label: "Devotion" },
    { id: "writer", label: "Writer" },
    { id: "bookshelf", label: "Bookshelf" },
    { id: "tools", label: "Tools" },
    { id: "about", label: "About" },
  ];

  const tabs = baseTabs;
  const bgColor = darkMode ? "bg-[#0F1318]" : "bg-[#F5F0EB]";
  const borderColor = darkMode ? "border-[#C9A84C]/30" : "border-[#C9A84C]/40";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const hoverColor = darkMode ? "hover:text-[#E8D5A3]" : "hover:text-[#C9A84C]";
  const menuBg = darkMode ? "bg-[#1A1F2E]" : "bg-white";
  const menuBorder = darkMode ? "border-[#C9A84C]/30" : "border-[#C9A84C]/40";

  // State for sidebar tooltip
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Listen for sidebar state changes from parent
  useEffect(() => {
    const saved = localStorage.getItem('manustry_sidebar_open');
    if (saved !== null) {
      setIsSidebarOpen(saved === 'true');
    }
  }, []);

  const handleToggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('manustry_sidebar_open', String(newState));
    if (toggleSidebar) toggleSidebar();
  };

  // ✅ Handle notification click - navigate to Devotion
  const handleNotificationClick = () => {
    setActiveTab("devotion");
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 ${bgColor} border-b ${borderColor}`}>
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* LEFT: Logo + MANUSTRY + Sidebar Toggle */}
            <div className="flex items-center space-x-3 w-[280px] flex-shrink-0">
              {/* Sidebar Toggle Button with Tooltip */}
              <div className="relative group">
                <button
                  onClick={handleToggleSidebar}
                  className="text-[#C9A84C] p-1 hover:bg-[#C9A84C]/10 rounded transition"
                  aria-label="Toggle sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {/* Tooltip */}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-[#0F1318] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none border border-[#C9A84C]/30">
                  {isSidebarOpen ? 'Hide Sidebar' : 'Open Sidebar'}
                </span>
              </div>

              {/* Logo */}
              <img
                src="/MANUSTRY.logo.png"
                alt="MANUSTRY Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              
              {/* MANUSTRY Text - 2 lines */}
              <div className="flex flex-col leading-tight">
                <span className="font-cormorant text-xl text-[#C9A84C] font-bold tracking-wider">
                  MANUSTRY
                </span>
                <span className={`text-[10px] ${darkMode ? "text-[#E8D5A3]" : "text-[#B89A3A]"}`}>
                  Your Bible Study Tool at Hand
                </span>
              </div>
            </div>

            {/* CENTER: Navigation */}
            <nav className="hidden md:flex items-center justify-center space-x-1 flex-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium transition rounded-md ${
                    activeTab === tab.id
                      ? "text-[#C9A84C] bg-[#C9A84C]/10 border-b-2 border-[#C9A84C]"
                      : `${textColor} ${hoverColor} hover:bg-[#C9A84C]/5`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* RIGHT: Theme + Notification + User */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition ${
                  darkMode ? "text-[#E8D5A3] hover:bg-[#C9A84C]/10" : "text-[#B89A3A] hover:bg-[#C9A84C]/10"
                }`}
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* ✅ Pass the navigation handler to NotificationBell */}
              <NotificationBell onNotificationClick={handleNotificationClick} />

              {/* User Section */}
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`flex items-center space-x-2 text-sm ${textColor} ${hoverColor} px-2 py-1 rounded-lg hover:bg-[#C9A84C]/10 transition`}
                  >
                    <span className="hidden sm:inline max-w-[80px] truncate">
                      {user.fullName || user.emailAddresses[0]?.emailAddress}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#0F1318] font-bold">
                      {user.fullName?.[0] || "U"}
                    </div>
                  </button>
                  
                  <UserMenuDropdown 
                    isOpen={isMenuOpen} 
                    onClose={() => setIsMenuOpen(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsSignInOpen(true)}
                  className="text-sm bg-[#C9A84C] text-[#1A1F2E] px-5 py-2 rounded-lg hover:bg-[#E8D5A3] transition font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden flex items-center justify-around ${darkMode ? "bg-[#0F1318]" : "bg-[#F5F0EB]"} border-t ${borderColor} py-1 overflow-x-auto`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-1 text-xs font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-[#C9A84C] border-b-2 border-[#C9A84C]"
                  : darkMode ? "text-gray-400 hover:text-[#E8D5A3]" : "text-gray-600 hover:text-[#C9A84C]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Sign In Modal */}
      {isSignInOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSignInOpen(false);
          }}
        >
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setIsSignInOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-[#C9A84C] transition text-3xl font-light"
            >
              ×
            </button>
            <div className="bg-transparent">
              <SignIn 
                routing="hash"
                redirectUrl="/"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-[#0F1318] border border-[#C9A84C]/30 rounded-xl shadow-2xl p-6",
                    headerTitle: "text-[#C9A84C] font-playfair text-2xl",
                    headerSubtitle: "text-[#E8D5A3] text-sm",
                    formFieldLabel: "text-white text-sm",
                    formFieldInput: "bg-[#1A1F2E] border-[#C9A84C]/30 text-white rounded-lg focus:border-[#C9A84C] focus:ring-[#C9A84C]",
                    formButtonPrimary: "bg-[#C9A84C] text-[#1A1F2E] hover:bg-[#E8D5A3] transition font-medium rounded-lg py-2",
                    footerActionLink: "text-[#C9A84C] hover:text-[#E8D5A3] transition",
                    socialButtonsBlockButton: "border-[#C9A84C]/30 text-white hover:bg-[#C9A84C]/10 rounded-lg",
                    dividerLine: "bg-[#C9A84C]/30",
                    dividerText: "text-gray-500 text-xs",
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}