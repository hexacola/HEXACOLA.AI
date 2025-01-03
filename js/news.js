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
    newsContent.innerHTML = getLoadingHTML();
    await fetchAndDisplayNews();
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
 * Handle Search
 */
async function handleSearch() {
    currentPage = 1;
    currentQuery = searchInput.value.trim() || 'generative AI OR AI-generated images OR AI text generation';
    newsContent.innerHTML = getLoadingHTML();
    await fetchAndDisplayNews();
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
        const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(currentQuery)}&apiKey=${NEWS_API_KEY}&pageSize=5&page=${currentPage}`;
        const response = await fetch(newsApiUrl);
        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            if (!append) {
                newsContent.innerHTML = '<p>No news found. Try a different search.</p>';
            }
            loadMoreBtn.style.display = 'none';
            return;
        }

        const newsHTML = await Promise.all(data.articles.map(async article => {
            const summary = await summarizeArticle(article.description);
            return createNewsItemHTML(article, summary);
        }));

        if (append) {
            newsContent.innerHTML += newsHTML.join('');
        } else {
            newsContent.innerHTML = newsHTML.join('');
        }

        loadMoreBtn.style.display = 'block';
    } catch (error) {
        console.error('Error fetching news:', error);
        if (!append) {
            newsContent.innerHTML = '<p>Error loading news. Please try again later.</p>';
        }
    }
}

/**
 * Summarize Article using SearchGPT
 * @param {string} description - Article description
 * @returns {Promise<string>} - Summarized description
 */
async function summarizeArticle(description) {
    try {
        const response = await fetch(`${POLLINATIONS_API}/summarize?text=${encodeURIComponent(description)}&model=searchgpt`);
        const data = await response.json();
        return data.summary || description;
    } catch (error) {
        console.error('Error summarizing article:', error);
        return description;
    }
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
