"use client";

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { findScriptureReferences } from "../utils/scriptureParser";
import ScriptureLink from "./ScriptureLink";
import { useUser } from "@clerk/nextjs";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface MessageBubbleProps {
  message: Message;
  onCopy?: (content: string) => void;
  onEdit?: (id: string, newContent: string) => void;
  onRegenerate?: (id: string) => void;
  isGenerating?: boolean;
}

export default function MessageBubble({ 
  message, 
  onCopy, 
  onEdit, 
  onRegenerate,
  isGenerating = false 
}: MessageBubbleProps) {
  const { darkMode } = useTheme();
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  
  const userBgColor = "bg-[#C9A84C] text-[#1A1F2E]";
  const assistantBgColor = darkMode 
    ? "bg-[#0F1318] border border-[#C9A84C]/20" 
    : "bg-white border border-[#C9A84C]/30";

  const bgColor = isUser ? userBgColor : assistantBgColor;

  const userButtonStyle = `text-[#1A1F2E]/60 hover:text-[#1A1F2E] transition p-1.5 rounded hover:bg-[#1A1F2E]/10`;
  const assistantButtonStyle = darkMode 
    ? `text-gray-400 hover:text-[#E8D5A3] transition p-1.5 rounded hover:bg-[#C9A84C]/10`
    : `text-gray-400 hover:text-[#C9A84C] transition p-1.5 rounded hover:bg-[#C9A84C]/10`;

  const getUserInitial = () => {
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // ============================================================
  // RENDER CONTENT - Preserve line breaks for stop messages
  // ============================================================
  const renderContent = () => {
    const content = message.content;
    
    const isStopMessage = content.includes('⏹️') && content.includes('You stopped me from responding');
    
    if (isStopMessage) {
      const lines = content.split('\n');
      return (
        <div className="space-y-1 text-left">
          {lines.map((line, index) => {
            if (!line.trim()) {
              return <div key={index} className="h-2" />;
            }
            if (line.trim().startsWith('•')) {
              return (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-[#C9A84C]">•</span>
                  <span 
                    className="text-sm text-left" 
                    dangerouslySetInnerHTML={{ 
                      __html: line.replace('• ', '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    }} 
                  />
                </div>
              );
            }
            if (line.includes('No worries!')) {
              return (
                <p key={index} className="text-sm text-left font-medium">
                  {line}
                </p>
              );
            }
            if (line.includes('how can I help you further')) {
              return (
                <p key={index} className="text-sm text-left italic text-[#C9A84C]">
                  {line}
                </p>
              );
            }
            return (
              <p key={index} className="text-sm text-left" dangerouslySetInnerHTML={{ __html: line }} />
            );
          })}
        </div>
      );
    }

    const processText = (text: string) => {
      let processed = text;
      processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
      processed = processed.replace(/^>\s*/, '');
      processed = processed.replace(/#{1,3}\s*/g, '');
      processed = processed.replace(/\*\s*/g, '');
      processed = processed.replace(/\b([1-3]?\s?[A-Za-z]+)\s(\d+):(\d+)(?:-(\d+))?\b/g, (match) => {
        return `<span class="font-bold text-[#C9A84C]">${match}</span>`;
      });
      return processed;
    };

    const blocks = content.split(/\n\s*\n/);
    const result: React.ReactNode[] = [];

    blocks.forEach((block, blockIndex) => {
      let cleanBlock = block.replace(/^>\s*/gm, '').trim();
      cleanBlock = cleanBlock.replace(/^#{1,3}\s*/gm, '');
      const lines = cleanBlock.split('\n').filter(line => line.trim() !== '');
      const fullBlockText = lines.join(' ');
      
      const refMatch = fullBlockText.match(/\b([1-3]?\s?[A-Za-z]+)\s(\d+):(\d+)(?:-(\d+))?\b/);
      const quoteMatch = fullBlockText.match(/"([^"]+)"/);
      const isRhymingQuote = fullBlockText.includes('✍️');
      const isTagline = fullBlockText.includes('A dose of God\'s Word a day');
      
      if (refMatch && quoteMatch && !isUser && !isRhymingQuote) {
        const fullRef = refMatch[0];
        const quoteContent = quoteMatch[1];
        result.push(
          <div key={`citation-${blockIndex}`} className="my-3 p-3 border-l-4 border-[#C9A84C] bg-[#C9A84C]/5 rounded-r-lg">
            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed text-left">
              <span className="font-bold text-[#C9A84C]">{fullRef}</span>
              <span className="italic"> "{quoteContent}"</span>
            </p>
          </div>
        );
        return;
      }
      
      if (isRhymingQuote && !isUser) {
        let quoteText = fullBlockText;
        quoteText = quoteText.replace(/^>\s*/, '').replace(/^\*\s*/, '');
        quoteText = quoteText.replace(/\*/g, '').replace(/#/g, '');
        const emojiMatch = quoteText.match(/✍️\s*(.+)/);
        let displayText = quoteText;
        if (emojiMatch) {
          displayText = emojiMatch[1];
        }
        const parts = displayText.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          const firstLine = parts[0] + ',';
          const secondLine = parts.slice(1).join(', ');
          result.push(
            <p key={`rhyme-${blockIndex}`} className={`text-sm italic text-[#E8D5A3] whitespace-pre-wrap leading-relaxed text-left my-2`}>
              <span>✍️ </span>
              <span dangerouslySetInnerHTML={{ __html: processText(firstLine) }} />
              <br />
              <span className="pl-8" dangerouslySetInnerHTML={{ __html: processText(secondLine) }} />
            </p>
          );
        } else {
          result.push(
            <p key={`rhyme-${blockIndex}`} className={`text-sm italic text-[#E8D5A3] whitespace-pre-wrap leading-relaxed text-left my-2`}>
              <span>✍️ </span>
              <span dangerouslySetInnerHTML={{ __html: processText(displayText) }} />
            </p>
          );
        }
        return;
      }
      
      if (isTagline && !isUser) {
        let parts = fullBlockText.split(/(ALWAYS BEGIN WITH GOD|—Manustry|— Manustry)/);
        result.push(
          <div key={`tagline-${blockIndex}`} className="my-3 text-left">
            {parts.map((part, idx) => {
              const trimmed = part.trim();
              if (!trimmed) return null;
              const cleanPart = trimmed.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^>\s*/, '').replace(/#/g, '');
              if (cleanPart.includes('A dose of God\'s Word a day')) {
                return (
                  <p key={idx} className="text-sm italic text-gray-400 whitespace-pre-wrap leading-relaxed">
                    {cleanPart}
                  </p>
                );
              } else if (cleanPart.includes('ALWAYS BEGIN WITH GOD')) {
                return (
                  <p key={idx} className="text-sm font-bold text-[#C9A84C] whitespace-pre-wrap leading-relaxed">
                    {cleanPart}
                  </p>
                );
              } else if (cleanPart.includes('—Manustry') || cleanPart.includes('— Manustry')) {
                return (
                  <p key={idx} className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">
                    {cleanPart}
                  </p>
                );
              }
              return (
                <p key={idx} className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {cleanPart}
                </p>
              );
            })}
          </div>
        );
        return;
      }
      
      if (fullBlockText === '---' || fullBlockText === '— SCENE BREAK —') {
        result.push(
          <div key={`scene-${blockIndex}`} className="flex justify-center my-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-[#C9A84C]/30"></div>
              <span className="text-[#C9A84C] text-sm tracking-widest">✦ ✦ ✦</span>
              <div className="w-12 h-px bg-[#C9A84C]/30"></div>
            </div>
          </div>
        );
        return;
      }
      
      const refs = findScriptureReferences(fullBlockText);
      if (refs.length > 0) {
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;
        
        for (const ref of refs) {
          if (ref.startIndex > lastIndex) {
            const beforeText = fullBlockText.substring(lastIndex, ref.startIndex);
            elements.push(
              <span key={`text-${blockIndex}-${lastIndex}`} dangerouslySetInnerHTML={{ __html: processText(beforeText) }} />
            );
          }
          if (!isUser) {
            elements.push(
              <ScriptureLink key={`ref-${blockIndex}-${ref.startIndex}`} reference={ref.fullReference}>
                {ref.fullReference}
              </ScriptureLink>
            );
          } else {
            elements.push(
              <span key={`ref-${blockIndex}-${ref.startIndex}`} className="font-bold text-[#1A1F2E] bg-[#C9A84C]/30 px-1 rounded">
                {ref.fullReference}
              </span>
            );
          }
          lastIndex = ref.endIndex;
        }
        
        if (lastIndex < fullBlockText.length) {
          const afterText = fullBlockText.substring(lastIndex);
          elements.push(
            <span key={`text-${blockIndex}-end`} dangerouslySetInnerHTML={{ __html: processText(afterText) }} />
          );
        }
        
        const textColorClass = isUser ? "text-[#1A1F2E]" : (darkMode ? "text-gray-300" : "text-[#1A1F2E]");
        result.push(
          <p key={`paragraph-${blockIndex}`} className={`text-sm ${textColorClass} whitespace-pre-wrap leading-relaxed text-left`}>
            {elements}
          </p>
        );
      } else {
        const cleanText = fullBlockText.replace(/^>\s*/, '').replace(/#{1,3}\s*/g, '').replace(/\*/g, '');
        const textColorClass = isUser ? "text-[#1A1F2E]" : (darkMode ? "text-gray-300" : "text-[#1A1F2E]");
        result.push(
          <p key={`paragraph-${blockIndex}`} className={`text-sm ${textColorClass} whitespace-pre-wrap leading-relaxed text-left`}>
            <span dangerouslySetInnerHTML={{ __html: processText(cleanText) }} />
          </p>
        );
      }
    });

    if (result.length === 0) {
      return <span>{content}</span>;
    }
    
    return result;
  };

  // ✅ Updated copy handler with new SVG icon
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy(message.content);
  };

  const handleEdit = () => {
    if (isEditing) {
      if (editContent.trim() && onEdit) {
        console.log('✏️ MessageBubble: Calling onEdit for:', message.id);
        onEdit(message.id, editContent);
      }
      setIsEditing(false);
    } else {
      setEditContent(message.content);
      setIsEditing(true);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      console.log('🔄 MessageBubble: Calling onRegenerate for:', message.id);
      onRegenerate(message.id);
    }
  };

  const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
    <div className="relative group inline-block">
      {children}
      <span className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-[#0F1318] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none border border-[#C9A84C]/30 z-50">
        {text}
      </span>
    </div>
  );

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-3`}>
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <img
            src="/avatar.png"
            alt="MANUSTRY"
            className="w-20 h-20 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className={`${isUser ? (isEditing ? 'w-full max-w-[90%]' : 'max-w-[75%]') : 'max-w-[85%]'} ${!isUser ? 'flex-1' : ''}`}>
        <div className={`rounded-lg px-5 py-4 ${bgColor}`}>
          {isEditing && isUser ? (
            <div className="flex flex-col gap-3 w-full">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={`w-full ${darkMode ? "bg-[#1A1F2E] text-white" : "bg-white text-[#1A1F2E]"} border border-[#C9A84C]/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C9A84C] resize-y min-h-[120px] max-h-[400px] transition-all duration-200`}
                autoFocus
                rows={5}
                style={{ 
                  width: '100%',
                  fontFamily: 'inherit',
                  lineHeight: '1.8'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (editContent.trim() && onEdit) {
                      onEdit(message.id, editContent);
                      setIsEditing(false);
                    }
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleEdit}
                  className="bg-[#C9A84C] text-[#1A1F2E] px-5 py-2.5 rounded-lg hover:bg-[#E8D5A3] transition text-sm font-medium"
                >
                  Send
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-red-400 transition px-3 py-2.5"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {renderContent()}
              </div>
              
              {!isUser && !isEditing && (
                <>
                  <div className="my-3 flex items-center gap-2">
                    <div className="flex-1 h-px bg-[#C9A84C]/20"></div>
                    <span className="text-[10px] text-[#C9A84C]/40">✦</span>
                    <div className="flex-1 h-px bg-[#C9A84C]/20"></div>
                  </div>
                  <p className={`text-xs italic text-left ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    *AI-generated for educational purposes only. The Bible is the final authority in all matters of our faith and practice.
                  </p>
                </>
              )}
            </>
          )}
          
          <div className={`flex items-center gap-3 mt-1.5 ${isUser ? 'text-[#1A1F2E]/60' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <span className="text-xs">
              {formatTime(message.timestamp)}
            </span>
            
            <div className="flex items-center gap-0.5">
              {/* ✅ Updated Copy Button with new SVG */}
              <Tooltip text={copied ? "Copied!" : "Copy message"}>
                <button
                  onClick={handleCopy}
                  className={isUser ? userButtonStyle : assistantButtonStyle}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </Tooltip>

              {isUser && (
                <Tooltip text={isEditing ? "Save edit" : "Edit message"}>
                  <button
                    onClick={handleEdit}
                    className={userButtonStyle}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </Tooltip>
              )}

              {!isUser && onRegenerate && (
                <Tooltip text="Regenerate response">
                  <button
                    onClick={handleRegenerate}
                    className={assistantButtonStyle}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#0F1318] font-bold text-sm">
            {getUserInitial()}
          </div>
        </div>
      )}
    </div>
  );
}