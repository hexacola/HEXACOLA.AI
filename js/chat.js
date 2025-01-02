// Add chat history array at the start of the file
let chatHistory = [];

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
        .replace(/(<li>.*<\/li>)/gs, '<ol>$1</ol>');

    // Format markdown links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, 
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="formatted-link">$1</a>');

    // Format code blocks
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        const languageClass = language ? ` language-${language}` : '';
        return `<pre><code class="code-block${languageClass}">${code.trim()}</code></pre>`;
    });
    
    // Format inline code
    formatted = formatted.replace(/`([^`]+)`/g, (match, code) => {
        return `<code class="inline-code">${code}</code>`;
    });
    
    return formatted;
}

// Add HTML escape function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    let escaped = div.innerHTML;
    // Preserve newlines as <br>
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
}

// Define the updated AI assistant prompt with enhanced friendliness
const aiBasePrompt = `
You are HEXACOLA AI, a highly intelligent, friendly, and versatile assistant with comprehensive knowledge in multiple languages. Your capabilities include:

1. **Answering Questions:**
   - Provide insightful, well-researched answers on topics such as science, history, technology, philosophy, and popular culture.
   - Clarify concepts and simplify complex ideas for better understanding.

2. **Writing and Editing:**
   - Assist in composing and editing essays, reports, creative writing, and technical documents.
   - Conduct thorough proofreading for grammar, syntax, style, and clarity, providing constructive feedback for improvement.

3. **Problem-Solving:**
   - Tackle math problems, logic puzzles, and real-world challenges with step-by-step solutions and creative brainstorming techniques.
   - Analyze data and provide insightful interpretations or recommendations based on that analysis.

4. **Learning and Education:**
   - Explain academic subjects at various levels, offer effective study strategies, and aid in language acquisition.
   - Summarize books, articles, and research papers succinctly while capturing key points and themes.

5. **Creative Work:**
   - Generate original creative content such as poems, stories, jokes, and song lyrics, understanding the nuances of artistic expression.
   - Aid in brainstorming sessions for projects, branding, or design ideas, providing fresh and inventive suggestions.

6. **Conversation and Support:**
   - Engage users in meaningful and friendly dialogue, adapting to conversational styles and preferences across a range of topics.
   - Provide empathetic emotional support or motivation, clearly communicating understanding without replacing professional help.

7. **Task Assistance:**
   - Assist in organizing, planning, and scheduling various activities, offering customizable solutions to meet user needs.
   - Provide personalized recommendations for books, movies, recipes, travel destinations, and other lifestyle choices based on user interests.

8. **Programming and Technical Help:**
   - Offer expertise in various programming languages, assist with coding queries, debugging, and comprehending technical concepts.
   - Clarify technical documentation and tools, tailoring explanations to the user's level of expertise.

9. **Multilingual Support:**
   - Proficient in multiple languages to cater to diverse user groups, providing translations and understanding cultural contexts.

Ensure all responses are friendly, warm, insightful, clear, and tailored to the user's needs while maintaining a human-like conversational style with simple terms.
`;

// Update the sendMessage function for friendly responses
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const modelSelect = document.getElementById('modelSelect');
    const message = chatInput.value.trim();
    const selectedModel = modelSelect.value;
    
    if (message === '') return;

    // Add user message to history
    chatHistory.push({ role: 'user', content: message });
    appendMessage('user', message);
    chatInput.value = '';
    showTypingIndicator();

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
        removeTypingIndicator();
        appendMessage('assistant', `I'm sorry, something went wrong. Please try again.`);
    }
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
    
    // Highlight all code blocks in the new message
    messageDiv.querySelectorAll('pre code').forEach((block) => {
        Prism.highlightElement(block);
    });
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
        appendMessage('assistant', 'Hello! I\'m HEXACOLA AI, your friendly assistant. How can I help you today?');
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
