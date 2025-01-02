// Add chat history array at the start of the file
let chatHistory = [];

// Add a cache object at the start of the file
const responseCache = [];

// Add these functions at the beginning of the file
async function fetchWithRetry(url, options, maxRetries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            throw new Error(`Attempt ${attempt}: API error ${response.status}`);
        } catch (error) {
            if (attempt === maxRetries) throw error;
            console.log(`Retry attempt ${attempt} failed, retrying in ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

function showTypingIndicator() {
    const chat = document.getElementById('chat');
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('chat-message', 'assistant', 'typing');
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    chat.appendChild(typingDiv);
    chat.scrollTop = chat.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Add function to format code blocks
function formatMessage(content) {
    // First escape HTML to prevent XSS, except for allowed tags
    content = escapeHtml(content);
    
    // Format markdown elements
    let formatted = content
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Strikethrough
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        // Unordered lists
        .replace(/^\- (.*?)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        // Ordered lists
        .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ol>$1</ol>')
        // Format markdown links
        .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, 
            '<a href="$2" target="_blank" rel="noopener noreferrer" class="formatted-link">$1</a>')
        // Format code blocks with syntax highlighting
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
            const languageClass = language ? `language-${language}` : '';
            return `<pre><code class="${languageClass}">${escapeHtml(code.trim())}</code></pre>`;
        })
        // Format inline code
        .replace(/`([^`]+)`/g, (match, code) => {
            return `<code class="inline-code">${escapeHtml(code)}</code>`;
        });
    
    return formatted;
}

// Add HTML escape function
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Add functions to open and close the code modal
function openCodeModal(code, language = 'javascript') {
    const modal = document.getElementById('codeModal');
    const modalCode = document.getElementById('modalCode');
    modalCode.textContent = code;
    modalCode.className = `language-${language}`;
    Prism.highlightElement(modalCode);
    modal.style.display = 'block';
}

function closeCodeModal() {
    const modal = document.getElementById('codeModal');
    modal.style.display = 'none';
}

// Define the updated AI assistant prompt with enhanced intelligence
const aiBasePrompt = `
You are hexacola, an advanced AI assistant with extensive knowledge and superior problem-solving abilities across various domains. Your capabilities include:

1. **In-depth Analysis:**
   - Provide comprehensive analyses on complex topics in science, technology, history, and more.

2. **Advanced Problem-Solving:**
   - Solve intricate mathematical, logical, and technical problems with detailed explanations.

3. **Contextual Understanding:**
   - Maintain a broader context of the conversation to provide more accurate and relevant responses.

4. **Specialized Knowledge Integration:**
   - Utilize specialized AI models for tasks such as code debugging, data analysis, and creative writing.

Ensure all responses are precise, insightful, and tailored to the user's needs while maintaining a clear and professional tone.
`;

// Add AI thinking process steps
const aiThinkingSteps = {
    understand: "Understanding your query...",
    analyze: "Analyzing context and components...",
    generate: "Generating thoughtful response...",
    verify: "Verifying accuracy and relevance...",
    formulate: "Formulating final response..."
};

// Update the sendMessage function for friendly responses
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const modelSelect = document.getElementById('modelSelect');
    const message = chatInput.value.trim();
    const selectedModel = modelSelect.value;
    
    if (message === '') return;

    // Check if response is cached
    if (responseCache[message]) {
        appendMessage('assistant', responseCache[message]);
        chatInput.value = '';
        return;
    }

    // Add user message to history
    chatHistory.push({ role: 'user', content: message });
    appendMessage('user', message);
    chatInput.value = '';
    showTypingIndicator();

    // Show AI thinking process
    showThinkingProcess();

    try {
        const contextSize = 15; // Increased context window
        const lastMessages = chatHistory.slice(-contextSize);
        
        // Create prioritized message array
        const prioritizedMessages = [
            {
                role: 'system',
                content: aiBasePrompt
            },
            // Add memory reinforcement message
            {
                role: 'system',
                content: 'Remember to maintain context from the entire conversation. The previous message is particularly important for context.'
            },
            ...lastMessages.slice(0, -1), // All messages except the last one
            // Add importance marker for the previous message
            {
                role: 'system',
                content: 'The following message is particularly important for context:'
            },
            lastMessages[lastMessages.length - 1] // The last message
        ];

        // Create thinking context
        const thinkingContext = {
            query: message,
            components: message.split(' ').filter(word => word.length > 3),
            intent: detectIntent(message),
            context: chatHistory.slice(-3)
        };

        // Enhanced message array with thinking context
        const enhancedMessages = [
            {
                role: 'system',
                content: `${aiBasePrompt}\n\nThinking Context:\n${JSON.stringify(thinkingContext, null, 2)}`
            },
            ...chatHistory
        ];

        const response = await fetchWithRetry('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: prioritizedMessages,
                model: selectedModel,
                seed: Math.floor(Math.random() * 100000),
                jsonMode: false
            }),
        });

        const data = await response.text();
        let assistantMessage;

        try {
            const jsonData = JSON.parse(data);
            if (jsonData.choices && jsonData.choices.length > 0) {
                assistantMessage = jsonData.choices[0].message?.content;
            } else if (jsonData.response) {
                assistantMessage = jsonData.response;
            }
        } catch (e) {
            assistantMessage = data;
        }

        if (assistantMessage) {
            removeThinkingProcess();
            // Cache the response
            responseCache[message] = assistantMessage;
            // Add assistant message to history
            chatHistory.push({ role: 'assistant', content: assistantMessage });
            removeTypingIndicator();
            appendMessage('assistant', assistantMessage);
            
            // Save chat history to localStorage
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        } else {
            throw new Error('No valid response content');
        }

    } catch (error) {
        console.error('Chat error:', error);
        removeThinkingProcess();
        appendMessage('assistant', `I'm sorry, something went wrong. Please try again.`);
    }
}

// Add new functions for AI thinking visualization
function showThinkingProcess() {
    const chat = document.getElementById('chat');
    const thinkingDiv = document.createElement('div');
    thinkingDiv.id = 'thinking-process';
    thinkingDiv.classList.add('thinking-process');
    
    Object.values(aiThinkingSteps).forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.classList.add('thinking-step');
        stepDiv.textContent = step;
        thinkingDiv.appendChild(stepDiv);
        
        // Animate steps sequentially
        setTimeout(() => {
            stepDiv.classList.add('active');
            // Mark previous step as complete
            if (index > 0) {
                thinkingDiv.children[index - 1].classList.add('complete');
            }
            chat.scrollTop = chat.scrollHeight;
        }, index * 1000);
    });
    
    chat.appendChild(thinkingDiv);
    chat.scrollTop = chat.scrollHeight;
}

function removeThinkingProcess() {
    const thinkingProcess = document.getElementById('thinking-process');
    if (thinkingProcess) {
        thinkingProcess.classList.add('removing');
        setTimeout(() => {
            thinkingProcess.remove();
        }, 300); // Match the fadeOut animation duration
    }
}

function detectIntent(message) {
    const intents = {
        question: /^(what|how|why|when|where|who|can you|could you)/i,
        command: /^(make|create|generate|show|tell|give|find)/i,
        statement: /^(i|this|that|it|there)/i,
        greeting: /^(hi|hello|hey|greetings)/i
    };

    for (const [intent, pattern] of Object.entries(intents)) {
        if (pattern.test(message)) return intent;
    }
    return 'unknown';
}

// Add model validation function
function validateModel(model) {
    const validModels = [
        'openai', 'qwen', 'qwen-coder', 'mistral', 
        'mistral-large', 'searchgpt', 'evil', 'p1'
    ];
    return validModels.includes(model);
}

// Update appendMessage function
function appendMessage(role, content) {
    const chat = document.getElementById('chat');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', role);
    
    // Format message content
    const formattedContent = formatMessage(content);
    messageDiv.innerHTML = formattedContent;
    
    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;
    
    // Highlight all code blocks using Prism.js
    Prism.highlightAllUnder(messageDiv);
}

// Ensure modal can be closed when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('codeModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Dark mode functionality
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const darkBtn = document.querySelector('.dark-mode-toggle');
    if (document.body.classList.contains('dark-mode')) {
        darkBtn.innerHTML = '<i class="fas fa-sun"></i> ☀️';
        darkBtn.setAttribute('aria-label', 'Light Mode');
    } else {
        darkBtn.innerHTML = '<i class="fas fa-moon"></i> 🌙';
        darkBtn.setAttribute('aria-label', 'Dark Mode');
    }
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function loadDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
        const darkBtn = document.querySelector('.dark-mode-toggle');
        darkBtn.innerHTML = '<i class="fas fa-sun"></i> ☀️';
        darkBtn.setAttribute('aria-label', 'Light Mode');
    }
}

// Add a friendly welcome message on load
document.addEventListener('DOMContentLoaded', () => {
    loadDarkMode();
    
    // Add enter key support for chat input
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Add model select validation
    const modelSelect = document.getElementById('modelSelect');
    modelSelect.addEventListener('change', (e) => {
        if (!validateModel(e.target.value)) {
            console.error('Invalid model selected');
            e.target.value = 'openai'; // Reset to default model
        }
    });

    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        // Display previous messages
        chatHistory.forEach(msg => appendMessage(msg.role, msg.content));
    } else {
        // Display a friendly welcome message
        appendMessage('assistant', 'Hello! I\'m hexacola, your friendly assistant. How can I help you today?');
    }

    // Add clear history button event listener
    const clearButton = document.getElementById('clearChat');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            chatHistory = [];
            localStorage.removeItem('chatHistory');
            const chat = document.getElementById('chat');
            chat.innerHTML = '';
            // Optionally, add a message indicating the chat has been cleared
            appendMessage('assistant', 'Chat history cleared. Let\'s start fresh!');
        });
    }
});
