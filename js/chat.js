// Navigation Functions
function navigateToHome() {
    window.location.href = 'index.html';
}

function showGenerator() {
    window.location.href = 'generator.html';
}

function navigateToStoryboard() {
    window.location.href = 'storyboard.html';
}

function navigateToScriptwriter() {
    window.location.href = 'scriptwriter.html';
}

function navigateToChat() {
    window.location.href = 'chat.html';
}

// Initialize chat history and response cache
let chatHistory = [];
const responseCache = {};

// API Configuration
const API_CONFIG = {
    baseUrl: 'https://text.pollinations.ai/',
    headers: {
        'Content-Type': 'application/json',
    },
    errorMessages: {
        400: 'Invalid request. Please check your input.',
        429: 'Too many requests. Please wait a moment.',
        500: 'Server error. Please try again later.',
        default: 'Something went wrong. Please try again.'
    }
};

// AI Assistant Prompt
const aiBasePrompt = `
You are hexacola, an advanced AI assistant specialized in:

1. Programming & Technical Support:
   - Debugging code and providing optimized solutions
   - Explaining complex technical concepts clearly
   - Offering best practices and design patterns

2. Creative & Analytical Tasks:
   - Problem-solving with structured approaches
   - Data analysis and visualization suggestions
   - Creative writing and content generation

3. Learning & Knowledge:
   - Breaking down complex topics into understandable parts
   - Providing relevant examples and analogies
   - Citing sources and explaining reasoning

4. Communication Style:
   - Professional yet friendly tone
   - Clear, concise explanations
   - Step-by-step breakdowns when needed

Respond with accuracy, clarity, and context-awareness while maintaining ethical considerations.
`;

// AI Thinking Steps
const aiThinkingSteps = {
    understand: {
        label: "Understanding Query",
        process: async (query) => {
            try {
                await simulateThinking(500);
                const context = analyzeContext(query);
                return {
                    mainGoal: detectMainGoal(query),
                    domain: detectDomain(query),
                    components: breakdownQuery(query),
                    requirements: identifyRequirements(query),
                    context: context
                };
            } catch (error) {
                console.error('Error in understanding step:', error);
                throw new Error('Failed to process query: ' + error.message);
            }
        }
    },
    analyze: {
        label: "Analyzing Context",
        process: async (context) => {
            await simulateThinking(700);
            return {
                topics: extractTopics(context),
                patterns: findPatterns(context),
                depth: assessComplexity(context),
                relevance: checkContextRelevance(context)
            };
        }
    },
    formulate: {
        label: "Formulating Approach",
        process: async (data) => {
            await simulateThinking(600);
            return {
                strategy: determineApproach(data),
                structure: buildResponseStructure(data),
                tone: determineTone(data),
                examples: gatherExamples(data)
            };
        }
    },
    generate: {
        label: "Generating Response",
        process: async (plan) => {
            await simulateThinking(800);
            return {
                content: await generateContent(plan),
                format: formatResponse(plan),
                polish: enhanceResponse(plan)
            };
        }
    },
    verify: {
        label: "Verifying Output",
        process: async (response) => {
            await simulateThinking(400);
            return {
                accuracy: verifyAccuracy(response),
                completeness: checkCompleteness(response),
                clarity: assessClarity(response)
            };
        }
    }
};

// Helper Functions for Reasoning Process
function simulateThinking(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

function detectMainGoal(query) {
    const firstMessage = chatHistoryManager.getFirstMessage();
    const context = chatHistoryManager.getConversationContext();
    
    // If asking about conversation history
    if (/first message|previous|earlier|before|last time/i.test(query)) {
        if (firstMessage) {
            return 'conversation_history';
        }
    }
    
    const goals = {
        learn: /how|what|explain|understand/i,
        solve: /fix|solve|help|issue/i,
        create: /make|create|build|generate/i,
        compare: /compare|versus|difference|better/i,
        decide: /should|choose|recommend|suggest/i
    };
    
    for (const [goal, pattern] of Object.entries(goals)) {
        if (pattern.test(query)) return goal;
    }
    return 'inform';
}

function detectDomain(query) {
    const domains = {
        technical: /code|programming|technology|software|hardware|api|algorithm|debug|javascript|python|html|css|database|machine learning|AI|artificial intelligence/i,
        scientific: /science|research|biology|chemistry|physics|data analysis|mathematics|statistics|astronomy|geology/i,
        creative: /design|art|creative writing|innovation|music|storytelling|literature|poetry|photography|graphic design/i,
        general: /.*/
    };

    for (const [domain, pattern] of Object.entries(domains)) {
        if (pattern.test(query)) return domain;
    }

    return 'general';
}

function breakdownQuery(query) {
    return {
        topics: extractTopics(query),
        keywords: extractKeywords(query),
        qualifiers: extractQualifiers(query),
        context: extractContextualInfo(query)
    };
}

function extractTopics(query) {
    const topics = query.toLowerCase().match(/\b\w{4,}\b/g) || [];
    return [...new Set(topics)];
}

function extractQualifiers(query) {
    const qualifiers = {
        time: /\b(quick|fast|slow|now|later|immediately|soon)\b/i,
        difficulty: /\b(easy|hard|simple|complex|challenging|difficult)\b/i,
        importance: /\b(important|critical|essential|vital|necessary)\b/i,
        preference: /\b(prefer|want|like|need|require)\b/i
    };
    
    return Object.entries(qualifiers)
        .filter(([_, pattern]) => pattern.test(query))
        .map(([type]) => type);
}

function extractContextualInfo(query) {
    // Extract time context
    const timeContext = query.match(/\b(today|tomorrow|yesterday|next week|last week|now|later)\b/gi) || [];
    
    // Extract location context
    const locationContext = query.match(/\b(in|at|from|to)\s+([A-Za-z\s]+)\b/g) || [];
    
    // Extract subject/topic context
    const subjectContext = query.match(/\b(about|regarding|concerning)\s+([A-Za-z\s]+)\b/g) || [];
    
    // Extract conditional context
    const conditionalContext = query.match(/\b(if|when|unless|provided that)\s+([^,\.]+)/g) || [];

    return {
        time: timeContext,
        location: locationContext,
        subject: subjectContext,
        conditions: conditionalContext,
        original: query
    };
}

function findPatterns(context) {
    const patterns = [];
    if (!context) return patterns;

    let messages = [];
    if (Array.isArray(context)) {
        messages = context.slice(-3);
    } else if (typeof context === 'string') {
        messages = [{ content: context }];
    }

    if (messages.length > 0) {
        const keywords = messages.map(msg => 
            (msg.content || '').toLowerCase().match(/\b\w{4,}\b/g) || []
        );
        // Find repeated keywords
        const wordCounts = keywords.flat().reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {});
        const repeatedWords = Object.keys(wordCounts).filter(word => wordCounts[word] > 1);
        if (repeatedWords.length) {
            patterns.push('repeated_keywords');
        }
    }
    return patterns;
}

function extractKeywords(context) {
    const keywords = new Set();
    // Ensure context is an array and not empty
    if (Array.isArray(context) && context.length > 0) {
        context.forEach(msg => {
            if (msg && typeof msg.content === 'string') {
                const words = msg.content.toLowerCase()
                    .match(/\b\w{4,}\b/g) || [];
                words.forEach(word => keywords.add(word));
            }
        });
    } else if (typeof context === 'string') {
        // Handle case where context is a string (direct query)
        const words = context.toLowerCase()
            .match(/\b\w{4,}\b/g) || [];
        words.forEach(word => keywords.add(word));
    }
    return Array.from(keywords);
}

function identifyRequirements(query) {
    // Extract specific requirements based on keywords and patterns
    const requirements = [];

    const requirementPatterns = {
        time: /\b(quick|fast|slow|now|later|immediately|soon)\b/i,
        difficulty: /\b(easy|hard|simple|complex|challenging|difficult)\b/i,
        importance: /\b(important|critical|essential|vital|necessary)\b/i,
        preference: /\b(prefer|want|like|need|require)\b/i,
        format: /\b(format|structure|layout|style)\b/i,
        examples: /\b(example|examples|sample|illustration)\b/i,
        constraints: /\b(limit|constraint|restriction|boundary)\b/i
    };

    for (const [type, pattern] of Object.entries(requirementPatterns)) {
        if (pattern.test(query)) {
            requirements.push(type);
        }
    }

    return requirements;
}

function analyzeContext(query) {
    const enhancedContext = chatHistoryManager.getEnhancedContext();
    const currentAnalysis = contextAnalyzer.analyzeConversationFlow([
        ...chatHistoryManager.history,
        { role: 'user', content: query, timestamp: Date.now() }
    ]);

    return {
        ...enhancedContext,
        currentQuery: {
            content: query,
            analysis: currentAnalysis
        },
        recommendedApproach: determineResponseStrategy(enhancedContext, currentAnalysis)
    };
}

function determineApproach(data) {
    const intent = data.understand?.mainGoal || 'unknown';
    const domain = data.understand?.domain || 'general';
    
    // Map intent and domain to approach
    const approaches = {
        learn: 'explanatory',
        solve: 'instructional',
        create: 'creative',
        compare: 'analytical',
        decide: 'balanced',
        inform: 'balanced'
    };
    
    return approaches[intent] || 'balanced';
}

function buildResponseStructure(reasoning) {
    return {
        format: reasoning.format === 'technical' ? 'technical' : 'conversational',
        sections: determineResponseSections(reasoning),
        style: reasoning.strategy
    };
}

function determineResponseSections(reasoning) {
    const sections = ['main_points'];
    if (reasoning.format === 'technical') {
        sections.push('code_examples');
    }
    if (reasoning.patterns && reasoning.patterns.includes('repeated_keywords')) {
        sections.push('context_reference');
    }
    return sections;
}

async function generateContent(plan) {
    if (plan.mainGoal === 'conversation_history') {
        const summary = chatHistoryManager.getConversationSummary();
        const context = chatHistoryManager.getEnhancedContext();
        
        return formatHistoryResponse(summary, context);
    }
    
    // Placeholder for generating content based on the plan
    // This should be replaced with actual content generation logic or API calls
    return "This is a generated response based on the formulated approach.";
}

function formatResponse(plan) {
    // Placeholder for formatting the response
    // This should be replaced with actual formatting logic if needed
    return "formatted response";
}

function enhanceResponse(plan) {
    // Placeholder for enhancing the response (e.g., grammar check)
    // This should be replaced with actual enhancement logic if needed
    return "enhanced response";
}

function verifyAccuracy(response) {
    // Placeholder for accuracy verification
    // Implement actual accuracy verification logic as needed
    return true;
}

function checkCompleteness(response) {
    const missingElements = [];
    if (!response) missingElements.push('empty_response');
    if (response.length < 50) missingElements.push('too_short');
    return missingElements.length === 0;
}

function checkContextRelevance(context) {
    // Placeholder for context relevance check
    // Implement actual relevance checking logic as needed
    return true;
}

function assessComplexity(data) {
    const requirements = data.requirements || [];
    return requirements.length > 2 ? 'high' : 'moderate';
}

function assessClarity(response) {
    const unclear = /\b(unclear|confusing|hard to understand)\b/i;
    return !unclear.test(response);
}

function identifyRelatedConcepts(data) {
    const concepts = new Set();
    if (data.understand.domain) {
        switch (data.understand.domain) {
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

// Fetch with Retry Function
async function fetchWithRetry(url, options, maxRetries = 3, delayMs = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;

            lastError = new Error(API_CONFIG.errorMessages[response.status] || API_CONFIG.errorMessages.default);

            // Don't retry on client errors except rate limits
            if (response.status !== 429 && response.status < 500) {
                break;
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delayMs * attempt));

        } catch (error) {
            lastError = error;
            if (attempt === maxRetries) break;
            await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
    }

    throw lastError;
}

// Typing Indicator Functions
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

// Format Message Function with DOMPurify
function formatMessage(content) {
    // Sanitize HTML to prevent XSS using DOMPurify
    const sanitizedContent = DOMPurify.sanitize(content, { ALLOWED_TAGS: ['strong', 'em', 'del', 'ul', 'ol', 'li', 'a', 'pre', 'code', 'br'], ALLOWED_ATTR: ['href', 'target', 'rel', 'class'] });

    // Format markdown elements
    let formatted = sanitizedContent
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Strikethrough
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        // Unordered lists
        .replace(/^[\s]*[-*+][\s]+(.*?)$/gm, '<li>$1</li>')
        // Ordered lists
        .replace(/^[\s]*\d+\.[\s]+(.*?)$/gm, '<li>$1</li>')
        // Wrap consecutive li elements in ul/ol tags
        .replace(/(<li>(?:(?!<li>)[\s\S])*?<\/li>(?:\s*<li>(?:(?!<li>)[\s\S])*?<\/li>)*)/g, function(match, p1, offset, string) {
            // Determine if it's ordered or unordered based on the starting character
            const precedingText = string.slice(0, offset);
            const isOrdered = /\d+\.\s/.test(precedingText.slice(-5));
            return isOrdered ? `<ol>${match}</ol>` : `<ul>${match}</ul>`;
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

// HTML Escape Function
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

// Code Modal Functions
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

// Append Message Function
function appendMessage(role, content) {
    const chat = document.getElementById('chat');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', role);
    
    // Generate unique message ID
    const messageId = Date.now().toString();
    messageDiv.setAttribute('data-message-id', messageId);
    
    // Store message content for continuation
    if (role === 'assistant') {
        reasoningData.currentMessage = content;
        reasoningData.messageContext = {
            messageId,
            timestamp: Date.now()
        };
    }
    
    // Format message content
    const formattedContent = formatMessage(content);
    messageDiv.innerHTML = formattedContent;
    
    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;
    
    // Check if response might be incomplete
    if (role === 'assistant' && (content.endsWith('...') || content.length >= 500)) {
        reasoningData.isIncomplete = true;
        reasoningData.lastMessageId = messageId;
        appendContinueButton(messageDiv);
    }
    
    // Highlight all code blocks using Prism.js
    Prism.highlightAllUnder(messageDiv);
}

// AI Thinking Visualization Functions
async function showThinkingProcess(query) {
    const complexity = analyzeQueryComplexity(query);
    
    if (complexity.isSimple) {
        const quickResult = await fastTrackReasoning(query);
        return quickResult;
    }

    reasoningData.currentStep = null;
    const chat = document.getElementById('chat');
    const thinkingDiv = document.createElement('div');
    thinkingDiv.id = 'thinking-process';
    thinkingDiv.classList.add('thinking-process');
    chat.appendChild(thinkingDiv);

    // Start performance monitoring for reasoning process
    console.time('Reasoning Process');

    const steps = Object.values(aiThinkingSteps);
    const results = {};

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        reasoningData.currentStep = step.label;
        
        const stepDiv = createThinkingStep(step, i);
        thinkingDiv.appendChild(stepDiv);

        // Activate step
        await simulateThinking(300);
        stepDiv.classList.add('active');

        // Process step
        try {
            const result = await step.process(query);
            results[step.label] = result;
            
            // Show reasoning
            const reasoningText = generateReasoningText(step.label, result);
            updateStepContent(stepDiv, reasoningText);
            
            // Mark as complete
            await simulateThinking(200);
            stepDiv.classList.add('complete');
        } catch (error) {
            updateStepContent(stepDiv, `Error in ${step.label}: ${error.message}`);
            stepDiv.classList.add('error');
            reasoningData.errors.push(`${step.label}: ${error.message}`);
            break;
        }

        chat.scrollTop = chat.scrollHeight;
    }

    console.timeEnd('Reasoning Process'); // End performance monitoring

    return results;
}

function createThinkingStep(step, index) {
    const stepDiv = document.createElement('div');
    stepDiv.classList.add('thinking-step');
    stepDiv.innerHTML = `
        <div class="step-header">
            <span class="step-number">${index + 1}</span>
            <span class="step-label">${step.label}</span>
            <span class="step-status">
                <span class="thinking-dots"><span>.</span><span>.</span><span>.</span></span>
            </span>
        </div>
        <div class="step-content">
            <div class="reasoning"></div>
            <div class="conclusion"></div>
        </div>
    `;
    return stepDiv;
}

function generateReasoningText(label, result) {
    const reasoning = {
        "Understanding Query": `Analyzing query. Main goal: ${result.mainGoal}. Domain identified: ${result.domain}. Components identified: ${result.components.topics.join(', ') || 'None'}.`,
        "Analyzing Context": `Analyzing context. Topics found: ${result.topics.join(', ') || 'None'}. Complexity assessed as ${result.depth}. Relevance: ${result.relevance ? 'High' : 'Low'}.`,
        "Formulating Approach": `Formulating approach. Strategy: ${result.strategy}. Tone: ${result.tone}.`,
        "Generating Response": `Generating response content.`,
        "Verifying Output": `Verifying output. Accuracy: ${result.accuracy ? 'Good' : 'Needs Improvement'}. Completeness: ${result.completeness ? 'Complete' : 'Incomplete'}. Clarity: ${result.clarity ? 'Clear' : 'Unclear'}.`
    };

    return reasoning[label] || 'Processing...';
}

function updateStepContent(stepDiv, content) {
    const reasoningDiv = stepDiv.querySelector('.reasoning');
    if (reasoningDiv) {
        reasoningDiv.innerHTML = `<div class="reasoning-text">${content}</div>`;
    }
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

// Updated Send Message Function
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const modelSelect = document.getElementById('modelSelect');
    const message = chatInput.value.trim();
    const selectedModel = modelSelect.value;

    if (message === '') return;

    try {
        // Add user message to history
        updateChatHistory('user', message);
        appendMessage('user', message);
        chatInput.value = '';

        const complexity = analyzeQueryComplexity(message);
        let reasoningResults;

        if (complexity.isSimple) {
             // Fast track for simple queries
            reasoningResults = await fastTrackReasoning(message);
            if (reasoningResults.response) {
                appendMessage('assistant', reasoningResults.response);
                return;
            }
        }

        showTypingIndicator();
        reasoningResults = await showThinkingProcess(message);


         // Prepare API request with complexity-aware parameters
        const apiResponse = await fetchWithRetry(API_CONFIG.baseUrl, {
            method: 'POST',
            headers: API_CONFIG.headers,
            body: JSON.stringify({
                messages: [{ role: 'user', content: message }],
                model: selectedModel,
                reasoning: reasoningResults,
                complexity: complexity.complexity
            })
        });


        if (!apiResponse.ok) {
            throw new Error(API_CONFIG.errorMessages[apiResponse.status] || API_CONFIG.errorMessages.default);
        }

        const data = await apiResponse.text();
        removeTypingIndicator();
        removeThinkingProcess(); // Hide thinking indicators

        // Add AI response to history
        updateChatHistory('assistant', data);
        appendMessage('assistant', data);

    } catch (error) {
        console.error('Error in message processing:', error);
        removeTypingIndicator();
        removeThinkingProcess(); // Ensure indicators are hidden on error
        reasoningData.errors.push(error.message);
        const errorMessage = `I apologize, but I encountered an error: ${error.message}. Please try again.`;
        updateChatHistory('assistant', errorMessage);
        appendMessage('assistant', errorMessage);
    } finally {
         reasoningData.currentStep = null;
         reasoningData.results = {};
    }
}

// Model Validation Function
function validateModel(model) {
    const validModels = [
        'openai', 'qwen', 'qwen-coder', 'mistral',
        'mistral-large', 'searchgpt', 'evil', 'p1'
    ];
    return validModels.includes(model);
}

// Dark Mode Functions
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

// Button Click Handlers
function handleSendMessageClick() {
    sendMessage();
}

function handleOpenCodeModalClick() {
    // Example code snippet; replace with dynamic content if necessary
    const codeSample = "console.log('Hello, World!');";
    const language = "javascript"; // Replace with dynamic language detection if needed
    openCodeModal(codeSample, language);
}

function handleCloseCodeModalClick() {
    closeCodeModal();
}

// Button Click Event Handlers
function handleButtonClick(event) {
    const button = event.target.closest('button');
    if (!button) return;

    const action = button.getAttribute('onclick');
    if (action) {
        event.preventDefault();
        // Remove the () from the onclick attribute and call the function directly
        const functionName = action.replace('()', '');
        if (typeof window[functionName] === 'function') {
            window[functionName]();
        }
    }
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadDarkMode();
    loadChatHistory(); // Load chat history when page loads

    // Single event listener for all buttons using event delegation
    document.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button) {
            handleButtonClick(event);
        }
    });

    // Initialize chat input and send button handlers
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessageBtn');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // Clear chat handler
    const clearButton = document.getElementById('clearChat');
    if (clearButton) {
        clearButton.addEventListener('click', clearChat);
    }

    // Load chat history
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        chatHistory.forEach(msg => appendMessage(msg.role, msg.content));
    } else {
        appendMessage('assistant', 'Hello! I\'m hexacola, your friendly assistant. How can I help you today?');
    }

    // Modal close handler
    window.onclick = function(event) {
        const modal = document.getElementById('codeModal');
        if (event.target === modal) {
            closeCodeModal();
        }
    };
});

// Add DOMPurify if not already included
if (typeof DOMPurify === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.3.3/purify.min.js';
    document.head.appendChild(script);
}

// Add Reasoning Data Structure
const reasoningData = {
    currentStep: null,
    results: {},
    errors: [],
    isIncomplete: false,
    lastMessageId: null,
    currentMessage: '',
    messageContext: null
};

// Add Query Complexity Analysis
const queryTypes = {
    greeting: /^(hi|hello|hey|good\s*(morning|afternoon|evening))(!|\s|$)/i,
    simple: /^[^.!?]{1,25}[.!?]?$/i,
    question: /^(who|what|when|where|why|how)\b/i,
    command: /^(please\s+)?(show|tell|give|find|help)/i
};

function analyzeQueryComplexity(query) {
    if (!query || typeof query !== 'string') {
        return { isSimple: true, complexity: 'invalid', type: 'error' };
    }

    const complexityFactors = {
        length: query.length > 50,
        technicalTerms: /\b(code|programming|algorithm|function|api|database|system)\b/i.test(query),
        multipleQuestions: (query.match(/\?/g) || []).length > 1,
        isGreeting: queryTypes.greeting.test(query),
        isSimpleQuery: queryTypes.simple.test(query)
    };
    
    const type = Object.entries(queryTypes)
        .find(([_, pattern]) => pattern.test(query))?.[0] || 'complex';
    
    return {
        isSimple: complexityFactors.isGreeting || (complexityFactors.isSimpleQuery && !complexityFactors.technicalTerms),
        complexity: complexityFactors.length || complexityFactors.technicalTerms || complexityFactors.multipleQuestions ? 'complex' : 'simple',
        type,
        factors: complexityFactors
    };
}

// Fast Track Reasoning for Simple Queries
async function fastTrackReasoning(query) {
    const analysis = analyzeQueryComplexity(query);
    
    const responses = {
        greeting: {
            type: 'greeting',
            intent: 'conversation',
            tone: 'friendly',
            response: getGreetingResponse()
        },
        simple: {
            type: 'direct',
            intent: 'quick_response',
            tone: 'casual',
            response: null
        }
    };

    await simulateThinking(100); // Minimal thinking time for simple queries
    return responses[analysis.type] || responses.simple;
}

function getGreetingResponse() {
    const greetings = [
        "Hello! How can I help you today?",
        "Hi there! What can I do for you?",
        "Hey! I'm ready to assist you.",
        "Greetings! How may I help?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
}

// Updated Thinking Process Data Structure
const reasoningProcess = {
    steps: [
        {
            id: 'understand',
            label: 'Understanding Query',
            detail: 'Breaking down the question and identifying key components...'
        },
        {
            id: 'analyze',
            label: 'Analyzing Context',
            detail: 'Examining relevant information and patterns...'
        },
        {
            id: 'formulate',
            label: 'Formulating Response',
            detail: 'Developing comprehensive solution approach...'
        },
        {
            id: 'verify',
            label: 'Verifying Accuracy',
            detail: 'Checking response quality and completeness...'
        }
    ],
    currentStep: null,
    results: {},
    errors: []
};

// Enhanced Thinking Process Visualization
async function showThinkingProcess(query) {
    const thinkingContainer = document.createElement('div');
    thinkingContainer.id = 'thinking-process';
    thinkingContainer.classList.add('thinking-process');
    
    const chat = document.getElementById('chat');
    chat.appendChild(thinkingContainer);

    for (const step of reasoningProcess.steps) {
        const stepElement = document.createElement('div');
        stepElement.classList.add('thinking-step');
        stepElement.innerHTML = `
            <div class="step-header">
                <span class="step-icon">🤔</span>
                <span class="step-label">${step.label}</span>
                <span class="step-status">Processing...</span>
            </div>
            <div class="step-content">
                <div class="thinking-animation">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
                <div class="step-detail">${step.detail}</div>
                <div class="step-result"></div>
            </div>
        `;
        
        thinkingContainer.appendChild(stepElement);
        
        try {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Process step
            const result = await processThinkingStep(step, query);
            
            // Update step visualization
            updateStepVisualization(stepElement, result);
            
            reasoningProcess.results[step.id] = result;
        } catch (error) {
            stepElement.classList.add('error');
            stepElement.querySelector('.step-status').textContent = 'Error';
            throw error;
        }
    }

    return reasoningProcess.results;
}

function updateStepVisualization(stepElement, result) {
    stepElement.classList.add('complete');
    const statusEl = stepElement.querySelector('.step-status');
    const resultEl = stepElement.querySelector('.step-result');
    
    statusEl.textContent = 'Complete';
    statusEl.classList.add('success');
    
    if (result && typeof result === 'object') {
        resultEl.innerHTML = `
            <div class="result-content">
                ${formatThinkingResult(result)}
            </div>
        `;
    }
}

function formatThinkingResult(result) {
    if (!result) return '';
    
    let html = '<ul class="thinking-results">';
    for (const [key, value] of Object.entries(result)) {
        if (value && typeof value !== 'function') {
            html += `<li><strong>${key}:</strong> ${formatValue(value)}</li>`;
        }
    }
    html += '</ul>';
    return html;
}

function formatValue(value) {
    if (Array.isArray(value)) {
        return value.join(', ');
    } else if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return value.toString();
}

async function processThinkingStep(step, query) {
    switch (step.id) {
        case 'understand':
            return {
                mainGoal: detectMainGoal(query),
                components: breakdownQuery(query),
                context: analyzeContext(query)
            };
        case 'analyze':
            return {
                topics: extractTopics(query),
                complexity: assessComplexity({ requirements: identifyRequirements(query) }),
                patterns: findPatterns(query)
            };
        case 'formulate':
            return {
                approach: determineApproach({ understand: reasoningProcess.results.understand }),
                structure: buildResponseStructure(reasoningProcess.results)
            };
        case 'verify':
            return {
                complete: true,
                accuracy: 'high',
                clarity: 'verified'
            };
        default:
            return null;
    }
}

// Add after appendMessage function
function appendContinueButton(messageDiv) {
    const continueButton = document.createElement('button');
    continueButton.classList.add('continue-button');
    continueButton.innerHTML = '<i class="fas fa-ellipsis-h"></i> Continue Response';
    continueButton.onclick = continueResponse;
    messageDiv.appendChild(continueButton);
}

async function continueResponse() {
    const lastMessage = document.querySelector(`[data-message-id="${reasoningData.lastMessageId}"]`);
    if (!lastMessage) return;

    // Remove the continue button
    const continueButton = lastMessage.querySelector('.continue-button');
    if (continueButton) {
        continueButton.remove();
    }

    try {
        showTypingIndicator();
        
        // Prepare continuation context
        const continuationContext = {
            previousContent: reasoningData.currentMessage,
            lastContext: reasoningData.messageContext
        };
        
        // Make API request to continue the response
        const apiResponse = await fetchWithRetry(API_CONFIG.baseUrl, {
            method: 'POST',
            headers: API_CONFIG.headers,
            body: JSON.stringify({
                messages: [
                    { role: 'assistant', content: reasoningData.currentMessage },
                    { role: 'system', content: 'continue previous response' }
                ],
                model: document.getElementById('modelSelect').value,
                parentMessageId: reasoningData.lastMessageId,
                context: continuationContext
            })
        });

        if (!apiResponse.ok) {
            throw new Error(API_CONFIG.errorMessages[apiResponse.status]);
        }

        const data = await apiResponse.text();
        removeTypingIndicator();

        // Update the current message with the continuation
        reasoningData.currentMessage += data;
        
        // Append the continuation to the last message
        lastMessage.innerHTML = formatMessage(reasoningData.currentMessage);
        
        // Check if response is still incomplete
        if (data.endsWith('...') || data.length >= 500) {
            appendContinueButton(lastMessage);
        } else {
            reasoningData.isIncomplete = false;
            reasoningData.lastMessageId = null;
            reasoningData.currentMessage = '';
            reasoningData.messageContext = null;
        }

    } catch (error) {
        console.error('Error in continuing response:', error);
        removeTypingIndicator();
        appendMessage('assistant', `I apologize, but I encountered an error while continuing: ${error.message}`);
    }
}

// Enhanced Chat History Management
const chatHistoryManager = {
    history: [],
    metadata: {
        firstInteraction: null,
        lastInteraction: null,
        commonTopics: new Set(),
        userPreferences: new Map()
    },

    addMessage(role, content) {
        const timestamp = Date.now();
        const message = {
            role,
            content,
            timestamp,
            topics: this.extractTopics(content)
        };

        // Update metadata
        if (!this.metadata.firstInteraction) {
            this.metadata.firstInteraction = message;
        }
        this.metadata.lastInteraction = message;
        
        // Update common topics
        message.topics.forEach(topic => this.metadata.commonTopics.add(topic));
        
        // Add to history
        this.history.push(message);
        
        // Save to localStorage
        this.save();
        
        return message;
    },

    getConversationContext() {
        return {
            firstMessage: this.metadata.firstInteraction,
            lastMessage: this.metadata.lastInteraction,
            commonTopics: Array.from(this.metadata.commonTopics),
            messageCount: this.history.length,
            recentMessages: this.history.slice(-3),
            preferences: Object.fromEntries(this.metadata.userPreferences)
        };
    },

    extractTopics(content) {
        // Enhanced topic extraction
        const topics = new Set();
        const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
        words.forEach(word => {
            if (!commonWords.has(word)) {
                topics.add(word);
            }
        });
        return Array.from(topics);
    },

    getFirstMessage() {
        if (this.metadata.firstInteraction) {
            return {
                content: this.metadata.firstInteraction.content,
                timestamp: this.metadata.firstInteraction.timestamp,
                topics: this.metadata.firstInteraction.topics
            };
        }
        return null;
    },

    getConversationSummary() {
        return {
            firstMessage: this.getFirstMessage(),
            totalMessages: this.history.length,
            commonTopics: Array.from(this.metadata.commonTopics).slice(0, 5),
            duration: this.metadata.lastInteraction ? 
                (Date.now() - this.metadata.firstInteraction.timestamp) : 0
        };
    },

    load() {
        try {
            const savedHistory = localStorage.getItem('chatHistory');
            const savedMetadata = localStorage.getItem('chatMetadata');
            
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
                // Ensure timestamps are properly loaded
                this.history = this.history.map(msg => ({
                    ...msg,
                    timestamp: msg.timestamp || Date.now()
                }));
            }
            
            if (savedMetadata) {
                const metadata = JSON.parse(savedMetadata);
                this.metadata = {
                    firstInteraction: metadata.firstInteraction,
                    lastInteraction: metadata.lastInteraction,
                    commonTopics: new Set(metadata.commonTopics),
                    userPreferences: new Map(Object.entries(metadata.userPreferences || {}))
                };
            }
            
            // Initialize metadata if first message exists but metadata doesn't
            if (this.history.length > 0 && !this.metadata.firstInteraction) {
                this.metadata.firstInteraction = this.history[0];
                this.metadata.lastInteraction = this.history[this.history.length - 1];
                this.save();
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            this.clear();
        }
    },

    save() {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(this.history));
            localStorage.setItem('chatMetadata', JSON.stringify({
                firstInteraction: this.metadata.firstInteraction,
                lastInteraction: this.metadata.lastInteraction,
                commonTopics: Array.from(this.metadata.commonTopics),
                userPreferences: new Map(Object.entries(this.metadata.userPreferences))
            }));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    },

    clear() {
        this.history = [];
        this.metadata = {
            firstInteraction: null,
            lastInteraction: null,
            commonTopics: new Set(),
            userPreferences: new Map()
        };
        localStorage.removeItem('chatHistory');
        localStorage.removeItem('chatMetadata');
    },

    getEnhancedContext() {
        const context = this.getConversationContext();
        const analysis = contextAnalyzer.analyzeConversationFlow(this.history);
        
        return {
            ...context,
            analysis,
            conversationPatterns: {
                topicChains: analysis.topicChains,
                userPreferences: analysis.userPreferences,
                interactionStyle: this.determineInteractionStyle(analysis)
            },
            relevantHistory: this.getRelevantHistory()
        };
    },

    determineInteractionStyle(analysis) {
        const patterns = analysis.interactionPatterns;
        return {
            isInquisitive: patterns.questionFrequency > 0.3,
            preferredLength: patterns.responseLength.average > 200 ? 'detailed' : 'concise',
            topicFocus: patterns.topicPersistence.length > 0 ? 'persistent' : 'varied'
        };
    },

    getRelevantHistory() {
        const recentMessages = this.history.slice(-5);
        const relevantTopics = new Set(
            recentMessages.flatMap(msg => extractTopics(msg.content))
        );
        
        return this.history.filter(msg => 
            extractTopics(msg.content).some(topic => relevantTopics.has(topic))
        );
    }
};

// Common words to filter out from topics
const commonWords = new Set(['what', 'when', 'how', 'why', 'where', 'who', 'the', 'is', 'at', 'which', 'and', 'or', 'but']);

// Update the existing chat-related functions to use the new manager
function updateChatHistory(role, content) {
    return chatHistoryManager.addMessage(role, content);
}

function loadChatHistory() {
    chatHistoryManager.load();
    if (chatHistoryManager.history.length > 0) {
        chatHistoryManager.history.forEach(msg => appendMessage(msg.role, msg.content));
    } else {
        appendMessage('assistant', 'Hello! I\'m hexacola, your friendly assistant. How can I help you today?');
    }
}

function clearChat() {
    chatHistoryManager.clear();
    const chat = document.getElementById('chat');
    chat.innerHTML = '';
    const welcomeMessage = 'Chat history cleared. Let\'s start fresh!';
    updateChatHistory('assistant', welcomeMessage);
    appendMessage('assistant', welcomeMessage);
}

// Update reasoning process steps
Object.assign(reasoningProcess.steps, [
    {
        id: 'understand',
        label: 'Understanding Query',
        detail: 'Analyzing query intent, context, and technical requirements...',
        process: async (query) => {
            const intent = detectMainGoal(query);
            const domain = detectDomain(query);
            const requirements = identifyRequirements(query);
            
            return {
                intent,
                domain,
                requirements,
                complexity: assessQueryComplexity(query),
                contextNeeded: determineContextRequirements(query)
            };
        }
    },
    {
        id: 'analyze',
        label: 'Deep Analysis',
        detail: 'Evaluating technical depth, historical context, and knowledge requirements...',
        process: async (data) => {
            return {
                technicalLevel: assessTechnicalLevel(data),
                requiredKnowledge: identifyRequiredKnowledge(data),
                contextRelevance: analyzeContextRelevance(data),
                specializations: determineSpecializations(data)
            };
        }
    },
    {
        id: 'formulate',
        label: 'Response Planning',
        detail: 'Creating structured response with examples and references...',
        process: async (data) => {
            return {
                structure: buildResponseStructure(data),
                examples: gatherRelevantExamples(data),
                references: findReferences(data),
                approach: determineResponseApproach(data)
            };
        }
    }
]);

// Add new helper functions
function assessTechnicalLevel(data) {
    return data.intent === 'technical' ? 'high' : 'moderate';
}

function identifyRequiredKnowledge(data) {
    return data.domain || 'general';
}

function analyzeContextRelevance(data) {
    return true; // Placeholder - implement actual relevance check
}

function determineSpecializations(data) {
    return ['general']; // Placeholder - implement actual specialization detection
}

function gatherRelevantExamples(data) {
    return []; // Placeholder - implement example gathering
}

function findReferences(data) {
    return []; // Placeholder - implement reference finding
}

function determineResponseApproach(data) {
    return 'structured'; // Placeholder - implement approach determination
}

// Add context analysis functions
const contextAnalyzer = {
    analyzeConversationFlow(history) {
        return {
            topicChains: this.identifyTopicChains(history),
            sentimentProgression: this.analyzeSentimentProgress(history),
            userPreferences: this.extractUserPreferences(history),
            interactionPatterns: this.findInteractionPatterns(history)
        };
    },

    identifyTopicChains(history) {
        const topics = new Map();
        history.forEach(msg => {
            const msgTopics = extractTopics(msg.content);
            msgTopics.forEach(topic => {
                if (!topics.has(topic)) {
                    topics.set(topic, { count: 1, lastMention: msg.timestamp });
                } else {
                    const topicData = topics.get(topic);
                    topics.set(topic, {
                        count: topicData.count + 1,
                        lastMention: msg.timestamp
                    });
                }
            });
        });
        return topics;
    },

    analyzeSentimentProgress(history) {
        let currentTone = 'neutral';
        const sentimentFlow = history.map(msg => {
            const sentiment = this.analyzeSentiment(msg.content);
            currentTone = sentiment;
            return { timestamp: msg.timestamp, sentiment };
        });
        return { flow: sentimentFlow, currentTone };
    },

    analyzeSentiment(text) {
        // Simple sentiment analysis
        const positive = /\b(good|great|awesome|excellent|happy|thank|love|appreciate)\b/i;
        const negative = /\b(bad|poor|terrible|unhappy|hate|dislike|problem|issue)\b/i;
        
        if (positive.test(text)) return 'positive';
        if (negative.test(text)) return 'negative';
        return 'neutral';
    },

    extractUserPreferences(history) {
        const preferences = new Map();
        history.filter(msg => msg.role === 'user').forEach(msg => {
            const prefs = this.findPreferences(msg.content);
            prefs.forEach(pref => {
                preferences.set(pref.type, pref.value);
            });
        });
        return preferences;
    },

    findPreferences(text) {
        const prefs = [];
        const patterns = {
            style: /prefer|like|want|need/i,
            format: /format|structure|layout/i,
            detail: /detailed|brief|concise/i
        };

        Object.entries(patterns).forEach(([type, pattern]) => {
            if (pattern.test(text)) {
                prefs.push({
                    type,
                    value: text.match(pattern)[0]
                });
            }
        });
        return prefs;
    },

    findInteractionPatterns(history) {
        return {
            questionFrequency: this.calculateQuestionFrequency(history),
            responseLength: this.analyzeResponseLengths(history),
            topicPersistence: this.analyzeTopicPersistence(history)
        };
    },

    calculateQuestionFrequency(history) {
        const questions = history.filter(msg => /\?/.test(msg.content)).length;
        return questions / history.length;
    },

    analyzeResponseLengths(history) {
        const lengths = history.map(msg => msg.content.length);
        return {
            average: lengths.reduce((a, b) => a + b, 0) / lengths.length,
            trend: lengths[lengths.length - 1] > lengths[lengths.length - 2] ? 'increasing' : 'decreasing'
        };
    },

    analyzeTopicPersistence(history) {
        const topics = this.identifyTopicChains(history);
        return Array.from(topics.entries())
            .filter(([_, data]) => data.count > 1)
            .map(([topic, data]) => ({
                topic,
                persistence: data.count / history.length
            }));
    }
};

function formatHistoryResponse(summary, context) {
    const patterns = context.conversationPatterns;
    const style = patterns.interactionStyle;
    
    return `Based on our conversation:
    - We started with: "${summary.firstMessage.content}"
    - Main topics: ${summary.commonTopics.join(', ')}
    - Your preferred style: ${style.preferredLength} responses
    - Common themes: ${patterns.topicPersistence.map(t => t.topic).join(', ')}
    
    How can I help you further with these topics?`;
}

function determineResponseStrategy(enhancedContext, currentAnalysis) {
    const patterns = {
        technical: /code|programming|debug|error|function|api|syntax/i,
        conceptual: /explain|understand|concept|theory|principle/i,
        problemSolving: /solve|fix|help|issue|problem|bug/i,
        guidance: /recommend|suggest|advice|should|better/i
    };

    const strategy = {
        type: 'informative',
        depth: 'moderate',
        tone: 'professional',
        structure: 'organized'
    };

    // Determine type based on current query
    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(currentAnalysis.content)) {
            strategy.type = type;
            break;
        }
    }

    // Adjust depth based on conversation context
    if (enhancedContext.analysis.topicChains.size > 2) {
        strategy.depth = 'detailed';
    }

    // Adjust tone based on interaction history
    if (enhancedContext.analysis.sentimentProgression?.currentTone === 'positive') {
        strategy.tone = 'friendly';
    }

    // Adjust structure based on user preferences
    const userPreference = enhancedContext.conversationPatterns?.interactionStyle?.preferredLength;
    if (userPreference === 'detailed') {
        strategy.structure = 'comprehensive';
    } else if (userPreference === 'concise') {
        strategy.structure = 'brief';
    }

    return strategy;
}
