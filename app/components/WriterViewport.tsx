"use client";

import { useUser } from "@clerk/nextjs";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Packer, Document as DocxDocument, Paragraph, TextRun, AlignmentType, convertInchesToTwip } from 'docx';
import * as mammoth from 'mammoth';
import { sendDifyMessage, sendDifyMessageBlocking } from "../utils/difyService";
import MessageBubble from "./MessageBubble";

// Suggestion prompts for the right pane
const WRITER_SUGGESTIONS = [
  { text: "Help me outline a sermon on grace" },
  { text: "Give me a devotion about hope" },
  { text: "Suggest Scripture verses about faith" },
  { text: "Write an introduction for a message on prayer" },
];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// Font options
const FONT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Calibri', value: 'Calibri, sans-serif' },
  { label: 'Garamond', value: 'Garamond, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
];

// Font size options
const FONT_SIZES = ['8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48'];

// Custom Font Size Extension
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize?.replace('px', ''),
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}px`,
          };
        },
      },
    };
  },
});

// Rich Text Toolbar Component
const RichTextToolbar = ({ editor }: { editor: any }) => {
  const { darkMode } = useTheme();
  const [fontFamily, setFontFamily] = useState('default');
  const [fontSize, setFontSize] = useState('16');
  
  const buttonClass = (isActive: boolean) => `
    p-2 rounded-md transition-all duration-150 text-sm relative min-w-[36px] min-h-[36px] flex items-center justify-center
    ${isActive 
      ? 'bg-[#C9A84C]/20 text-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.3)] border border-[#C9A84C]/30' 
      : darkMode 
        ? 'text-gray-400 hover:text-[#E8D5A3] hover:bg-[#C9A84C]/10' 
        : 'text-gray-600 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10'
    }
  `;

  if (!editor) return null;

  const handleFontChange = (font: string) => {
    setFontFamily(font);
    if (font === 'default') {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(font).run();
    }
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 p-2 border-b ${darkMode ? 'border-[#C9A84C]/20' : 'border-[#C9A84C]/30'} flex-shrink-0`}>
      {/* Font Family Dropdown */}
      <select
        value={fontFamily}
        onChange={(e) => handleFontChange(e.target.value)}
        className={`${darkMode ? 'bg-[#1A1F2E] text-gray-300 border-[#C9A84C]/20' : 'bg-white text-[#1A1F2E] border-[#C9A84C]/30'} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#C9A84C]`}
        title="Font Family"
      >
        {FONT_OPTIONS.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>

      {/* Font Size Dropdown */}
      <select
        value={fontSize}
        onChange={(e) => handleFontSizeChange(e.target.value)}
        className={`${darkMode ? 'bg-[#1A1F2E] text-gray-300 border-[#C9A84C]/20' : 'bg-white text-[#1A1F2E] border-[#C9A84C]/30'} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#C9A84C]`}
        title="Font Size"
      >
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <span className={`w-px h-8 ${darkMode ? 'bg-[#C9A84C]/20' : 'bg-[#C9A84C]/30'}`}></span>

      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <strong className="text-base">B</strong>
      </button>
      
      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <em className="text-base">I</em>
      </button>
      
      {/* Underline */}
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={buttonClass(editor.isActive('underline'))}
        title="Underline"
      >
        <u className="text-base">U</u>
      </button>
      
      <span className={`w-px h-8 ${darkMode ? 'bg-[#C9A84C]/20' : 'bg-[#C9A84C]/30'}`}></span>
      
      {/* Bullet List */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <circle cx="6" cy="6" r="2" fill="currentColor" stroke="none" />
          <circle cx="6" cy="12" r="2" fill="currentColor" stroke="none" />
          <circle cx="6" cy="18" r="2" fill="currentColor" stroke="none" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6h8M12 12h8M12 18h8" />
        </svg>
      </button>
      
      {/* Numbered List */}
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        title="Numbered List"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 6h14M7 12h14M7 18h14" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
      </button>
      
      <span className={`w-px h-8 ${darkMode ? 'bg-[#C9A84C]/20' : 'bg-[#C9A84C]/30'}`}></span>
      
      {/* Align Left */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={buttonClass(editor.isActive({ textAlign: 'left' }))}
        title="Align Left"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
        </svg>
      </button>
      
      {/* Align Center */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={buttonClass(editor.isActive({ textAlign: 'center' }))}
        title="Align Center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M6 12h12M4 18h16" />
        </svg>
      </button>
      
      {/* Align Right */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={buttonClass(editor.isActive({ textAlign: 'right' }))}
        title="Align Right"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M12 12h8M4 18h16" />
        </svg>
      </button>
      
      {/* Justify */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={buttonClass(editor.isActive({ textAlign: 'justify' }))}
        title="Justify"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <span className={`w-px h-8 ${darkMode ? 'bg-[#C9A84C]/20' : 'bg-[#C9A84C]/30'}`}></span>
      
      {/* Blockquote */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive('blockquote'))}
        title="Blockquote"
      >
        <span className="text-xl font-serif leading-none">"</span>
      </button>
    </div>
  );
};

// ✅ Use forwardRef to expose methods to parent
const WriterViewport = forwardRef((props, ref) => {
  const { user } = useUser();
  const { darkMode } = useTheme();
  
  // State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('devotion');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [difyConversationId, setDifyConversationId] = useState<string | null>(null);
  const [writerConversationId, setWriterConversationId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [activePanel, setActivePanel] = useState<'editor' | 'chat'>('editor');
  
  // Drag state for splitter
  const [splitWidth, setSplitWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const stopRequested = useRef(false);
  const editorRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Convex hooks - only for loading saved content (optional)
  const loadContent = useQuery(api.writer.loadWriterContent, 
    user ? { userId: user.id } : "skip"
  );

  // Load custom categories from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`manustry_custom_categories_${user.id}`);
      if (saved) {
        try {
          setCustomCategories(JSON.parse(saved));
        } catch (e) {
          console.log('Error loading custom categories:', e);
        }
      }
    }
  }, [user]);

  // Save custom categories to localStorage
  const saveCustomCategory = (newCategory: string) => {
    if (!user || !newCategory.trim()) return;
    const updated = [...customCategories, newCategory.trim()];
    setCustomCategories(updated);
    localStorage.setItem(`manustry_custom_categories_${user.id}`, JSON.stringify(updated));
    setCategory(newCategory.trim());
    setCustomCategoryInput('');
    setShowCustomCategoryInput(false);
  };

  // Initialize TipTap editor with custom FontSize extension
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your devotion or sermon here...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Blockquote,
      Bold,
      Italic,
      BulletList,
      OrderedList,
      ListItem,
      FontSize,
      FontFamily,
    ],
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: `prose max-w-none focus:outline-none min-h-[300px] px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-[#1A1F2E]'}`,
      },
    },
    onUpdate: ({ editor }) => {
      editorRef.current = editor;
    },
  });

  // Save editor reference when it changes
  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
    }
  }, [editor]);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  // Auto-resize textarea
  const autoResizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    autoResizeTextarea();
  }, [chatInput, autoResizeTextarea]);

  // Drag handlers for splitter
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleDragMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      if (newWidth > 15 && newWidth < 85) {
        setSplitWidth(newWidth);
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging]);

  // Get user name
  const getUserName = useCallback((): string => {
    if (user?.fullName) return user.fullName;
    if (user?.firstName) return user.firstName;
    if (user?.username) return user.username;
    return 'Friend';
  }, [user]);

// ✅ SAVE: Working version without HeadingLevel
const handleSave = async () => {
  console.log('📝 Save started...');
  
  if (!editor) {
    alert('Please write some content first.');
    return;
  }

  setIsSaving(true);
  
  try {
    const content = editor?.getHTML() || '';
    const plainText = editor?.getText() || '';
    
    console.log('📝 Content length:', content.length);
    console.log('📝 Plain text length:', plainText.length);
    
    if (!plainText.trim()) {
      alert('Please write some content before saving.');
      setIsSaving(false);
      return;
    }
    
    // Get title and category for file name
    const fileName = `${title || 'Untitled'}_${category}_${new Date().toISOString().split('T')[0]}.docx`;
    console.log('📝 File name:', fileName);
    
    // ✅ Create DOCX document - NO HeadingLevel
    const doc = new DocxDocument({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.5),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: title || 'Untitled Message',
                size: 28,
                bold: true,
                font: 'Times New Roman',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          // Category
          new Paragraph({
            children: [
              new TextRun({
                text: `Category: ${category}`,
                size: 16,
                color: '888888',
                font: 'Times New Roman',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          // Separator line
          new Paragraph({
            children: [
              new TextRun({
                text: '─'.repeat(60),
                size: 16,
                color: 'C9A84C',
                font: 'Times New Roman',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
        ],
      }],
    });

    // ✅ Parse HTML content into simple paragraphs
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(content, 'text/html');
    const body = htmlDoc.body;

    // Get all paragraphs
    const paragraphs: any[] = [];
    const allParagraphs = body.querySelectorAll('p, div, blockquote');
    
    for (const element of allParagraphs) {
      const text = element.textContent || '';
      if (text.trim()) {
        // Check if it's a heading (contains bold or large text)
        const isHeading = element.querySelector('strong, b, h1, h2, h3') !== null;
        const textRun = new TextRun({
          text: text,
          size: isHeading ? 28 : 22,
          bold: isHeading ? true : false,
          font: 'Times New Roman',
        });
        
        // Check if it's a blockquote
        const isBlockquote = element.tagName.toLowerCase() === 'blockquote';
        
        paragraphs.push(new Paragraph({
          children: [textRun],
          alignment: isBlockquote ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { 
            after: isBlockquote ? 200 : 150,
            before: isBlockquote ? 200 : 0,
          },
          indent: isBlockquote ? { left: 720, right: 720 } : undefined,
        }));
      }
    }

    console.log('📝 Found', paragraphs.length, 'paragraphs');
    
    // Add paragraphs to document
    const section = docx.sections[0];
    for (const para of paragraphs) {
      section.children.push(para);
    }

    console.log('📝 Generating blob...');
    const blob = await Packer.toBlob(doc);
    console.log('📝 Blob created, size:', blob.size, 'bytes');
    
    if (blob.size === 0) {
      console.error('❌ Blob is empty!');
      alert('Error: The document is empty. Please try again.');
      setIsSaving(false);
      return;
    }
    
    console.log('📝 Starting download...');
    
    // ✅ Try native "Save As" dialog (Chrome/Edge)
    try {
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: 'Word Document',
              accept: { 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] 
              },
            }],
          });
          
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          console.log('✅ File saved successfully via File Picker!');
          alert('✅ File saved successfully!');
          setIsSaving(false);
          return;
        } catch (fileError: any) {
          if (fileError.name === 'AbortError' || fileError.message?.includes('abort')) {
            console.log('📝 User cancelled save');
            setIsSaving(false);
            return;
          }
          console.log('⚠️ File Picker failed, using fallback:', fileError.message);
        }
      }
      
      // ✅ Fallback: Direct download (works in all browsers)
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 5000);
      
      console.log('✅ File downloaded successfully!');
      alert('✅ File saved successfully!');
      
    } catch (downloadError) {
      console.error('❌ Download error:', downloadError);
      // Last resort
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 5000);
      
      alert('✅ File saved successfully!');
    }
    
  } catch (error: any) {
    console.error('❌ Save error DETAILED:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    alert('❌ Error saving file: ' + (error.message || 'Please try again.'));
  }
  setIsSaving(false);
};

  // ✅ OPEN: Import DOCX file
  const handleOpen = () => {
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Parse DOCX to HTML
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        // Load content into editor
        if (editor) {
          editor.commands.setContent(result.value);
        }
        
        // Try to extract title from first heading
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = result.value;
        const firstHeading = tempDiv.querySelector('h1, h2, h3');
        if (firstHeading) {
          setTitle(firstHeading.textContent || '');
        }
        
        alert('✅ File opened successfully!');
      } catch (error) {
        console.error('❌ Open error:', error);
        alert('❌ Error opening file. Please make sure it\'s a valid .docx file.');
      }
    };
    
    input.click();
  };

  // ✅ Load conversation with messages - exposed via ref
  const loadConversationWithMessages = useCallback((chatId: string, messagesData: any[], title: string) => {
    console.log('📂 WriterViewport: Loading conversation with messages:', chatId, messagesData?.length || 0);
    
    if (!messagesData || messagesData.length === 0) {
      console.log('⚠️ No messages to load');
      return;
    }
    
    setWriterConversationId(chatId);
    setDifyConversationId(chatId);
    
    const loadedMessages = messagesData.map((msg: any, index: number) => ({
      id: `msg-${chatId}-${index}-${Date.now()}`,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
    }));
    
    setMessages(loadedMessages);
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // ✅ Start new chat
  const startNewChat = useCallback(() => {
    console.log('🔄 WriterViewport: New chat');
    setMessages([]);
    setChatInput('');
    setDifyConversationId(null);
    setWriterConversationId(null);
    setStreamingText('');
    setIsGenerating(false);
    stopRequested.current = false;
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
    }
  }, []);

  // ✅ Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    loadConversationWithMessages,
    startNewChat,
    getCurrentMessages: () => messages,
    getCurrentConversationId: () => writerConversationId,
  }));

  // ✅ Save chat conversation to history
  const saveChatConversation = useCallback(() => {
    if (!user || messages.length === 0) return;
    
    try {
      const messagesToSave = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.getTime(),
      }));

      const conversationId = writerConversationId || `writer-${Date.now()}`;
      const title = messages[0]?.content?.substring(0, 50) || 'Writer Chat';
      
      const stored = localStorage.getItem(`manustry_conversations_${user.id}`);
      let existing = stored ? JSON.parse(stored) : [];
      const newConversation = {
        _id: conversationId,
        title: title,
        messages: messagesToSave,
        pinned: false,
        userId: user.id,
        lastUpdated: Date.now(),
        category: 'writer',
      };
      
      const exists = existing.some((c: any) => c._id === conversationId);
      if (exists) {
        existing = existing.map((c: any) => c._id === conversationId ? newConversation : c);
      } else {
        existing = [newConversation, ...existing];
      }
      localStorage.setItem(`manustry_conversations_${user.id}`, JSON.stringify(existing));
      
      setWriterConversationId(conversationId);
      console.log('💾 Writer chat saved to history');
    } catch (error) {
      console.error('❌ Save chat error:', error);
    }
  }, [user, messages, writerConversationId]);

  // Save chat when messages change
  useEffect(() => {
    if (messages.length > 0 && user) {
      saveChatConversation();
    }
  }, [messages, user, saveChatConversation]);

  // Chat functions with Dify integration
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isGenerating) return;
    
    stopRequested.current = false;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const sentInput = chatInput;
    setChatInput('');
    setIsGenerating(true);
    setStreamingText('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    abortControllerRef.current = new AbortController();

    try {
      await sendDifyMessage(
        sentInput,
        getUserName(),
        difyConversationId,
        (chunk: string, isComplete: boolean) => {
          if (stopRequested.current) return;
          setStreamingText(chunk);

          if (isComplete && !stopRequested.current) {
            const cleanChunk = chunk.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: cleanChunk || 'No response from AI',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
            setStreamingText('');
            setIsGenerating(false);
          }
        },
        (id: string) => {
          console.log('🆔 New Dify conversation ID:', id);
          setDifyConversationId(id);
        },
        (error: string) => {
          console.error('Error:', error);
          if (!stopRequested.current) {
            sendDifyMessageBlocking(sentInput, getUserName(), difyConversationId)
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
                }
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
  };

  // Stop response
  const stopResponse = useCallback(() => {
    console.log('⏹️ Stop pressed');
    stopRequested.current = true;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setStreamingText('');
    setIsGenerating(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Uniform dark background
  const darkBg = darkMode ? "bg-[#0F1318]" : "bg-[#F5F0EB]";
  const panelBg = darkMode ? "bg-[#0F1318]" : "bg-[#F5F0EB]";
  const cardBorder = darkMode ? "border-[#C9A84C]/20" : "border-[#C9A84C]/30";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const inputBg = darkMode ? "bg-[#1A1F2E]" : "bg-gray-100";
  const inputBorder = darkMode ? "border-[#C9A84C]/20" : "border-[#C9A84C]/30";

  const getCategoryOptions = () => {
    const baseOptions = ['devotion', 'preaching', 'sermon', 'bible-study'];
    const allOptions = [...baseOptions, ...customCategories];
    return allOptions;
  };

  const getMessageKey = (message: Message, index: number) => {
    return `${message.id}-${index}`;
  };

  return (
    <div className={`h-full w-full ${darkBg} flex flex-col overflow-hidden`} style={{ position: 'relative', zIndex: 20 }}>
      {/* Top Bar */}
      <div className={`${panelBg} border-b ${cardBorder} p-3 flex-shrink-0`}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Message..."
            className={`flex-1 min-w-[150px] ${inputBg} border ${inputBorder} rounded-lg px-4 py-2 text-sm ${textColor} placeholder:${subTextColor} focus:outline-none focus:border-[#C9A84C] transition`}
          />
          
          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  setShowCustomCategoryInput(true);
                  setCustomCategoryInput('');
                } else {
                  setShowCustomCategoryInput(false);
                  setCategory(value);
                }
              }}
              className={`${inputBg} border ${inputBorder} rounded-lg px-3 py-2 text-sm ${textColor} focus:outline-none focus:border-[#C9A84C] transition`}
            >
              {getCategoryOptions().map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </option>
              ))}
              <option value="custom">+ Add Custom</option>
            </select>
            
            {showCustomCategoryInput && (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="New category..."
                  className={`${inputBg} border ${inputBorder} rounded-lg px-3 py-2 text-sm ${textColor} placeholder:${subTextColor} focus:outline-none focus:border-[#C9A84C] transition w-32`}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customCategoryInput.trim()) {
                      saveCustomCategory(customCategoryInput);
                    }
                    if (e.key === 'Escape') {
                      setShowCustomCategoryInput(false);
                      setCustomCategoryInput('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (customCategoryInput.trim()) {
                      saveCustomCategory(customCategoryInput);
                    }
                  }}
                  className="bg-[#C9A84C] text-[#1A1F2E] px-3 py-2 rounded-lg hover:bg-[#E8D5A3] transition text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCustomCategoryInput(false);
                    setCustomCategoryInput('');
                  }}
                  className="text-gray-400 hover:text-red-400 transition px-2"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ SAVE Button - Downloads as DOCX */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`${panelBg} border ${cardBorder} px-4 py-2 rounded-lg hover:bg-[#C9A84C]/10 transition text-sm flex items-center gap-2 disabled:opacity-50 ${textColor}`}
            >
              {isSaving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="text-base">💾</span>
                  Save
                </>
              )}
            </button>

            {/* ✅ OPEN Button - Imports DOCX */}
            <button
              onClick={handleOpen}
              className={`${panelBg} border ${cardBorder} px-4 py-2 rounded-lg hover:bg-[#C9A84C]/10 transition text-sm flex items-center gap-2 ${textColor}`}
            >
              <span className="text-base">📂</span>
              Open
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div ref={containerRef} className={`flex-1 flex overflow-hidden ${panelBg}`}>
        {isMobileView ? (
          // Mobile View
          <div className={`flex-1 flex flex-col ${panelBg}`}>
            <div className={`flex border-b ${cardBorder} p-2 gap-2 flex-shrink-0`}>
              <button
                onClick={() => setActivePanel('editor')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                  activePanel === 'editor'
                    ? 'bg-[#C9A84C] text-[#1A1F2E]'
                    : darkMode ? 'text-gray-400 hover:text-[#E8D5A3]' : 'text-gray-600 hover:text-[#C9A84C]'
                }`}
              >
                ✍️ YOUR MESSAGE
              </button>
              <button
                onClick={() => setActivePanel('chat')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                  activePanel === 'chat'
                    ? 'bg-[#C9A84C] text-[#1A1F2E]'
                    : darkMode ? 'text-gray-400 hover:text-[#E8D5A3]' : 'text-gray-600 hover:text-[#C9A84C]'
                }`}
              >
                🕮 MANUSTRY ASSISTANT
              </button>
            </div>

            {activePanel === 'editor' ? (
              <div className={`flex-1 flex flex-col overflow-hidden ${panelBg}`}>
                <RichTextToolbar editor={editor} />
                <div className="flex-1 overflow-y-auto">
                  <EditorContent editor={editor} className="h-full" />
                </div>
              </div>
            ) : (
              <div className={`flex-1 flex flex-col overflow-hidden ${panelBg}`}>
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="text-center pt-4">
                      <p className={`text-sm ${subTextColor} mb-4`}>Ask MANUSTRY for help with outlines, Scriptures, or inspiration.</p>
                      <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                        {WRITER_SUGGESTIONS.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setChatInput(suggestion.text)}
                            className={`${panelBg} border ${cardBorder} rounded-lg px-4 py-2 text-sm ${textColor} hover:border-[#C9A84C] transition text-left`}
                          >
                            {suggestion.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <MessageBubble
                          key={getMessageKey(message, index)}
                          message={message}
                          onCopy={(content) => navigator.clipboard.writeText(content)}
                          isGenerating={isGenerating}
                        />
                      ))}
                      {streamingText && (
                        <div className="flex justify-start items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <img 
                              src="/avatar.png" 
                              alt="MANUSTRY" 
                              className="w-20 h-20 rounded-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                            />
                          </div>
                          <div className={`max-w-[85%] flex-1 rounded-lg px-4 py-3 ${panelBg} border ${cardBorder}`}>
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
                        <div className="flex justify-start items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <img 
                              src="/avatar.png" 
                              alt="MANUSTRY" 
                              className="w-20 h-20 rounded-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                            />
                          </div>
                          <div className={`${panelBg} border ${cardBorder} rounded-lg px-4 py-3`}>
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
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                {/* Chat input at bottom with footer */}
                <div className={`p-3 border-t ${cardBorder} flex-shrink-0 ${panelBg}`}>
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={chatInput}
                      onChange={(e) => {
                        setChatInput(e.target.value);
                        autoResizeTextarea();
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask for help with your message..."
                      className={`flex-1 ${inputBg} border ${inputBorder} rounded-lg px-4 py-2 text-sm ${textColor} placeholder:${subTextColor} focus:outline-none focus:border-[#C9A84C] transition resize-none overflow-y-auto min-h-[40px] max-h-[120px]`}
                      disabled={isGenerating}
                      rows={1}
                      style={{ height: 'auto' }}
                    />
                    {isGenerating ? (
                      <button
                        onClick={stopResponse}
                        className="bg-red-600 text-white w-10 h-10 rounded-lg hover:bg-red-700 transition flex items-center justify-center flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" strokeWidth={2} />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isGenerating}
                        className="bg-[#C9A84C] text-[#1A1F2E] w-10 h-10 rounded-lg hover:bg-[#E8D5A3] transition flex items-center justify-center disabled:opacity-50 flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Footer */}
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
            )}
          </div>
        ) : (
          // Desktop View - Dual Panel with Splitter
          <>
            {/* Left Panel - Editor */}
            <div 
              style={{ width: `${splitWidth}%` }} 
              className={`h-full flex flex-col overflow-hidden ${panelBg}`}
            >
              <div className={`flex-shrink-0 p-3 border-b ${cardBorder}`}>
                <h3 className={`text-sm font-semibold ${textColor} flex items-center gap-2`}>
                  <span className="text-base">✍️</span> YOUR MESSAGE
                </h3>
              </div>

              <RichTextToolbar editor={editor} />
              <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} className="h-full" />
              </div>
            </div>

            {/* Draggable Splitter */}
            <div
              className={`w-1.5 cursor-col-resize hover:bg-[#C9A84C] transition-colors relative flex-shrink-0 ${
                isDragging ? 'bg-[#C9A84C]' : 'bg-[#C9A84C]/30'
              }`}
              onMouseDown={handleDragStart}
              style={{ touchAction: 'none' }}
            >
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-12 bg-[#1A1F2E] border ${cardBorder} rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity shadow-md`}>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-0.5 h-2 bg-[#C9A84C] rounded-full"></div>
                  <div className="w-0.5 h-2 bg-[#C9A84C] rounded-full"></div>
                  <div className="w-0.5 h-2 bg-[#C9A84C] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Right Panel - Chat */}
            <div 
              style={{ width: `${100 - splitWidth}%` }} 
              className={`h-full flex flex-col overflow-hidden ${panelBg}`}
            >
              <div className={`flex-shrink-0 p-3 border-b ${cardBorder}`}>
                <h3 className={`text-sm font-semibold ${textColor} flex items-center gap-2`}>
                  <span className="text-base">🕮</span> MANUSTRY ASSISTANT
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="text-center pt-4">
                    <p className={`text-sm ${subTextColor} mb-4`}>Ask MANUSTRY for help with outlines, Scriptures, or inspiration.</p>
                    <div className="grid grid-cols-1 gap-2">
                      {WRITER_SUGGESTIONS.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setChatInput(suggestion.text)}
                          className={`${panelBg} border ${cardBorder} rounded-lg px-4 py-2 text-sm ${textColor} hover:border-[#C9A84C] transition text-left`}
                        >
                          {suggestion.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <MessageBubble
                        key={getMessageKey(message, index)}
                        message={message}
                        onCopy={(content) => navigator.clipboard.writeText(content)}
                        isGenerating={isGenerating}
                      />
                    ))}
                    {streamingText && (
                      <div className="flex justify-start items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <img 
                            src="/avatar.png" 
                            alt="MANUSTRY" 
                            className="w-20 h-20 rounded-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                          />
                        </div>
                        <div className={`max-w-[85%] flex-1 rounded-lg px-4 py-3 ${panelBg} border ${cardBorder}`}>
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
                      <div className="flex justify-start items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <img 
                            src="/avatar.png" 
                            alt="MANUSTRY" 
                            className="w-20 h-20 rounded-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                          />
                        </div>
                        <div className={`${panelBg} border ${cardBorder} rounded-lg px-4 py-3`}>
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
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Chat input at the BOTTOM with footer */}
              <div className={`p-3 border-t ${cardBorder} flex-shrink-0 ${panelBg}`}>
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value);
                      autoResizeTextarea();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask for help with your message..."
                    className={`flex-1 ${inputBg} border ${inputBorder} rounded-lg px-4 py-2 text-sm ${textColor} placeholder:${subTextColor} focus:outline-none focus:border-[#C9A84C] transition resize-none overflow-y-auto min-h-[40px] max-h-[120px]`}
                    disabled={isGenerating}
                    rows={1}
                    style={{ height: 'auto' }}
                  />
                  {isGenerating ? (
                    <button
                      onClick={stopResponse}
                      className="bg-red-600 text-white w-10 h-10 rounded-lg hover:bg-red-700 transition flex items-center justify-center flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" strokeWidth={2} />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isGenerating}
                      className="bg-[#C9A84C] text-[#1A1F2E] w-10 h-10 rounded-lg hover:bg-[#E8D5A3] transition flex items-center justify-center disabled:opacity-50 flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Footer */}
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
          </>
        )}
      </div>
    </div>
  );
});

WriterViewport.displayName = "WriterViewport";

export default WriterViewport;