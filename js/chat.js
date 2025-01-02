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
        // Unordered lists - Fix for nested list creation
        .replace(/^[\s]*[-*+][\s]+(.*?)$/gm, '<li>$1</li>')
        // Ordered lists - Fix for nested list creation
        .replace(/^[\s]*\d+\.[\s]+(.*?)$/gm, '<li>$1</li>')
        // Wrap consecutive li elements in ul/ol tags
        .replace(/(<li>(?:(?!<li>)[\s\S])*?<\/li>(?:\s*<li>(?:(?!<li>)[\s\S])*?<\/li>)*)/g, function(match) {
            // Check if it's an ordered list (starts with number)
            if (content.match(/^\d+\./m)) {
                return '<ol>' + match + '</ol>';
            }
            return '<ul>' + match + '</ul>';
        })
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
    understand: {
        label: "Understanding Query",
        process: (query) => ({
            components: query.split(' ').filter(word => word.length > 3),
            intent: detectIntent(query),
            domain: detectDomain(query),
            requirements: extractRequirements(query)
        })
    },
    analyze: {
        label: "Analyzing Context",
        process: (context) => ({
            relevantHistory: context.slice(-3),
            patterns: findPatterns(context),
            keywords: extractKeywords(context)
        })
    },
    reason: {
        label: "Logical Reasoning",
        process: (data) => ({
            concepts: identifyRelatedConcepts(data),
            approach: determineApproach(data),
            considerations: gatherConsiderations(data)
        })
    },
    formulate: {
        label: "Formulating Response",
        process: (reasoning) => ({
            structure: buildResponseStructure(reasoning),
            tone: determineTone(reasoning),
            examples: gatherExamples(reasoning)
        })
    },
    verify: {
        label: "Verifying Accuracy",
        process: (response) => ({
            completeness: checkCompleteness(response),
            relevance: checkRelevance(response),
            clarity: assessClarity(response)
        })
    }
};

// Add helper functions for reasoning process
function detectDomain(query) {
    const domains = {
        technical: /\b(code|programming|software|hardware|computer|tech)\b/i,
        scientific: /\b(science|physics|chemistry|biology|math)\b/i,
        creative: /\b(art|design|write|create|generate|story)\b/i,
        general: /\b(what|how|why|when|explain|help)\b/i
    };
    
    for (const [domain, pattern] of Object.entries(domains)) {
        if (pattern.test(query)) return domain;
    }
    return 'general';
}

function extractRequirements(query) {
    const requirements = {
        needsExample: /\b(example|show|demonstrate)\b/i,
        needsExplanation: /\b(explain|why|how)\b/i,
        needsSteps: /\b(steps|guide|tutorial|how to)\b/i,
        needsComparison: /\b(versus|vs|compare|difference)\b/i
    };
    
    return Object.entries(requirements)
        .filter(([_, pattern]) => pattern.test(query))
        .map(([req]) => req);
}

// Update message formatting for reasoning display
function formatReasoningStep(step, data) {
    return `**${step.label}**\n${JSON.stringify(data, null, 2)}`;
}

// Add missing helper functions for reasoning process
function findPatterns(context) {
    // Analyze last few messages for patterns
    const patterns = [];
    if (context && context.length > 1) {
        const lastMessages = context.slice(-3);
        const keywords = lastMessages.map(msg => 
            msg.content.toLowerCase().match(/\b\w{4,}\b/g) || []
        );
        // Find repeated keywords
        const repeatedWords = keywords.flat().filter((word, i, arr) => 
            arr.indexOf(word) !== i
        );
        if (repeatedWords.length) {
            patterns.push('repeated_keywords');
        }
    }
    return patterns;
}

function extractKeywords(context) {
    const keywords = new Set();
    if (context && context.length) {
        context.forEach(msg => {
            const words = msg.content.toLowerCase()
                .match(/\b\w{4,}\b/g) || [];
            words.forEach(word => keywords.add(word));
        });
    }
    return Array.from(keywords);
}

function identifyRelatedConcepts(data) {
    const concepts = new Set();
    if (data.understanding && data.understanding.domain) {
        switch (data.understanding.domain) {
            case 'technical':
                concepts.add('programming');
                concepts.add('technology');
                break;
            case 'scientific':
                concepts.add('research');
                concepts.add('analysis');
                break;
            case 'creative':
                concepts.add('design');
                concepts.add('innovation');
                break;
            default:
                concepts.add('general_knowledge');
        }
    }
    return Array.from(concepts);
}

function determineApproach(data) {
    const intent = data.understanding?.intent || 'unknown';
    const domain = data.understanding?.domain || 'general';
    
    // Map intent and domain to approach
    const approaches = {
        question: 'explanatory',
        command: 'instructional',
        statement: 'analytical',
        greeting: 'conversational'
    };
    
    return approaches[intent] || 'balanced';
}

function gatherConsiderations(data) {
    return {
        contextual: data.analysis?.relevantHistory?.length > 0,
        technical: data.understanding?.domain === 'technical',
        userLevel: determineUserLevel(data),
        complexity: assessComplexity(data)
    };
}

function determineUserLevel(data) {
    const technicalTerms = /\b(api|function|code|programming|algorithm)\b/i;
    const content = data.understanding?.components?.join(' ') || '';
    return technicalTerms.test(content) ? 'technical' : 'general';
}

function assessComplexity(data) {
    const requirements = data.understanding?.requirements || [];
    return requirements.length > 2 ? 'high' : 'moderate';
}

function buildResponseStructure(reasoning) {
    return {
        format: reasoning.considerations?.technical ? 'technical' : 'conversational',
        sections: determineResponseSections(reasoning),
        style: reasoning.approach
    };
}

function determineResponseSections(reasoning) {
    const sections = ['main_points'];
    if (reasoning.considerations?.technical) {
        sections.push('code_examples');
    }
    if (reasoning.considerations?.contextual) {
        sections.push('context_reference');
    }
    return sections;
}

function determineTone(reasoning) {
    if (reasoning.approach === 'conversational') return 'friendly';
    if (reasoning.approach === 'technical') return 'professional';
    return 'balanced';
}

function gatherExamples(reasoning) {
    const exampleTypes = [];
    if (reasoning.considerations?.technical) {
        exampleTypes.push('code');
    }
    if (reasoning.approach === 'explanatory') {
        exampleTypes.push('analogies');
    }
    return exampleTypes;
}

function checkCompleteness(response) {
    const missingElements = [];
    // Basic completeness checks
    if (!response) missingElements.push('empty_response');
    if (response?.length < 50) missingElements.push('too_short');
    return missingElements.length === 0;
}

function checkRelevance(response) {
    // Simple relevance check
    return true; // Implement more sophisticated checks as needed
}

function assessClarity(response) {
    // Basic clarity checks
    const unclear = /\b(unclear|confusing|hard to understand)\b/i;
    return !unclear.test(response);
}

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
        const query = message;
        const reasoningSteps = {};
        
        // Execute each reasoning step
        reasoningSteps.understand = aiThinkingSteps.understand.process(query);
        reasoningSteps.analyze = aiThinkingSteps.analyze.process(chatHistory);
        reasoningSteps.reason = aiThinkingSteps.reason.process({
            understanding: reasoningSteps.understand,
            analysis: reasoningSteps.analyze
        });
        
        // Enhanced context with reasoning
        const enhancedContext = {
            reasoning: reasoningSteps,
            intent: reasoningSteps.understand.intent,
            domain: reasoningSteps.understand.domain,
            approach: reasoningSteps.reason.approach
        };

        // Add reasoning to the system message
        const systemMessage = `
            ${aiBasePrompt}
            
            Reasoning Context:
            ${JSON.stringify(enhancedContext, null, 2)}
            
            Based on this analysis:
            1. Domain: ${enhancedContext.domain}
            2. Intent: ${enhancedContext.intent}
            3. Approach: ${enhancedContext.approach}
            
            Please provide a well-reasoned response that addresses the user's needs.
        `;

        const contextSize = 15; // Increased context window
        const lastMessages = chatHistory.slice(-contextSize);
        
        // Create prioritized message array
        const prioritizedMessages = [
            {
                role: 'system',
                content: systemMessage
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
            // Verify response before sending
            reasoningSteps.verify = aiThinkingSteps.verify.process(assistantMessage);
            
            // Remove double response
            removeThinkingProcess();
            removeTypingIndicator();
            
            // Cache the response
            responseCache[message] = assistantMessage;
            
            // Add assistant message to history
            chatHistory.push({ role: 'assistant', content: assistantMessage });
            
            // Display message only once
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
    
    let stepDelay = 0;
    Object.entries(aiThinkingSteps).forEach(([key, step], index) => {
        const stepDiv = document.createElement('div');
        stepDiv.classList.add('thinking-step');
        stepDiv.innerHTML = `
            <div class="step-header">
                <span class="step-number">${index + 1}</span>
                <span class="step-label">${step.label}</span>
            </div>
            <div class="step-content"></div>
        `;
        thinkingDiv.appendChild(stepDiv);
        
        setTimeout(() => {
            stepDiv.classList.add('active');
            if (index > 0) {
                thinkingDiv.children[index - 1].classList.add('complete');
            }
            chat.scrollTop = chat.scrollHeight;
        }, stepDelay);
        
        stepDelay += 1000;
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
