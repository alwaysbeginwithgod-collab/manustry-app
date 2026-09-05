"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "./context/ThemeContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar/LeftSidebar";
import HomeViewport from "./components/HomeViewport";
import DevotionViewport from "./components/DevotionViewport";
import WriterViewport from "./components/WriterViewport";
import BookshelfViewport from "./components/BookshelfViewport";
import AboutViewport from "./components/AboutViewport";
import ToolsViewport from "./components/ToolsViewport";

export default function MainContent() {
  const { user, isLoaded } = useUser();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  
  // Store conversation to load when switching to Home
  const [targetConversationId, setTargetConversationId] = useState<string | null>(null);
  const [targetConversationMessages, setTargetConversationMessages] = useState<any[] | null>(null);
  const [targetConversationTitle, setTargetConversationTitle] = useState<string>("");
  
  const homeViewportRef = useRef<{
    startNewChat: () => void;
    loadConversation: (chatId: string) => void;
    loadConversationWithMessages: (chatId: string, messages: any[], title: string) => void;
    getCurrentMessages: () => any[];
    getCurrentConversationId: () => string | null;
  } | null>(null);

  // ✅ WriterViewport ref
  const writerViewportRef = useRef<{
    loadConversationWithMessages: (chatId: string, messages: any[], title: string) => void;
    startNewChat: () => void;
    getCurrentMessages: () => any[];
    getCurrentConversationId: () => string | null;
  } | null>(null);

  const userId = user?.id;
  
  const updateTitle = useMutation(api.chat.updateTitle);
  const deleteConversation = useMutation(api.chat.deleteConversation);
  const togglePin = useMutation(api.chat.togglePin);
  
  const loadedConversations = useQuery(api.chat.loadConversations,
    userId ? { userId } : "skip"
  );

  useEffect(() => {
    if (loadedConversations && Array.isArray(loadedConversations)) {
      console.log('📊 MainContent: Loaded from Convex:', loadedConversations.length);
      setConversations(loadedConversations);
    }
  }, [loadedConversations]);

  const handleConversationsLoaded = (loaded: any[]) => {
    console.log('📊 MainContent: Received from HomeViewport:', loaded?.length || 0);
    if (loaded && Array.isArray(loaded)) {
      setConversations(loaded);
    }
  };

  const handleNewChat = () => {
    setActiveTab("home");
    setTargetConversationId(null);
    setTargetConversationMessages(null);
    if (homeViewportRef.current) {
      homeViewportRef.current.startNewChat();
    }
  };

  const handleLoadConversation = (chatId: string) => {
    console.log('📊 MainContent: Loading conversation in Home:', chatId);
    
    const conversation = conversations.find(c => c._id === chatId || c.conversationId === chatId);
    
    if (conversation) {
      console.log('📊 Found conversation, messages count:', conversation.messages?.length || 0);
      
      setTargetConversationId(chatId);
      setTargetConversationMessages(conversation.messages || []);
      setTargetConversationTitle(conversation.title || 'Conversation');
      
      if (activeTab === "home" && homeViewportRef.current) {
        homeViewportRef.current.loadConversationWithMessages(chatId, conversation.messages || [], conversation.title || 'Conversation');
        setTargetConversationId(null);
        setTargetConversationMessages(null);
        return;
      }
      
      setActiveTab("home");
    } else {
      console.log('❌ Conversation not found in state');
      if (activeTab === "home" && homeViewportRef.current) {
        homeViewportRef.current.loadConversation(chatId);
        return;
      }
      setTargetConversationId(chatId);
      setTargetConversationMessages(null);
      setActiveTab("home");
    }
  };

  // ✅ Handle loading conversation in Writer
  const handleLoadInWriter = (chatId: string, messages: any[], title: string) => {
    console.log('📂 Loading in Writer:', chatId, 'messages:', messages?.length || 0);
    
    // Make sure we're on Writer tab
    if (activeTab !== "writer") {
      console.log('⚠️ Switching to Writer tab');
      setActiveTab("writer");
    }
    
    // Load the conversation after a small delay to ensure tab switch
    setTimeout(() => {
      if (writerViewportRef.current) {
        console.log('✅ Loading conversation in Writer now');
        writerViewportRef.current.loadConversationWithMessages(chatId, messages || [], title || 'Conversation');
      } else {
        console.log('⚠️ WriterViewport ref not available yet, retrying...');
        // Retry after another delay
        setTimeout(() => {
          if (writerViewportRef.current) {
            writerViewportRef.current.loadConversationWithMessages(chatId, messages || [], title || 'Conversation');
          }
        }, 500);
      }
    }, 100);
  };

  useEffect(() => {
    if (activeTab === "home" && targetConversationId && homeViewportRef.current) {
      console.log('📂 MainContent: Loading pending conversation with messages:', targetConversationMessages?.length || 0);
      
      if (targetConversationMessages && targetConversationMessages.length > 0) {
        homeViewportRef.current.loadConversationWithMessages(
          targetConversationId, 
          targetConversationMessages,
          targetConversationTitle
        );
      } else {
        homeViewportRef.current.loadConversation(targetConversationId);
      }
      
      setTargetConversationId(null);
      setTargetConversationMessages(null);
      setTargetConversationTitle("");
    }
  }, [activeTab, targetConversationId, targetConversationMessages, targetConversationTitle]);

  const handleRenameConversation = async (chatId: string, newTitle: string) => {
    console.log('✏️ Renaming conversation:', chatId, 'to:', newTitle);
    if (!userId) return;
    
    try {
      const conversation = conversations.find(c => c._id === chatId || c.conversationId === chatId);
      if (!conversation) {
        console.log('❌ Conversation not found in state');
        return;
      }
      
      await updateTitle({ 
        chatId: conversation._id, 
        userId: userId,
        title: newTitle 
      });
      
      setConversations(prev =>
        prev.map(c => c._id === conversation._id ? { ...c, title: newTitle } : c)
      );
    } catch (error) {
      console.error('❌ Failed to rename:', error);
    }
  };

  const handleDeleteConversation = async (chatId: string) => {
    console.log('🗑️ Deleting conversation:', chatId);
    if (!userId) return;
    
    try {
      const conversation = conversations.find(c => c._id === chatId || c.conversationId === chatId);
      if (!conversation) {
        console.log('❌ Conversation not found in state');
        return;
      }
      
      await deleteConversation({ 
        chatId: conversation._id, 
        userId: userId 
      });
      
      setConversations(prev => prev.filter(c => c._id !== conversation._id));
    } catch (error) {
      console.error('❌ Failed to delete:', error);
    }
  };

  const handlePinConversation = async (chatId: string, pinned: boolean) => {
    console.log('📌 Pinning conversation:', chatId, 'to:', pinned);
    if (!userId) return;
    
    try {
      const conversation = conversations.find(c => c._id === chatId || c.conversationId === chatId);
      if (!conversation) {
        console.log('❌ Conversation not found in state');
        return;
      }
      
      await togglePin({ 
        chatId: conversation._id, 
        userId: userId,
        pinned: pinned 
      });
      
      setConversations(prev =>
        prev.map(c => c._id === conversation._id ? { ...c, pinned: pinned } : c)
      );
    } catch (error) {
      console.error('❌ Failed to pin:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-[#1A1F2E]" : "bg-[#F5F0EB]"} flex items-center justify-center`}>
        <div className="text-[#C9A84C] font-playfair text-2xl animate-pulse">
          Loading MANUSTRY...
        </div>
      </div>
    );
  }

  const renderViewport = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeViewport 
            ref={homeViewportRef}
            onConversationsLoaded={handleConversationsLoaded}
            isSidebarOpen={isSidebarOpen}
          />
        );
      case "devotion":
        return <DevotionViewport />;
      case "tools":
        return <ToolsViewport />;
      case "writer":
        return <WriterViewport ref={writerViewportRef} />;
      case "bookshelf":
        return <BookshelfViewport />;
      case "about":
        return <AboutViewport />;
      default:
        return (
          <HomeViewport 
            ref={homeViewportRef}
            onConversationsLoaded={handleConversationsLoaded}
            isSidebarOpen={isSidebarOpen}
          />
        );
    }
  };

  const bgColor = darkMode ? "bg-[#1A1F2E]" : "bg-[#F5F0EB]";
  const isWriterTab = activeTab === "writer";

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300 overflow-hidden`}>
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

<LeftSidebar 
  isOpen={isSidebarOpen} 
  onClose={() => setIsSidebarOpen(false)}
  onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
  onNewChat={handleNewChat}
  conversations={conversations.map(c => ({
    id: c._id || c.conversationId,
    content: c.title || 'Conversation',
    timestamp: new Date(c.lastUpdated || Date.now()),
    pinned: c.pinned || false,
  }))}
  conversationsData={conversations}      // ✅ Full conversation data
  onLoadConversation={handleLoadConversation}
  onRenameConversation={handleRenameConversation}
  onDeleteConversation={handleDeleteConversation}
  onPinConversation={handlePinConversation}
  currentConversationId={null}
  activeTab={activeTab}                  // ✅ Current tab
  onLoadInWriter={handleLoadInWriter}   // ✅ Load in Writer function
/>

      <main className={`
        fixed
        top-16
        left-0
        right-0
        bottom-0
        z-10
        transition-all
        duration-300
        ease-in-out
        ${isSidebarOpen ? 'md:left-[280px]' : 'left-0'}
        overflow-y-auto
        overflow-x-hidden
        ${isWriterTab ? 'bg-transparent' : bgColor}
      `}>
        {!isWriterTab && (
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 w-full h-full bg-contain bg-center bg-no-repeat opacity-[0.05]"
            style={{ backgroundImage: "url('/wallpaper.png')" }}
          />
        )}
        
        <div className={`relative z-10 w-full min-h-full ${isWriterTab ? 'h-full' : ''}`}>
          {/* Home Viewport - always mounted */}
          <div className={activeTab === "home" ? "block h-full" : "hidden"}>
            <HomeViewport 
              ref={homeViewportRef}
              onConversationsLoaded={handleConversationsLoaded}
              isSidebarOpen={isSidebarOpen}
            />
          </div>

          {/* Devotion Viewport - always mounted */}
          <div className={activeTab === "devotion" ? "block h-full" : "hidden"}>
            <DevotionViewport />
          </div>

          {/* Tools Viewport - always mounted */}
          <div className={activeTab === "tools" ? "block h-full" : "hidden"}>
            <ToolsViewport />
          </div>

          {/* ✅ Writer Viewport - always mounted with ref */}
          <div className={activeTab === "writer" ? "block h-full" : "hidden"}>
            <WriterViewport ref={writerViewportRef} />
          </div>

          {/* Bookshelf Viewport - always mounted */}
          <div className={activeTab === "bookshelf" ? "block h-full" : "hidden"}>
            <BookshelfViewport />
          </div>

          {/* About Viewport - always mounted */}
          <div className={activeTab === "about" ? "block h-full" : "hidden"}>
            <AboutViewport />
          </div>
        </div>
      </main>
    </div>
  );
}