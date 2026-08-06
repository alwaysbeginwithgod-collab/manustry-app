/* ============================================================ */
// MANUSTRY - Main Application Script
// ============================================================ */

(function() {
    'use strict';

    // ============================================================
    // CONFIGURATION
    // ============================================================
    const CONFIG = {
        // --- DIFY API ---
        DIFY_API_URL: 'https://api.dify.ai/v1', // Replace with your Dify endpoint
        DIFY_API_KEY: 'app-rjONkf17SAA3hUoljNWdS1by', // <-- PASTE YOUR DIFY API KEY HERE
        DIFY_APP_ID: 'EKFGSivZDLe960Mo', // <-- PASTE YOUR DIFY APP ID HERE

        // --- Daily Query Limit (Guest) ---
        GUEST_QUERY_LIMIT: 7,

        // --- Daily Promises (Fallback & Rotation) ---
        PROMISES: [
            { quote: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.', ref: 'Joshua 1:9 (KJV)' },
            { quote: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', ref: 'John 3:16 (KJV)' },
            { quote: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.', ref: 'Romans 8:28 (KJV)' },
            { quote: 'I can do all things through Christ which strengtheneth me.', ref: 'Philippians 4:13 (KJV)' },
            { quote: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.', ref: 'Ephesians 2:8 (KJV)' },
            { quote: 'The LORD is my shepherd; I shall not want.', ref: 'Psalm 23:1 (KJV)' },
            { quote: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.', ref: 'Proverbs 3:5 (KJV)' },
            { quote: 'Be strong and of a good courage, fear not, nor be afraid of them: for the LORD thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee.', ref: 'Deuteronomy 31:6 (KJV)' },
            { quote: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.', ref: 'Isaiah 40:31 (KJV)' },
            { quote: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.', ref: 'Isaiah 41:10 (KJV)' }
        ],

        // --- Daily Rhymes (Rotation) ---
        RHYMES: [
            'The fire was not sent to make us fall apart, but to burn what is false and refine the heart.',
            'When trials come and storms arise, look to the Cross with trusting eyes.',
            'The Word of God is living bread, to feed the soul and raise the dead.',
            'Grace is not a license to sin, but power to live holy from within.',
            'Prayer is the key that opens heaven\'s door, and faith is the hand that turns it evermore.'
        ],

        // --- Suggested Prompts ---
        PROMPTS: [
            'Does the Bible forbid us to pray to Mary?',
            'Explain the book of Revelation',
            'Create a preaching message about sin',
            'What is the unpardonable sin?'
        ]
    };

    // ============================================================
    // STATE
    // ============================================================
    const state = {
        queryCount: 0,
        isGuest: true,
        isAdmin: false,
        userName: 'Friend',
        conversationId: null,
        isProcessing: false
    };

    // ============================================================
    // DOM REFS
    // ============================================================
    const DOM = {
        chatMessages: document.getElementById('chatMessages'),
        chatInput: document.getElementById('chatInput'),
        sendBtn: document.getElementById('sendBtn'),
        typingIndicator: document.getElementById('typingIndicator'),
        queryCounter: document.getElementById('queryCounter'),
        greeting: document.getElementById('greeting'),
        dailyPromise: document.getElementById('dailyPromise'),
        dailyPromiseRef: document.getElementById('dailyPromiseRef'),
        dailyRhyme: document.getElementById('dailyRhyme'),
        promptsGrid: document.getElementById('promptsGrid'),
        themeToggle: document.getElementById('themeToggle'),
        signInBtn: document.getElementById('signInBtn')
    };

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================

    /** Get today's date-based index for rotation */
    function getDailyIndex(arrayLength) {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        return dayOfYear % arrayLength;
    }

    /** Format a scripture reference for display */
    function formatScripture(text) {
        // Wrap scripture references in a span with class "scripture"
        const pattern = /([A-Za-z]+\s*\d*:\d+(?:-\d+)?)/g;
        return text.replace(pattern, '<span class="scripture">$1</span>');
    }

    /** Escape HTML to prevent XSS */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /** Simple delay for typing indicator */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============================================================
    // DAILY CONTENT LOADER
    // ============================================================

    function loadDailyContent() {
        // --- Bible Promise ---
        const promiseIndex = getDailyIndex(CONFIG.PROMISES.length);
        const promise = CONFIG.PROMISES[promiseIndex];
        if (DOM.dailyPromise) DOM.dailyPromise.textContent = promise.quote;
        if (DOM.dailyPromiseRef) DOM.dailyPromiseRef.textContent = '— ' + promise.ref;

        // --- Daily Rhyme ---
        const rhymeIndex = getDailyIndex(CONFIG.RHYMES.length);
        const rhyme = CONFIG.RHYMES[rhymeIndex];
        if (DOM.dailyRhyme) {
            // Split on comma or period for line break if needed
            const parts = rhyme.split(', ');
            if (parts.length > 1) {
                DOM.dailyRhyme.innerHTML = parts.join(',<br />');
            } else {
                DOM.dailyRhyme.textContent = rhyme;
            }
        }
    }

    // ============================================================
    // PROMPT CHIPS
    // ============================================================

    function setupPromptChips() {
        if (!DOM.promptsGrid) return;
        DOM.promptsGrid.querySelectorAll('.prompt-chip').forEach(chip => {
            chip.addEventListener('click', function() {
                const prompt = this.dataset.prompt;
                if (prompt) {
                    DOM.chatInput.value = prompt;
                    DOM.chatInput.focus();
                    handleSendMessage();
                }
            });
        });
    }

    // ============================================================
    // QUERY COUNTER
    // ============================================================

    function updateQueryCounter() {
        const remaining = Math.max(0, CONFIG.GUEST_QUERY_LIMIT - state.queryCount);
        if (DOM.queryCounter) {
            if (state.isGuest) {
                DOM.queryCounter.textContent = remaining + ' queries remaining';
                DOM.queryCounter.style.color = remaining <= 2 ? '#e74c3c' : 'var(--gold-primary)';
            } else {
                DOM.queryCounter.textContent = '✨ Unlimited (Registered)';
                DOM.queryCounter.style.color = 'var(--gold-primary)';
            }
        }
    }

    // ============================================================
    // CHAT MESSAGES
    // ============================================================

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // If AI message, format scripture references
        if (!isUser) {
            contentDiv.innerHTML = formatScripture(escapeHtml(content));
        } else {
            contentDiv.textContent = content;
        }

        messageDiv.appendChild(contentDiv);
        DOM.chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        const container = DOM.chatMessages.closest('.chat-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }

        return messageDiv;
    }

    function showTypingIndicator() {
        if (DOM.typingIndicator) {
            DOM.typingIndicator.style.display = 'flex';
            const container = DOM.chatMessages.closest('.chat-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }
    }

    function hideTypingIndicator() {
        if (DOM.typingIndicator) {
            DOM.typingIndicator.style.display = 'none';
        }
    }

    // ============================================================
    // DIFY API CALL
    // ============================================================

    async function callDifyAPI(userMessage) {
        // Check if API key is configured
        if (CONFIG.DIFY_API_KEY === 'YOUR_DIFY_API_KEY_HERE') {
            // Demo mode - simulate AI response
            await delay(800);
            const demoResponses = [
                'That is a thoughtful question. Let us explore what Scripture teaches...',
                'The Word of God provides clear wisdom on this matter. Consider what the Apostle Paul wrote...',
                'This is an important topic for every believer. Let us turn to the King James Bible for guidance...',
                'Great question! Here is what the Lord reveals through His Word...',
                'Let me share what the Holy Scriptures say about this...'
            ];
            const randomIndex = Math.floor(Math.random() * demoResponses.length);
            return demoResponses[randomIndex] + ' (Demo: Please set your Dify API key in CONFIG)';
        }

        try {
            const response = await fetch(CONFIG.DIFY_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.DIFY_API_KEY}`
                },
                body: JSON.stringify({
                    query: userMessage,
                    conversation_id: state.conversationId || null,
                    inputs: {},
                    user: state.isGuest ? 'guest' : 'registered'
                })
            });

            if (!response.ok) {
                throw new Error(`Dify API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Store conversation ID for threading
            if (data.conversation_id) {
                state.conversationId = data.conversation_id;
            }

            return data.answer || 'I received your message but could not generate a response. Please try again.';
        } catch (error) {
            console.error('Dify API Error:', error);
            return '⚠️ I encountered an error connecting to the AI. Please check your API key or try again later.';
        }
    }

    // ============================================================
    // SEND MESSAGE HANDLER
    // ============================================================

    async function handleSendMessage() {
        const message = DOM.chatInput.value.trim();
        if (!message) return;
        if (state.isProcessing) return;

        // Check query limit for guests
        if (state.isGuest && state.queryCount >= CONFIG.GUEST_QUERY_LIMIT) {
            addMessage('🙏 You have reached your daily query limit. Please sign up for a free account to continue studying!', false);
            DOM.chatInput.value = '';
            return;
        }

        // Clear input
        DOM.chatInput.value = '';
        state.isProcessing = true;

        // Add user message
        addMessage(message, true);
        state.queryCount++;
        updateQueryCounter();

        // Show typing indicator
        showTypingIndicator();

        try {
            // Call Dify API
            const response = await callDifyAPI(message);
            hideTypingIndicator();
            addMessage(response, false);
        } catch (error) {
            hideTypingIndicator();
            addMessage('⚠️ An error occurred. Please try again.', false);
            console.error('Send message error:', error);
        }

        state.isProcessing = false;
        DOM.chatInput.focus();
    }

    // ============================================================
    // GREETING
    // ============================================================

    function setGreeting() {
        if (DOM.greeting) {
            const hour = new Date().getHours();
            let timeGreeting = 'Welcome';
            if (hour < 12) timeGreeting = 'Good morning';
            else if (hour < 17) timeGreeting = 'Good afternoon';
            else timeGreeting = 'Good evening';
            
            DOM.greeting.textContent = `${timeGreeting}, ${state.userName}`;
        }
    }

    // ============================================================
    // THEME TOGGLE
    // ============================================================

    function setupThemeToggle() {
        if (!DOM.themeToggle) return;
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('manustry-theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        DOM.themeToggle.addEventListener('click', function() {
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('manustry-theme', isLight ? 'light' : 'dark');
            this.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // ============================================================
    // SIGN IN (Placeholder)
    // ============================================================

    function setupSignIn() {
        if (!DOM.signInBtn) return;
        DOM.signInBtn.addEventListener('click', function() {
            alert('🔐 Sign In / Registration coming soon!\n\nFor now, you are using MANUSTRY as a guest.\n\n' +
                  '✝️ ' + CONFIG.GUEST_QUERY_LIMIT + ' free queries per day.\n' +
                  '📖 Study God\'s Word with confidence!');
        });
    }

    // ============================================================
    // KEYBOARD SHORTCUTS
    // ============================================================

    function setupKeyboardShortcuts() {
        DOM.chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function init() {
        // Load daily content
        loadDailyContent();

        // Set greeting
        setGreeting();

        // Setup prompt chips
        setupPromptChips();

        // Setup theme toggle
        setupThemeToggle();

        // Setup sign in
        setupSignIn();

        // Setup keyboard shortcuts
        setupKeyboardShortcuts();

        // Setup send button
        if (DOM.sendBtn) {
            DOM.sendBtn.addEventListener('click', handleSendMessage);
        }

        // Initial query counter
        updateQueryCounter();

        // Focus input on load
        setTimeout(() => DOM.chatInput.focus(), 500);

        console.log('✝️ MANUSTRY initialized. May God be glorified!');
        console.log(`📖 Daily queries: ${CONFIG.GUEST_QUERY_LIMIT} for guests`);
    }

    // ============================================================
    // RUN
    // ============================================================

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();