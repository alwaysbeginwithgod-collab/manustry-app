"use client";

import { useUser } from "@clerk/nextjs";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import MessageBubble from "./MessageBubble";
import { sendDifyMessage, sendDifyMessageBlocking } from "../utils/difyService";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const SUGGESTIONS = [
  { text: "What is the Gospel?" },
  { text: "Explain John 3:16" },
  { text: "Explain the Trinity" },
  { text: "Explain the Lord's Prayer" },
  { text: "What is the fruit of the Spirit?" },
  { text: "What is the unpardonable sin?" },
  { text: "Explain the book of Revelation" },
  { text: "Create a preaching about love" },
  { text: "What is the meaning of baptism?" },
  { text: "Create a devotion about forgiveness" },
  { text: "Does the Bible forbid us to drink alcohol?" },
  { text: "What is the Gospel according to Paul?" },
  { text: "What does the Bible say about suffering?" },
  { text: "What do you believe about salvation?" },
  { text: "Create a devotion message about grace" },
  { text: "Create a preaching message about sin" },
  { text: "Does the Bible forbid us to pray to Mary?" },
  { text: "Who was created first, Satan or Adam?" },
  { text: "Did Jesus have brothers and sisters?" },
  { text: "What is the 'Mark of the Beast?" },
];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface HomeViewportProps {
  onConversationsLoaded?: (conversations: any[]) => void;
  isSidebarOpen?: boolean;
}

const HomeViewport = forwardRef(({ onConversationsLoaded, isSidebarOpen = true }: HomeViewportProps, ref) => {
  const { user } = useUser();
  const { darkMode } = useTheme();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [difyConversationId, setDifyConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // ✅ Continue button states
  const [isTruncated, setIsTruncated] = useState(false);
  const [partialResponse, setPartialResponse] = useState('');
  const [continueConversationId, setContinueConversationId] = useState<string | null>(null);
  
  // Refs for latest values
  const messagesRef = useRef<Message[]>([]);
  const difyIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const isSavingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const isContinuingRef = useRef(false);
  
  const stopRequested = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const userId = user?.id;
  const saveConversation = useMutation(api.chat.saveConversation);
  const loadConversations = useQuery(api.chat.loadConversations,
    userId ? { userId } : "skip"
  );

  // Keep refs in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    difyIdRef.current = difyConversationId;
  }, [difyConversationId]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Load conversations when they change
  useEffect(() => {
    if (loadConversations && Array.isArray(loadConversations)) {
      console.log('📊 HomeViewport: Loaded conversations:', loadConversations.length);
      setConversations(loadConversations);
      if (onConversationsLoaded) {
        onConversationsLoaded(loadConversations);
      }
    }
  }, [loadConversations, onConversationsLoaded]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [input]);

  const cardBg = darkMode ? "bg-[#0F1318]" : "bg-white";
  const cardBorder = darkMode ? "border-[#C9A84C]/20" : "border-[#C9A84C]/30";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const placeholderText = darkMode ? "text-gray-500" : "text-gray-400";
  const inputBg = darkMode ? "bg-[#1A1F2E]" : "bg-gray-100";
  const inputBorder = darkMode ? "border-[#C9A84C]/20" : "border-[#C9A84C]/30";

  const getUserName = useCallback((): string => {
    if (user?.fullName) return user.fullName;
    if (user?.firstName) return user.firstName;
    if (user?.username) return user.username;
    return 'Friend';
  }, [user]);

  // ============================================================
  // ✅ SAVE CONVERSATION
  // ============================================================
  const saveCurrentConversation = useCallback(() => {
    const currentMessages = messagesRef.current;
    const currentUserId = userIdRef.current;
    const currentDifyId = difyIdRef.current || difyConversationId;
    
    console.log('💾 SAVE CURRENT CONVERSATION CALLED');
    console.log('📊 userId:', currentUserId);
    console.log('📊 messages count:', currentMessages.length);
    console.log('📊 difyConversationId:', currentDifyId);
    
    if (!currentUserId || currentMessages.length === 0) return;

    try {
      const messagesToSave = currentMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.getTime(),
      }));

      console.log('📝 Saving messages:', messagesToSave.length);

      const conversationId = currentDifyId || Date.now().toString();
      const newConversation = {
        _id: conversationId,
        title: currentMessages[0]?.content?.substring(0, 50) || 'New Conversation',
        messages: messagesToSave,
        pinned: false,
        userId: currentUserId,
        lastUpdated: Date.now(),
      };

      console.log('📦 New conversation:', newConversation);

      try {
        const stored = localStorage.getItem(`manustry_conversations_${currentUserId}`);
        let existing = stored ? JSON.parse(stored) : [];
        const exists = existing.some((c: any) => c._id === conversationId);
        if (exists) {
          existing = existing.map((c: any) => c._id === conversationId ? newConversation : c);
        } else {
          existing = [newConversation, ...existing];
        }
        localStorage.setItem(`manustry_conversations_${currentUserId}`, JSON.stringify(existing));
        console.log('💾 Saved to localStorage');
      } catch (e) {
        console.log('localStorage save failed:', e);
      }

      const existsInState = conversations.some(c => c._id === conversationId);
      let updatedList;
      if (existsInState) {
        updatedList = conversations.map(c => c._id === conversationId ? newConversation : c);
      } else {
        updatedList = [newConversation, ...conversations];
      }
      
      setConversations(updatedList);
      
      if (onConversationsLoaded) {
        console.log('📤 Updating sidebar with', updatedList.length, 'conversations');
        onConversationsLoaded(updatedList);
      }

      if (saveConversation) {
        console.log('🔄 Background sync: Saving to Convex...');
        saveConversation({
          userId: currentUserId,
          chatId: currentDifyId ? currentDifyId as any : undefined,
          title: currentMessages[0]?.content?.substring(0, 50) || 'New Conversation',
          messages: messagesToSave,
          category: 'general',
          pinned: false,
        })
        .then((result) => {
          console.log('✅ Background Convex save successful:', result);
        })
        .catch((err) => {
          console.log('⚠️ Background Convex save failed:', err);
        });
      }

    } catch (error) {
      console.error('❌ Save error:', error);
    }
  }, [difyConversationId, conversations, onConversationsLoaded, saveConversation]);

  // ============================================================
  // ✅ LOAD CONVERSATION
  // ============================================================
  const loadConversation = useCallback((chatId: string) => {
    console.log('📂 Loading conversation:', chatId);
    setCurrentConversationId(chatId);
    isLoadingRef.current = true;
    
    const conversation = conversations.find(c => c._id === chatId);
    if (!conversation) {
      console.log('❌ Conversation not found in state, checking localStorage');
      try {
        const stored = localStorage.getItem(`manustry_conversations_${userId}`);
        if (stored) {
          const all = JSON.parse(stored);
          const found = all.find((c: any) => c._id === chatId);
          if (found) {
            console.log('✅ Found conversation in localStorage');
            const loadedMessages = found.messages.map((msg: any) => ({
              id: `msg-${chatId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
            }));
            setMessages(loadedMessages);
            setDifyConversationId(chatId);
            difyIdRef.current = chatId;
            isLoadingRef.current = false;
            setIsTruncated(false);
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return;
          }
        }
      } catch (e) {
        console.log('localStorage read failed:', e);
      }
      isLoadingRef.current = false;
      return;
    }

    console.log('✅ Found conversation in state, loading messages:', conversation.messages.length);
    
    const loadedMessages = conversation.messages.map((msg: any, index: number) => ({
      id: `msg-${chatId}-${index}-${Date.now()}`,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
    }));

    setMessages(loadedMessages);
    setDifyConversationId(chatId);
    difyIdRef.current = chatId;
    isLoadingRef.current = false;
    setIsTruncated(false);
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [conversations, userId]);

  // ============================================================
  // ✅ LOAD CONVERSATION WITH PRE-LOADED MESSAGES
  // ============================================================
  const loadConversationWithMessages = useCallback((chatId: string, messagesData: any[], title: string) => {
    console.log('📂 Loading conversation with pre-loaded messages:', chatId, messagesData.length);
    
    setCurrentConversationId(chatId);
    isLoadingRef.current = true;
    setIsTruncated(false);
    
    const loadedMessages = messagesData.map((msg: any, index: number) => ({
      id: `msg-${chatId}-${index}-${Date.now()}`,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
    }));
    
    setMessages(loadedMessages);
    setDifyConversationId(chatId);
    difyIdRef.current = chatId;
    isLoadingRef.current = false;
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // ============================================================
  // ✅ START NEW CHAT
  // ============================================================
  const startNewChat = useCallback(() => {
    console.log('🔄 New chat');
    setMessages([]);
    setInput('');
    setDifyConversationId(null);
    difyIdRef.current = null;
    setCurrentConversationId(null);
    setStreamingText('');
    setIsGenerating(false);
    isSavingRef.current = false;
    stopRequested.current = false;
    isLoadingRef.current = false;
    setIsTruncated(false);
    setPartialResponse('');
    setContinueConversationId(null);
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  }, []);

  // ============================================================
  // ✅ CONTINUE BUTTON HANDLER
  // ============================================================
  const handleContinue = useCallback(async () => {
    if (!partialResponse || !continueConversationId || isContinuingRef.current) return;
    
    console.log('📝 Continue button clicked for conversation:', continueConversationId);
    isContinuingRef.current = true;
    
    // ✅ Add a placeholder message indicating continuation
    const continueMessage: Message = {
      id: `continue-${Date.now()}`,
      role: 'assistant',
      content: '⏳ Continuing previous response...',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, continueMessage]);
    
    try {
      // ✅ Send continuation request to Dify
      await sendDifyMessage(
        `Continue the previous response where you left off. The last part was: "${partialResponse.substring(0, 100)}..."`,
        getUserName(),
        continueConversationId,
        (chunk: string, isComplete: boolean) => {
          if (stopRequested.current) return;
          
          // ✅ Update the placeholder message with the continuation
          setMessages(prev => {
            const lastIndex = prev.length - 1;
            if (prev[lastIndex]?.role === 'assistant' && prev[lastIndex]?.id === continueMessage.id) {
              const updated = [...prev];
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: `📝 **Continuation:**\n\n${chunk}`,
              };
              return updated;
            }
            return prev;
          });

          if (isComplete && !stopRequested.current) {
            setMessages(prev => {
              const lastIndex = prev.length - 1;
              if (prev[lastIndex]?.role === 'assistant') {
                const updated = [...prev];
                const cleanChunk = chunk.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                // Combine partial + continuation
                const fullResponse = partialResponse + '\n\n' + cleanChunk;
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: fullResponse,
                };
                return updated;
              }
              return prev;
            });
            setIsTruncated(false);
            setPartialResponse('');
            setContinueConversationId(null);
            isContinuingRef.current = false;
            saveCurrentConversation();
          }
        },
        (id: string) => {
          console.log('🆔 Continue conversation ID:', id);
          setContinueConversationId(id);
        },
        (error: string) => {
          console.error('❌ Continue error:', error);
          setMessages(prev => {
            const lastIndex = prev.length - 1;
            if (prev[lastIndex]?.role === 'assistant' && prev[lastIndex]?.id === continueMessage.id) {
              const updated = [...prev];
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: `⚠️ **Error continuing response:** ${error}\n\nYou can try again or start a new query.`,
              };
              return updated;
            }
            return prev;
          });
          isContinuingRef.current = false;
        },
        abortControllerRef.current?.signal
      );
    } catch (error) {
      console.error('❌ Continue error:', error);
      setMessages(prev => {
        const lastIndex = prev.length - 1;
        if (prev[lastIndex]?.role === 'assistant' && prev[lastIndex]?.id === continueMessage.id) {
          const updated = [...prev];
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: '⚠️ Failed to continue the response. Please try again or ask a new question.',
          };
          return updated;
        }
        return prev;
      });
      isContinuingRef.current = false;
    }
  }, [partialResponse, continueConversationId, getUserName, saveCurrentConversation]);

  // ============================================================
  // ✅ CORE SEND FUNCTION
  // ============================================================
  const sendMessage = useCallback(async (content?: string) => {
    const messageToSend = content || input;
    
    if (!messageToSend.trim()) return;

    console.log('📤 SENDING:', messageToSend.substring(0, 50));
    
    stopRequested.current = false;
    isSavingRef.current = false;
    setIsTruncated(false);
    setPartialResponse('');
    setContinueConversationId(null);

    const finalUserName = getUserName();
    const sentInput = messageToSend;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: sentInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);
    setStreamingText('');
    
    abortControllerRef.current = new AbortController();

    try {
      await sendDifyMessage(
        sentInput,
        finalUserName,
        difyConversationId,
        (chunk: string, isComplete: boolean) => {
          if (stopRequested.current) return;
          setStreamingText(chunk);

          if (isComplete && !stopRequested.current) {
            const cleanChunk = chunk.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            
            // ✅ Check if response might be truncated (ends with incomplete sentence)
            const isTruncatedResponse = cleanChunk.length > 0 && 
              !cleanChunk.endsWith('.') && 
              !cleanChunk.endsWith('!') && 
              !cleanChunk.endsWith('?') &&
              !cleanChunk.endsWith('"') &&
              !cleanChunk.endsWith('”') &&
              cleanChunk.length > 1000;
            
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: cleanChunk || 'No response from AI',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
            setStreamingText('');
            setIsGenerating(false);
            
            // ✅ If truncated, show Continue button
            if (isTruncatedResponse) {
              console.log('⚠️ Response appears truncated, showing Continue button');
              setIsTruncated(true);
              setPartialResponse(cleanChunk);
              setContinueConversationId(difyIdRef.current || difyConversationId);
            }
            
            setTimeout(() => {
              saveCurrentConversation();
            }, 100);
          }
        },
        (id: string) => {
          console.log('🆔 New Dify conversation ID:', id);
          setDifyConversationId(id);
          difyIdRef.current = id;
        },
        (error: string) => {
          console.error('Error:', error);
          if (!stopRequested.current) {
            sendDifyMessageBlocking(sentInput, finalUserName, difyConversationId)
              .then((result) => {
                const cleanResponse = result.response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                const assistantMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  role: 'assistant',
                  content: cleanResponse || 'No response from AI',
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, assistantMessage]);
                setIsGenerating(false);
                setStreamingText('');
                if (result.conversationId) {
                  setDifyConversationId(result.conversationId);
                  difyIdRef.current = result.conversationId;
                }
                setTimeout(() => {
                  saveCurrentConversation();
                }, 100);
              })
              .catch(() => {
                const errorMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  role: 'assistant',
                  content: 'I apologize, but I am unable to respond at this moment. Please try again.',
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
                setIsGenerating(false);
                setStreamingText('');
              });
          } else {
            setIsGenerating(false);
            setStreamingText('');
          }
        },
        abortControllerRef.current?.signal
      );
    } catch (error) {
      console.error('Error:', error);
      if (!stopRequested.current) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I apologize, but I am unable to respond at this moment. Please try again.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      setIsGenerating(false);
      setStreamingText('');
    }
  }, [input, getUserName, difyConversationId, saveCurrentConversation]);

  // ============================================================
  // ✅ REGENERATE
  // ============================================================
  const handleRegenerate = useCallback((assistantMessageId: string) => {
    console.log('🔄 Regenerate triggered');
    
    if (isGenerating) return;
    
    const assistantIndex = messages.findIndex(m => m.id === assistantMessageId);
    if (assistantIndex === -1) return;
    
    let userIndex = assistantIndex - 1;
    while (userIndex >= 0 && messages[userIndex].role !== 'user') {
      userIndex--;
    }
    if (userIndex < 0) return;
    
    const userMessage = messages[userIndex];
    const newMessages = messages.slice(0, assistantIndex);
    setMessages(newMessages);
    
    isSavingRef.current = false;
    setIsTruncated(false);
    setPartialResponse('');
    setContinueConversationId(null);
    sendMessage(userMessage.content);
  }, [messages, isGenerating, sendMessage]);

  // ============================================================
  // ✅ EDIT
  // ============================================================
  const handleEdit = useCallback((messageId: string, newContent: string) => {
    console.log('✏️ Edit triggered');
    
    if (isGenerating) return;
    
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    const newMessages = messages.slice(0, messageIndex);
    setMessages(newMessages);
    
    isSavingRef.current = false;
    setIsTruncated(false);
    setPartialResponse('');
    setContinueConversationId(null);
    sendMessage(newContent);
  }, [messages, isGenerating, sendMessage]);

  // ============================================================
  // ✅ STOP
  // ============================================================
  const stopResponse = useCallback(() => {
    console.log('⏹️ Stop pressed');
    stopRequested.current = true;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setStreamingText('');
    setIsGenerating(false);
    isSavingRef.current = false;
    
    const stopMessageContent = `⏹️ You stopped me from responding.

No worries! You can:  
• Edit your previous message by clicking the ✏️ edit button  
• Ask a new question in the chat box below  
• Click the regenerate button 🔄 on my last response for a new answer

🙏 So, how can I help you further?`;
    
    const stopMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: stopMessageContent,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, stopMessage]);
    
    setTimeout(() => {
      saveCurrentConversation();
    }, 100);
    
  }, [saveCurrentConversation]);

  // ============================================================
  // ✅ EXPOSE METHODS
  // ============================================================
  useImperativeHandle(ref, () => ({
    startNewChat,
    loadConversation,
    loadConversationWithMessages,
    getCurrentMessages: () => messages,
    getCurrentConversationId: () => currentConversationId,
  }));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isGenerating) {
        sendMessage();
      }
    }
  };

  const getMessageKey = (message: Message, index: number) => {
    return `${message.id}-${index}`;
  };

  const showWelcome = messages.length === 0 && !isGenerating && !isLoadingRef.current;

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        <div className="py-2">
          {showWelcome ? (
            <div className="flex flex-col justify-center items-center min-h-[400px] pt-6">
              <div className="text-center mb-6">
                <h1 className="font-cormorant text-7xl md:text-7xl lg:text-7xl text-[#C9A84C] font-bold tracking-wide leading-none">
                  MANUSTRY
                </h1>
                <p className={`font-cormorant tracking-wide text-xl md:text-3xl font-semi-bold ${darkMode ? "text-[#E8D5A3]" : "text-[#B89A3A]"}`}>
                  A Hand in Ministry
                </p>
                <div className="flex justify-center items-center gap-2 mt-3 flex-wrap">
                  <span className={`text-sm tracking-widest ${subTextColor}`}>Scriptures</span>
                  <span className="text-[#C9A84C] text-xs">|</span>
                  <span className={`text-sm tracking-widest ${subTextColor}`}>Doctrines</span>
                  <span className="text-[#C9A84C] text-xs">|</span>
                  <span className={`text-sm tracking-widest ${subTextColor}`}>Preachings</span>
                  <span className="text-[#C9A84C] text-xs">|</span>
                  <span className={`text-sm tracking-widest ${subTextColor}`}>Devotions</span>
                </div>
                <p className={`text-lg ${textColor} mt-3`}>
                  Welcome back, <span className="text-[#C9A84C] font-semibold">{getUserName()}</span>
                </p>
              </div>

              <div className={`w-full max-w-2xl rounded-xl border p-5`}
                style={{
                  backgroundColor: darkMode ? '#0F1318' : '#F5F0EB',
                  borderColor: darkMode ? 'rgba(201, 168, 76, 0.2)' : 'rgba(201, 168, 76, 0.3)'
                }}
              >
                <p className="text-xs font-medium text-[#C9A84C] text-center mb-4 tracking-[0.2em] uppercase">
                  T R Y &nbsp; A S K I N G
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(suggestion.text);
                        if (textareaRef.current) {
                          textareaRef.current.value = suggestion.text;
                          autoResizeTextarea();
                          textareaRef.current.focus();
                        }
                      }}
                      className={`rounded-lg px-4 py-3 text-sm text-left hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all duration-200 min-h-[48px] flex items-center border`}
                      style={{
                        backgroundColor: darkMode ? '#1A1F2E' : '#FFFFFF',
                        borderColor: darkMode ? 'rgba(201, 168, 76, 0.3)' : 'rgba(201, 168, 76, 0.3)',
                        color: darkMode ? '#E8D5A3' : '#1A1F2E'
                      }}
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto space-y-4 pb-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={getMessageKey(message, index)}
                  message={message}
                  onCopy={(content) => navigator.clipboard.writeText(content)}
                  onEdit={handleEdit}
                  onRegenerate={handleRegenerate}
                  isGenerating={isGenerating}
                />
              ))}
              
              {streamingText && (
                <div key="streaming-message" className="flex justify-start items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <img 
                      src="/avatar.png" 
                      alt="MANUSTRY" 
                      className="w-20 h-20 rounded-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                    />
                  </div>
                  <div className={`max-w-[85%] flex-1 rounded-lg px-4 py-3 ${cardBg} border ${cardBorder}`}>
                    <p className={`text-sm ${textColor} whitespace-pre-wrap leading-relaxed`}>
                      {streamingText}
                      <span className="inline-block w-0.5 h-4 bg-[#C9A84C] ml-0.5 animate-blink"></span>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-wave" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-wave" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-wave" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className={`text-xs ${subTextColor}`}>MANUSTRY is writing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {isGenerating && !streamingText && (
                <div key="thinking-indicator" className="flex justify-start items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <img 
                      src="/avatar.png" 
                      alt="MANUSTRY" 
                      className="w-20 h-20 rounded-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                    />
                  </div>
                  <div className={`${cardBg} border ${cardBorder} rounded-lg px-4 py-3`}>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 bg-[#C9A84C] rounded-full animate-wave" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2.5 h-2.5 bg-[#C9A84C] rounded-full animate-wave" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2.5 h-2.5 bg-[#C9A84C] rounded-full animate-wave" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className={`text-sm ${subTextColor}`}>
                        MANUSTRY is thinking
                        <span className="inline-block ml-0.5">
                          <span className="animate-pulse">.</span>
                          <span className="animate-pulse" style={{ animationDelay: '200ms' }}>.</span>
                          <span className="animate-pulse" style={{ animationDelay: '400ms' }}>.</span>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* ✅ Continue Button */}
              {isTruncated && (
                <div className="flex justify-center my-4">
                  <button
                    onClick={handleContinue}
                    disabled={isContinuingRef.current}
                    className={`text-sm text-[#C9A84C] border border-[#C9A84C]/30 px-6 py-2 rounded-lg hover:bg-[#C9A84C]/10 transition flex items-center gap-2
                      ${isContinuingRef.current ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isContinuingRef.current ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></span>
                        Continuing...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">▶</span>
                        Continue generating...
                      </>
                    )}
                  </button>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      
      <div className={`fixed bottom-0 right-0 z-50 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pt-8 pb-4 transition-all duration-300 ease-in-out flex justify-center
        ${isSidebarOpen ? 'left-0 md:left-[280px]' : 'left-0'}`}
      >
        <div className="w-full max-w-4xl px-4 md:px-0">
          <div className={`${cardBg} border ${cardBorder} rounded-lg p-3 shadow-xl`}>
            <div className="flex items-center gap-3">
              <textarea                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResizeTextarea();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask any Bible question..."
                className={`flex-1 ${inputBg} border ${inputBorder} rounded-lg px-4 py-3 text-sm ${textColor} placeholder:${placeholderText} focus:outline-none focus:border-[#C9A84C] transition resize-none overflow-y-auto min-h-[48px] max-h-[120px]`}
                disabled={isGenerating}
                rows={1}
                style={{ height: 'auto' }}
              />
              {isGenerating ? (
                <button
                  onClick={stopResponse}
                  className="bg-red-600 text-white w-12 h-12 rounded-lg hover:bg-red-700 transition flex items-center justify-center flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" strokeWidth={2} />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim()}
                  className="bg-[#C9A84C] text-[#1A1F2E] w-12 h-12 rounded-lg hover:bg-[#E8D5A3] transition font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="text-center mt-2">
            <p className={`text-sm italic ${subTextColor}`}>
              "A dose of God's Word a day, will keep you going all day."
            </p>
            <a
              href="https://www.facebook.com/BeginWithGod/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-[#C9A84C] hover:text-[#E8D5A3] transition inline-block"
            >
              — ALWAYS BEGIN WITH GOD —
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

HomeViewport.displayName = "HomeViewport";

export default HomeViewport;