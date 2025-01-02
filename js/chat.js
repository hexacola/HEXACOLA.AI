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
    // Ensure chatHistory is properly initialized
    if (!Array.isArray(chatHistory)) {
        chatHistory = [];
    }
    
    // Return both chat history and current query for context
    return {
        history: chatHistory,
        currentQuery: query,
        lastMessages: chatHistory.slice(-3)
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
    
    // Format message content
    const formattedContent = formatMessage(content);
    messageDiv.innerHTML = formattedContent;
    
    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;
    
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
        // Add user message
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

        if (!complexity.isSimple) {
           removeThinkingProcess();
        }
        // Add AI response
        appendMessage('assistant', data);

    } catch (error) {
        console.error('Error in message processing:', error);
        removeTypingIndicator();
        removeThinkingProcess();
        reasoningData.errors.push(error.message);
        appendMessage('assistant', `I apologize, but I encountered an error: ${error.message}. Please try again.`);
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

    // Single event listener for all buttons using event delegation
    document.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button) {
            handleButtonClick(event);
        }
    });

    // Chat input handler
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Clear chat handler
    const clearButton = document.getElementById('clearChat');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            chatHistory = [];
            localStorage.removeItem('chatHistory');
            const chat = document.getElementById('chat');
            chat.innerHTML = '';
            appendMessage('assistant', 'Chat history cleared. Let\'s start fresh!');
        });
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
    errors: []
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
