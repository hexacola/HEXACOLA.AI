// News Functionality for Hexacola AI

// Configuration
const NEWS_API_KEY = 'ea37165cf83f4edc9d788fe7ab18cb89';
const POLLINATIONS_API = 'https://text.pollinations.ai';
let currentPage = 1;
let currentQuery = 'generative AI OR AI-generated images OR AI text generation';

// DOM Elements
const newsContent = document.getElementById('newsContent');
const loadMoreBtn = document.getElementById('loadMoreNews');
const searchInput = document.getElementById('newsSearchInput');
const searchBtn = document.getElementById('searchNewsBtn');
const toggleBtn = document.getElementById('toggleNewsSidebar');
const closeBtn = document.getElementById('closeSidebar');
const sidebar = document.getElementById('newsSidebar');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeNews);
loadMoreBtn.addEventListener('click', loadMoreNews);
searchBtn.addEventListener('click', handleSearch);
toggleBtn.addEventListener('click', toggleSidebar);
closeBtn.addEventListener('click', closeSidebar);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

/**
 * Initialize News Sidebar
 */
async function initializeNews() {
    try {
        newsContent.innerHTML = getLoadingHTML();
        await fetchAndDisplayNews();
    } catch (error) {
        handleError('Failed to initialize news feed');
    }
}

/**
 * Toggle Sidebar Visibility
 */
function toggleSidebar() {
    sidebar.classList.toggle('active');
}

/**
 * Close Sidebar
 */
function closeSidebar() {
    sidebar.classList.remove('active');
}

/**
 * Handle Search with Debouncing
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

const debouncedSearch = debounce(async () => {
    currentPage = 1;
    const searchTerm = searchInput.value.trim();
    currentQuery = searchTerm || 'generative AI OR AI-generated images OR AI text generation';
    newsContent.innerHTML = getLoadingHTML();
    await fetchAndDisplayNews();
}, 500);

async function handleSearch() {
    await debouncedSearch();
}

/**
 * Load More News
 */
async function loadMoreNews() {
    currentPage++;
    await fetchAndDisplayNews(true);
}

/**
 * Fetch and Display News
 * @param {boolean} append - Whether to append or replace content
 */
async function fetchAndDisplayNews(append = false) {
    try {
        const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(currentQuery)}&apiKey=${NEWS_API_KEY}&pageSize=5&page=${currentPage}&language=en&sortBy=publishedAt`;
        const response = await fetch(newsApiUrl);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'error') {
            throw new Error(data.message || 'News API error');
        }

        if (!data.articles || data.articles.length === 0) {
            handleNoResults(append);
            return;
        }

        await displayNewsArticles(data.articles, append);
    } catch (error) {
        handleError(error.message);
    }
}

/**
 * Display News Articles
 * @param {Array} articles - Array of article objects
 * @param {boolean} append - Whether to append or replace content
 */
async function displayNewsArticles(articles, append) {
    try {
        const newsHTML = await Promise.all(
            articles.map(async article => {
                const sanitizedArticle = sanitizeArticle(article);
                const summary = await summarizeArticle(sanitizedArticle.description);
                return createNewsItemHTML(sanitizedArticle, summary);
            })
        );

        if (append) {
            newsContent.innerHTML += newsHTML.join('');
        } else {
            newsContent.innerHTML = newsHTML.join('');
        }

        loadMoreBtn.style.display = 'block';
    } catch (error) {
        handleError('Error displaying articles');
    }
}

/**
 * Summarize Article using SearchGPT with retry mechanism
 * @param {string} description - Article description
 * @returns {Promise<string>} - Summarized description
 */
async function summarizeArticle(description) {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const response = await fetch(`${POLLINATIONS_API}/summarize?text=${encodeURIComponent(description)}&model=searchgpt`);
            
            if (!response.ok) {
                throw new Error(`Summarization API responded with status: ${response.status}`);
            }

            const data = await response.json();
            return data.summary || description;
        } catch (error) {
            retries++;
            if (retries === maxRetries) {
                console.warn('Summarization failed, using original description:', error);
                return description;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
    }
    return description;
}

/**
 * Sanitize Article Data
 * @param {Object} article - Article data
 * @returns {Object} - Sanitized article
 */
function sanitizeArticle(article) {
    return {
        title: sanitizeHTML(article.title || 'No title available'),
        description: sanitizeHTML(article.description || 'No description available'),
        url: article.url || '#',
        urlToImage: article.urlToImage || '',
        publishedAt: article.publishedAt || new Date().toISOString()
    };
}

/**
 * Sanitize HTML content
 * @param {string} str - HTML string
 * @returns {string} - Sanitized string
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Handle No Results
 * @param {boolean} append - Whether to append or replace content
 */
function handleNoResults(append) {
    if (!append) {
        newsContent.innerHTML = '<p>No news found. Try a different search.</p>';
    }
    loadMoreBtn.style.display = 'none';
}

/**
 * Handle Error
 * @param {string} message - Error message
 */
function handleError(message) {
    console.error(message);
    newsContent.innerHTML = `<p>${message}. Please try again later.</p>`;
}

/**
 * Create News Item HTML
 * @param {Object} article - Article data
 * @param {string} summary - Summarized description
 * @returns {string} - HTML string
 */
function createNewsItemHTML(article, summary) {
    return `
        <div class="news-item">
            ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" onerror="this.style.display='none'">` : ''}
            <h4><a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a></h4>
            <p>${summary}</p>
            <small>${new Date(article.publishedAt).toLocaleDateString()}</small>
        </div>
    `;
}

/**
 * Get Loading HTML
 * @returns {string} - Loading indicator HTML
 */
function getLoadingHTML() {
    return `
        <div class="news-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading news...</span>
        </div>
    `;
}
